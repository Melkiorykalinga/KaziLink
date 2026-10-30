const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../utils/prismaClient');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { upload, uploadToCloudinary, handleUploadError } = require('../utils/cloudinary');
const validate = require('../middleware/validate');
const { transactionCreateSchema } = require('../validators');

const prisma = new PrismaClient();

// Configurable commission rate (0% during free growth phase; set PLATFORM_COMMISSION_RATE=0.10 later)
const COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0');

// Helper: finalize transaction & credit worker/employer stats once payment is confirmed
async function finalizePayment(tx, transaction) {
  const updatedTx = await tx.transaction.update({
    where: { id: transaction.id },
    data: { status: 'RELEASED' }
  });

  await tx.job.update({
    where: { id: transaction.jobId },
    data: { status: 'COMPLETED' }
  });

  await tx.application.updateMany({
    where: { jobId: transaction.jobId, workerId: transaction.workerId, status: 'ACCEPTED' },
    data: { status: 'JOB_COMPLETED' }
  });

  const workerProfile = await tx.workerProfile.findUnique({
    where: { userId: transaction.workerId }
  });

  if (workerProfile) {
    await tx.workerProfile.update({
      where: { id: workerProfile.id },
      data: {
        totalEarned: workerProfile.totalEarned + updatedTx.workerAmount,
        totalJobsCompleted: workerProfile.totalJobsCompleted + 1
      }
    });
  }

  const employerProfile = await tx.employerProfile.findUnique({
    where: { userId: transaction.employerId }
  });

  if (employerProfile) {
    await tx.employerProfile.update({
      where: { id: employerProfile.id },
      data: {
        totalJobsPosted: employerProfile.totalJobsPosted + 1
      }
    });
  }

  return updatedTx;
}

// ============================================================
// POST /api/transactions/create → FUNDED (Direct P2P 0% Fee Mode)
// Employer creates transaction for an accepted worker
// ============================================================
router.post('/create', authenticate, requireRole(['EMPLOYER']), validate(transactionCreateSchema), async (req, res) => {
  try {
    const { jobId, workerId, paymentMethod } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this job' });

    const application = await prisma.application.findFirst({
      where: { jobId, workerId, status: 'ACCEPTED' }
    });
    if (!application) return res.status(400).json({ error: 'Worker is not accepted for this job' });

    const existing = await prisma.transaction.findFirst({
      where: { jobId, workerId, status: { notIn: ['CANCELLED'] } }
    });
    if (existing) return res.status(400).json({ error: 'An active transaction already exists for this job and worker' });

    const amount = job.payPerWorker;
    const commission = amount * COMMISSION_RATE;
    const workerAmount = amount - commission;

    const transaction = await prisma.transaction.create({
      data: {
        jobId,
        employerId: req.user.id,
        workerId,
        amount,
        commission,
        workerAmount,
        paymentMethod: paymentMethod || 'MPESA',
        status: 'FUNDED'
      }
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// ============================================================
// POST /api/transactions/fund → VERIFYING (Optional proof upload)
// ============================================================
router.post('/fund', authenticate, requireRole(['EMPLOYER']), upload.single('paymentProof'), handleUploadError, async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment proof image is required (JPG or PNG, max 2MB)' });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this transaction' });

    const secureUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: secureUrl,
        status: 'FUNDED'
      }
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fund transaction' });
  }
});

// ============================================================
// PATCH /api/transactions/verify/:id → FUNDED
// ============================================================
router.patch('/verify/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FUNDED' }
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

// ============================================================
// PATCH /api/transactions/start/:id → IN_PROGRESS
// Worker starts the job directly (no Admin wait required)
// ============================================================
router.patch('/start/:id', authenticate, requireRole(['WORKER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.workerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: This transaction is not assigned to you' });
    if (!['FUNDED', 'PENDING'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Job cannot be started from status: ' + transaction.status });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'IN_PROGRESS' }
    });

    await prisma.job.update({
      where: { id: transaction.jobId },
      data: { status: 'IN_PROGRESS' }
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start job' });
  }
});

// ============================================================
// PATCH /api/transactions/complete/:id → COMPLETED
// Worker marks the job as completed
// ============================================================
router.patch('/complete/:id', authenticate, requireRole(['WORKER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.workerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: This transaction is not assigned to you' });
    if (transaction.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Job must be IN_PROGRESS to complete. Current: ' + transaction.status });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' }
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete job' });
  }
});

// ============================================================
// POST /api/transactions/release/:id → VERIFYING (Employer Marked Paid)
// Employer marks that they have paid the worker directly (M-Pesa/Airtel/Tigo/Cash)
// Uses VERIFYING status to mean "Employer Marked Paid — Awaiting Worker Confirmation"
// ============================================================
router.post('/release/:id', authenticate, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this transaction' });
    if (transaction.status === 'RELEASED') return res.status(400).json({ error: 'Payment already confirmed' });
    if (transaction.status !== 'COMPLETED') return res.status(400).json({ error: 'Worker must mark job as COMPLETED first. Current: ' + transaction.status });

    const updatedTx = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'VERIFYING' }
    });

    res.json({
      success: true,
      transaction: updatedTx,
      message: 'Marked as paid! Waiting for worker to confirm receipt.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark payment as sent' });
  }
});

// ============================================================
// POST /api/transactions/confirm-receipt/:id → RELEASED
// Worker confirms they received the direct payment from Employer
// ============================================================
router.post('/confirm-receipt/:id', authenticate, requireRole(['WORKER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.workerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: Not your transaction' });
    if (transaction.status === 'RELEASED') return res.status(400).json({ error: 'Payment already confirmed' });
    if (!['VERIFYING', 'COMPLETED'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Cannot confirm payment at status: ' + transaction.status });
    }

    await prisma.$transaction(async (tx) => {
      await finalizePayment(tx, transaction);
    });

    res.json({ success: true, message: 'Payment receipt confirmed!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm payment receipt' });
  }
});

// ============================================================
// POST /api/transactions/:id/rate
// Employer rates and endorses a worker
// ============================================================
router.post('/:id/rate', authenticate, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    const { stars, reviewText } = req.body;
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!['RELEASED', 'VERIFYING', 'COMPLETED'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Job must be completed before rating' });
    }

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    const existingRating = await prisma.rating.findFirst({
      where: { jobId: transaction.jobId, raterId: req.user.id, rateeId: transaction.workerId }
    });

    if (existingRating) return res.status(400).json({ error: 'You have already rated this worker for this job' });

    const rating = await prisma.rating.create({
      data: {
        jobId: transaction.jobId,
        raterId: req.user.id,
        rateeId: transaction.workerId,
        stars,
        reviewText: reviewText ? reviewText.substring(0, 120) : null
      }
    });

    const allRatings = await prisma.rating.findMany({
      where: { rateeId: transaction.workerId }
    });
    const average = allRatings.reduce((acc, r) => acc + r.stars, 0) / allRatings.length;

    await prisma.workerProfile.update({
      where: { userId: transaction.workerId },
      data: { averageRating: average }
    });

    res.status(201).json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// ============================================================
// PATCH /api/transactions/cancel/:id → CANCELLED
// ============================================================
router.patch('/cancel/:id', authenticate, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const isOwner = transaction.employerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const nonCancellable = ['IN_PROGRESS', 'COMPLETED', 'VERIFYING', 'RELEASED', 'CANCELLED'];
    if (nonCancellable.includes(transaction.status)) {
      return res.status(400).json({ error: 'Cannot cancel a transaction with status: ' + transaction.status });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'CANCELLED' }
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel transaction' });
  }
});

// ============================================================
// GET /api/transactions/my
// Get transactions for the current user (includes phone numbers for direct P2P payment)
// ============================================================
router.get('/my', authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'EMPLOYER') {
      where.employerId = req.user.id;
    } else if (req.user.role === 'WORKER') {
      where.workerId = req.user.id;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        job: { select: { title: true, category: true, locationAddress: true } },
        employer: { select: { fullName: true, email: true, phone: true } },
        worker: { select: { fullName: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { upload, uploadToCloudinary, handleUploadError } = require('../utils/cloudinary');
const validate = require('../middleware/validate');
const { transactionCreateSchema, transactionFundSchema, transactionVerifySchema } = require('../validators');

const prisma = new PrismaClient();

// ============================================================
// POST /api/transactions/create → PENDING
// Employer creates escrow transaction for an accepted worker
// ============================================================
router.post('/create', authenticate, requireRole(['EMPLOYER']), validate(transactionCreateSchema), async (req, res) => {
  try {
    const { jobId, workerId, paymentMethod } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this job' });

    // Worker must have an ACCEPTED application
    const application = await prisma.application.findFirst({
      where: { jobId, workerId, status: 'ACCEPTED' }
    });
    if (!application) return res.status(400).json({ error: 'Worker is not accepted for this job' });

    // No duplicate active transactions for the same job+worker
    const existing = await prisma.transaction.findFirst({
      where: { jobId, workerId, status: { notIn: ['CANCELLED'] } }
    });
    if (existing) return res.status(400).json({ error: 'An active transaction already exists for this job and worker' });

    const amount = job.payPerWorker;
    const commission = amount * 0.10;
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
        status: 'PENDING'
      }
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// ============================================================
// POST /api/transactions/fund → VERIFYING
// Employer uploads payment proof, awaiting admin verification
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
    if (transaction.status !== 'PENDING') return res.status(400).json({ error: 'Can only fund PENDING transactions' });

    // Upload validated image buffer to Cloudinary
    const secureUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: secureUrl,
        status: 'VERIFYING'
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
// Admin verifies the payment proof
// ============================================================
router.patch('/verify/:id', authenticate, requireRole(['ADMIN']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.status !== 'VERIFYING') return res.status(400).json({ error: 'Can only verify VERIFYING transactions' });
    if (!transaction.paymentProof) return res.status(400).json({ error: 'No payment proof uploaded' });

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
// Worker starts the funded job
// ============================================================
router.patch('/start/:id', authenticate, requireRole(['WORKER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.workerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: This transaction is not assigned to you' });
    if (transaction.status !== 'FUNDED') return res.status(400).json({ error: 'Transaction must be FUNDED before starting. Current: ' + transaction.status });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'IN_PROGRESS' }
    });

    // Update job status to IN_PROGRESS
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
// POST /api/transactions/release/:id → RELEASED
// Employer releases escrowed funds to the worker
// ============================================================
router.post('/release/:id', authenticate, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this transaction' });
    if (transaction.status === 'RELEASED') return res.status(400).json({ error: 'Payment already released' });
    if (transaction.status !== 'COMPLETED') return res.status(400).json({ error: 'Worker must mark job as COMPLETED first. Current: ' + transaction.status });

    // Atomic: release funds + update job + credit worker stats
    await prisma.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'RELEASED' }
      });

      await tx.job.update({
        where: { id: transaction.jobId },
        data: { status: 'COMPLETED' }
      });

      // Update application status
      await tx.application.updateMany({
        where: { jobId: transaction.jobId, workerId: transaction.workerId, status: 'ACCEPTED' },
        data: { status: 'JOB_COMPLETED' }
      });

      // Credit worker profile
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

      // Credit employer profile
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
    });

    res.json({ success: true, message: 'Payment successfully released to worker' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to release payment' });
  }
});

// ============================================================
// PATCH /api/transactions/cancel/:id → CANCELLED
// Admin or Employer can cancel a transaction (only if not yet IN_PROGRESS)
// ============================================================
router.patch('/cancel/:id', authenticate, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    // Only owner employer or admin can cancel
    const isOwner = transaction.employerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    // Cannot cancel transactions that are already in progress or beyond
    const nonCancellable = ['IN_PROGRESS', 'COMPLETED', 'RELEASED', 'CANCELLED'];
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
// Get transactions for the current user
// ============================================================
router.get('/my', authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'EMPLOYER') {
      where.employerId = req.user.id;
    } else if (req.user.role === 'WORKER') {
      where.workerId = req.user.id;
    } else {
      // Admin gets all
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        job: { select: { title: true, category: true, locationAddress: true } },
        employer: { select: { fullName: true, email: true } },
        worker: { select: { fullName: true, email: true } }
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

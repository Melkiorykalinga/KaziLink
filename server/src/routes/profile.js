const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');

const prisma = new PrismaClient();

// Update worker availability
router.patch('/availability', authenticate, async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (req.user.role !== 'WORKER') {
      return res.status(403).json({ error: 'Only workers can update availability' });
    }

    if (!['AVAILABLE_NOW', 'AVAILABLE_THIS_WEEK', 'BUSY'].includes(availabilityStatus)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }

    const workerProfile = await prisma.workerProfile.update({
      where: { userId: req.user.id },
      data: { availabilityStatus }
    });

    res.json({ message: 'Availability updated', availabilityStatus: workerProfile.availabilityStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get Worker Portfolio
router.get('/worker/:id/portfolio', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all completed/released transactions for this worker
    const transactions = await prisma.transaction.findMany({
      where: {
        workerId: id,
        status: { in: ['COMPLETED', 'RELEASED'] }
      },
      include: {
        job: true,
        employer: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Find ratings given to this worker for these jobs
    const jobIds = transactions.map(t => t.jobId);
    const ratings = await prisma.rating.findMany({
      where: {
        rateeId: id,
        jobId: { in: jobIds }
      }
    });

    const portfolio = transactions.map(tx => {
      const rating = ratings.find(r => r.jobId === tx.jobId);
      return {
        id: tx.id,
        jobTitle: tx.job.title,
        jobCategory: tx.job.category,
        employerName: tx.employer.fullName,
        dateCompleted: tx.updatedAt,
        stars: rating?.stars || null,
        reviewSnippet: rating?.reviewText || null
      };
    });

    res.json({ portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load portfolio' });
  }
});

// Add Worker Skill
router.post('/worker/skills', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (req.user.role !== 'WORKER') {
      return res.status(403).json({ error: 'Only workers can add skills' });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!workerProfile) return res.status(404).json({ error: 'Profile not found' });

    const skill = await prisma.workerSkill.create({
      data: {
        workerProfileId: workerProfile.id,
        name,
        isVerified: false // Admin or system will verify later
      }
    });

    res.status(201).json({ skill });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Get Worker Profile Details (including skills and availability)
router.get('/worker/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await prisma.user.findUnique({
      where: { id },
      include: {
        workerProfile: {
          include: {
            verifiedSkills: true
          }
        }
      }
    });

    if (!worker || worker.role !== 'WORKER') {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get worker profile' });
  }
});

module.exports = router;

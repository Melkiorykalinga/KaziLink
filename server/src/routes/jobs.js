const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { jobCreateSchema, jobUpdateSchema } = require('../validators');

const prisma = new PrismaClient();

// POST /api/jobs -> Create a job (Employer only)
router.post('/', authenticate, requireRole(['EMPLOYER']), validate(jobCreateSchema), async (req, res) => {
  try {
    const {
      title, description, category, workersNeeded, jobDate, 
      startTime, durationHours, locationAddress, locationLat, locationLng,
      payPerWorker, specialRequirements, paymentMethod, applicationDeadline
    } = req.body;

    const platformFee = payPerWorker * 0.15;
    const totalPayWithFee = payPerWorker + platformFee;

    const job = await prisma.job.create({
      data: {
        employerId: req.user.id,
        title, description, category, workersNeeded, jobDate: new Date(jobDate),
        startTime, durationHours, locationAddress, locationLat, locationLng,
        payPerWorker, totalPayWithFee, paymentMethod, specialRequirements,
        applicationDeadline: new Date(applicationDeadline),
        status: 'ACTIVE' // or DRAFT based on UI logic
      }
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// GET /api/jobs -> List jobs (workers browsing, or employer history)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'EMPLOYER') {
      // Employers only see their own jobs -> IDOR protection
      const jobs = await prisma.job.findMany({
        where: { employerId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(jobs);
    } 
    
    // Workers browsing available jobs
    if (req.user.role === 'WORKER') {
      const category = req.query.category;
      let whereClause = { status: 'ACTIVE' };
      if (category) {
        whereClause.category = category;
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          employer: {
            select: { fullName: true, employerProfile: { select: { businessName: true, logoUrl: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(jobs);
    }
    
    res.status(403).json({ error: 'Admins have a separate route for jobs.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id -> Get job details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          select: { id: true, fullName: true, employerProfile: true, phone: true }
        }
      }
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Privacy: Don't expose employer phone to workers unless accepted (to be implemented later via Application status)
    if (req.user.role === 'WORKER') {
       // Only allow phone access if the worker has an accepted application for this job
       const app = await prisma.application.findFirst({
         where: { jobId: job.id, workerId: req.user.id, status: 'ACCEPTED' }
       });
       if (!app) {
         job.employer.phone = null;
       }
    }

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// PATCH /api/jobs/:id -> Edit job (Employer only)
router.patch('/:id', authenticate, requireRole(['EMPLOYER']), validate(jobUpdateSchema), async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    if (job.status !== 'DRAFT' && job.status !== 'ACTIVE') {
       return res.status(400).json({ error: 'Job must be DRAFT or ACTIVE to be modified' });
    }

    const updateData = { ...req.body };

    if (updateData.payPerWorker !== undefined) {
      const platformFee = updateData.payPerWorker * 0.15;
      updateData.totalPayWithFee = updateData.payPerWorker + platformFee;
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });

    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

module.exports = router;

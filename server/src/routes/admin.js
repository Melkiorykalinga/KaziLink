const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const prisma = new PrismaClient();

// Only allow ADMIN role in all these routes
router.use(authenticate, requireRole(['ADMIN']));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const completedJobs = await prisma.job.count({ where: { status: 'COMPLETED' } });
    
    const transactions = await prisma.transaction.aggregate({
      where: { status: 'RELEASED' },
      _sum: { commission: true }
    });
    
    // We can expand this heavily
    res.json({
      totalUsers,
      totalJobs,
      completedJobs,
      totalRevenue: transactions._sum.commission || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, fullName: true, role: true, 
        isActive: true, createdAt: true
      }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, email: true, isActive: true }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { status } = req.query;
    let where = {};
    if (status) {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        job: { select: { title: true, category: true } },
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

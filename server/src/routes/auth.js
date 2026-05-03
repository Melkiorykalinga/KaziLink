const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { userRegisterSchema, userLoginSchema } = require('../validators');

const prisma = new PrismaClient();

// User Registration
router.post('/register', validate(userRegisterSchema), async (req, res) => {
  try {
    const { email, password, fullName, phone, locationCity, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot register as ADMIN.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        fullName,
        locationCity,
        role, // EMPLOYER or WORKER
      }
    });

    // Create the respective profile based on the role
    if (role === 'EMPLOYER') {
      await prisma.employerProfile.create({ data: { userId: user.id } });
    } else if (role === 'WORKER') {
      await prisma.workerProfile.create({ data: { userId: user.id } });
    }

    // Usually we would send verification email here
    
    // Auto-login after registration
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Session expiry logic
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validate(userLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User (Me)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, phone: true, fullName: true, role: true,
        locationCity: true, isActive: true, 
        employerProfile: true, workerProfile: true
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving user data' });
  }
});

module.exports = router;

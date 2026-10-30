const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../utils/prismaClient');
const prisma = new PrismaClient();

const DEFAULT_JWT_SECRET = 'kazilink-prod-jwt-secret-2026';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const payload = jwt.verify(token, secret);
    req.user = payload; // Contains id, email, role

    // Update lastActiveAt on every authenticated request
    await prisma.user.update({
      where: { id: payload.id },
      data: { lastActiveAt: new Date() }
    }).catch(() => {});

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;

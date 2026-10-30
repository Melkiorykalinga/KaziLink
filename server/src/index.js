const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// CORS Config (supports Cloudflare Pages, Vercel, Custom Domains, and local dev)
app.use(cors({
  origin: (origin, callback) => {
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting (to block bots and abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'KaziLink API is running',
    commissionMode: 'FREE_DIRECT_P2P',
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0')
  });
});

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

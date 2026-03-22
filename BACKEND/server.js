// ============================================================
// FILE PATH: server.js
// CHANGES:   Removed connectDB() / mongoose. Firebase is
//            initialised by requiring config/firebase.js.
// ============================================================
require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

// ── Initialize Firebase Admin (must run before routes) ────────
require('./config/firebase');

const errorHandler     = require('./middleware/errorHandler');
const authRoutes       = require('./routes/auth');
const moduleRoutes     = require('./routes/modules');
const activityRoutes   = require('./routes/activity');
const dashboardRoutes  = require('./routes/dashboard');

const app = express();

// ─── Security Middleware ───────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://cyber-academy101.netlify.app',
];

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
}));

app.options('*', cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.get('/',                 (req, res) => res.json({ message: '🛡️ CyberSec Platform API is running' }));
app.use('/api/auth',         authRoutes);
app.use('/api/modules',      moduleRoutes);
app.use('/api/activity',     activityRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ─── 404 + Error Handlers ─────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
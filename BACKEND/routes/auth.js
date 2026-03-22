// ============================================================
// FILE PATH: routes/auth.js
// CHANGES:   Firebase Auth handles register/login on the
//            FRONTEND now. This backend only:
//              POST /api/auth/register → creates Firestore profile
//              GET  /api/auth/me       → returns user profile
//            Removed: bcryptjs, jwt, User mongoose model.
// ============================================================
const express  = require('express');
const { db }   = require('../config/firebase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/register ────────────────────────────────────
// Called by frontend AFTER Firebase createUserWithEmailAndPassword()
// succeeds. Creates the user's Firestore profile document.
router.post('/register', protect, async (req, res, next) => {
  try {
    const { username } = req.body;
    const { uid, email } = req.user;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Enforce unique username
    const existing = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const userDoc = {
      username,
      email,
      role:             'student',
      points:           0,
      completedModules: [],
      badges:           [],
      createdAt:        new Date().toISOString(),
    };

    await db.collection('users').doc(uid).set(userDoc);

    res.status(201).json({
      message:  'Profile created successfully',
      username,
      points:   0,
      rank:     'Beginner',
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────
// Returns the logged-in user's Firestore profile.
router.get('/me', protect, async (req, res, next) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json({ uid: req.user.uid, ...snap.data() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

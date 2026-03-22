// ============================================================
// FILE PATH: routes/activity.js
// CHANGES:   Replaced all mongoose/MongoDB calls with
//            Firestore (db.collection). Removed Activity,
//            Module, User mongoose model imports.
// ============================================================
const express      = require('express');
const { db }       = require('../config/firebase');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// Points awarded per activity type (fallback if score not sent)
const POINTS_MAP = {
  quiz:       20,
  phishing:   30,
  scenario:   50,
  checklist:  10,
  casestudy:  15,
};

// Rank thresholds
const RANKS = [
  { min: 1000, rank: 'Elite Hacker'   },
  { min: 500,  rank: 'Advanced'       },
  { min: 200,  rank: 'Intermediate'   },
  { min: 0,    rank: 'Beginner'       },
];

function getRank(points) {
  return RANKS.find(r => points >= r.min)?.rank || 'Beginner';
}

// ── POST /api/activity/submit ──────────────────────────────────
router.post('/submit', protect, async (req, res, next) => {
  try {
    const { activityType, status, score } = req.body;
    const uid = req.user.uid;

    if (!activityType || !status) {
      return res.status(400).json({ message: 'activityType and status are required' });
    }

    const pointsAdded = typeof score === 'number'
      ? score
      : (POINTS_MAP[activityType] || 10);

    // ── Write activity log to Firestore ─────────────────────
    await db.collection('activities').add({
      userId:       uid,
      activityType,
      status,
      score:        pointsAdded,
      submittedAt:  new Date().toISOString(),
    });

    // ── Update user points atomically ────────────────────────
    const userRef  = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const currentPoints = userSnap.data().points || 0;
    const newTotal      = currentPoints + pointsAdded;
    const currentRank   = getRank(newTotal);

    await userRef.update({ points: newTotal });

    res.json({
      message:     'Activity submitted successfully',
      pointsAdded,
      newTotal,
      currentRank,
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/activity/history ──────────────────────────────────
// Returns the last 20 activity entries for the logged-in user.
router.get('/history', protect, async (req, res, next) => {
  try {
    const snap = await db.collection('activities')
      .where('userId', '==', req.user.uid)
      .orderBy('submittedAt', 'desc')
      .limit(20)
      .get();

    const activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ count: activities.length, activities });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
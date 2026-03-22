// ============================================================
// FILE PATH: routes/dashboard.js
// CHANGES:   Replaced all mongoose queries with Firestore.
//            Removed User, Activity, Module model imports.
// ============================================================
const express      = require('express');
const { db }       = require('../config/firebase');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// ── GET /api/dashboard ────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const uid = req.user.uid;

    // Fetch user profile
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    const user = userSnap.data();

    // Recent activities (last 10)
    const actSnap = await db.collection('activities')
      .where('userId', '==', uid)
      .orderBy('submittedAt', 'desc')
      .limit(10)
      .get();
    const recentActivities = actSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // All modules
    const modSnap  = await db.collection('modules').orderBy('order').get();
    const allModules = modSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const completedIds = user.completedModules || [];
    const recommended  = allModules
      .filter(m => !completedIds.includes(m.id))
      .slice(0, 3);

    const progress = allModules.length > 0
      ? Math.round((completedIds.length / allModules.length) * 100)
      : 0;

    res.json({
      username:          user.username,
      email:             user.email,
      role:              user.role,
      points:            user.points,
      badges:            user.badges      || [],
      completedModules:  completedIds,
      progress,
      stats: {
        totalCompleted:  completedIds.length,
        totalModules:    allModules.length,
        totalPoints:     user.points,
        badgesEarned:    (user.badges || []).length,
      },
      recentActivities,
      recommendedModules: recommended,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
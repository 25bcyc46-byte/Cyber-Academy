const express = require('express');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Module = require('../models/Module');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard — protected
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'completedModules',
      'title level pointsReward'
    );

    // Recent activities (last 10)
    const recentActivities = await Activity.find({ userId: req.user._id })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('moduleId', 'title level');

    // All modules to calculate recommended (not yet completed)
    const allModules = await Module.find().select('title level description pointsReward order');
    const completedIds = user.completedModules.map((m) => m._id.toString());
    const recommended = allModules
      .filter((m) => !completedIds.includes(m._id.toString()))
      .slice(0, 3); // top 3 recommended

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        badges: user.badges,
        completedModules: user.completedModules,
        memberSince: user.createdAt,
      },
      stats: {
        totalCompleted: user.completedModules.length,
        totalModules: allModules.length,
        totalPoints: user.points,
        badgesEarned: user.badges.length,
      },
      recentActivities,
      recommendedModules: recommended,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const Activity = require('../models/Activity');
const Module = require('../models/Module');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/activity/submit — protected
router.post('/submit', protect, async (req, res, next) => {
  try {
    const { moduleId, activityType, score, result } = req.body;

    if (!moduleId || !activityType) {
      return res.status(400).json({ message: 'moduleId and activityType are required' });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Save activity
    const activity = await Activity.create({
      userId: req.user._id,
      moduleId,
      activityType,
      score: score || 0,
      result,
    });

    // Award points and mark module complete if not already done
    const user = req.user;
    const alreadyCompleted = user.completedModules.includes(moduleId);

    if (!alreadyCompleted) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { completedModules: moduleId },
        $inc: { points: module.pointsReward },
      });
    }

    res.status(201).json({
      message: 'Activity submitted successfully',
      activity,
      pointsAwarded: alreadyCompleted ? 0 : module.pointsReward,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

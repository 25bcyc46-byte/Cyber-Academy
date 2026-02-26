const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        'quiz',
        'phishing_identification',
        'case_study',
        'threat_decision',
        'risk_assessment',
        'secure_comparison',
      ],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    result: {
      type: mongoose.Schema.Types.Mixed, // flexible: store any result object
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);

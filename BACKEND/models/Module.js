const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Level is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    pointsReward: {
      type: Number,
      default: 10,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);

const express = require('express');
const Module = require('../models/Module');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/modules — public, supports ?level= filter
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.level) filter.level = req.query.level;

    const modules = await Module.find(filter)
      .select('-content') // exclude heavy content from list view
      .sort({ level: 1, order: 1 });

    res.json({ count: modules.length, modules });
  } catch (error) {
    next(error);
  }
});

// GET /api/modules/:id — protected
router.get('/:id', protect, async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({ module });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

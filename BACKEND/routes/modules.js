// ============================================================
// FILE PATH: routes/modules.js
// CHANGES:   Replaced mongoose Module model with Firestore.
// ============================================================
const express      = require('express');
const { db }       = require('../config/firebase');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// ── GET /api/modules — public ─────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    let query = db.collection('modules').orderBy('order');

    if (req.query.level) {
      query = db.collection('modules')
        .where('level', '==', req.query.level)
        .orderBy('order');
    }

    const snap    = await query.get();
    const modules = snap.docs.map(d => {
      const data = d.data();
      const { content, ...rest } = data; // exclude heavy content from list view
      return { id: d.id, ...rest };
    });

    res.json({ count: modules.length, modules });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/modules/:id — protected ─────────────────────────
router.get('/:id', protect, async (req, res, next) => {
  try {
    const snap = await db.collection('modules').doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({ module: { id: snap.id, ...snap.data() } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// ============================================================
// FILE PATH: middleware/auth.js
// CHANGES:   Replaced jwt.verify() with Firebase Admin
//            auth.verifyIdToken(). No more JWT_SECRET needed.
// ============================================================
const { auth, db } = require('../config/firebase');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = await auth.verifyIdToken(token);  // ← Firebase does the verification

    // Attach uid + email for use in routes (replaces req.user._id pattern)
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    const userSnap = await db.collection('users').doc(req.user.uid).get();
    if (userSnap.exists && userSnap.data().role === 'admin') return next();
    return res.status(403).json({ message: 'Access denied: Admins only' });
  } catch {
    return res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = { protect, adminOnly };
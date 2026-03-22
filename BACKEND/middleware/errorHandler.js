// ============================================================
// FILE PATH: middleware/errorHandler.js
// CHANGES:   Added Firebase-specific error code handling.
//            Removed mongoose duplicate key / validation handling.
// ============================================================
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.code || ''} ${err.message}`);

  // ── Firebase Auth errors ───────────────────────────────────
  if (err.code?.startsWith('auth/')) {
    const authMessages = {
      'auth/email-already-in-use':    'Email is already registered',
      'auth/invalid-email':           'Invalid email address',
      'auth/weak-password':           'Password is too weak (min 6 characters)',
      'auth/user-not-found':          'No account found with this email',
      'auth/wrong-password':          'Incorrect password',
      'auth/id-token-expired':        'Session expired, please log in again',
    };
    return res.status(401).json({
      message: authMessages[err.code] || err.message,
    });
  }

  // ── Firestore errors ───────────────────────────────────────
  if (err.code === 5)  return res.status(404).json({ message: 'Document not found' });
  if (err.code === 6)  return res.status(400).json({ message: 'Document already exists' });
  if (err.code === 7)  return res.status(403).json({ message: 'Permission denied' });

  // ── Generic ───────────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
const { auth } = require('../config/firebaseAdmin');

// Verifies the Firebase ID token sent by the frontend in the
// Authorization: Bearer <token> header. Attaches decoded staff info
// (uid, role custom claim) to req.staff for downstream route handlers.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token. Please log in again.' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.staff = {
      uid: decoded.uid,
      role: decoded.role || 'staff', // custom claim set at staff-creation time; owner = 'owner'
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

// Restricts a route to the owner role only (e.g. viewing purchase price / reports)
function requireOwner(req, res, next) {
  if (req.staff?.role !== 'owner') {
    return res.status(403).json({ error: 'Only the store owner can access this.' });
  }
  next();
}

module.exports = { requireAuth, requireOwner };

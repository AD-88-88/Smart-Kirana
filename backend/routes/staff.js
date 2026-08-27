const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebaseAdmin');
const { requireAuth, requireOwner } = require('../middleware/auth');

// GET /api/staff - List all staff
router.get('/', requireAuth, requireOwner, async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    const staffList = listUsersResult.users.map((user) => ({
      uid: user.uid,
      staffId: user.displayName,
      email: user.email,
      role: user.customClaims?.role || 'staff',
    }));
    res.json(staffList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load staff.' });
  }
});

// POST /api/staff - Create new staff
router.post('/', requireAuth, requireOwner, async (req, res) => {
  const { staffId, pin, role = 'staff' } = req.body;
  if (!staffId || !pin) return res.status(400).json({ error: 'Staff ID and PIN required.' });

  const email = `${staffId.toLowerCase()}@smartkirana.local`;

  try {
    const user = await auth.createUser({ email, password: pin, displayName: staffId });
    await auth.setCustomUserClaims(user.uid, { role });
    res.status(201).json({ uid: user.uid, staffId, email, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create staff.' });
  }
});

module.exports = router;

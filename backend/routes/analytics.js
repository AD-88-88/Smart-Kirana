const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');
const { requireAuth, requireOwner } = require('../middleware/auth');

const SALES = 'sales';

// GET /api/analytics/summary
router.get('/summary', requireAuth, requireOwner, async (req, res) => {
  try {
    const snap = await db.collection(SALES).get();
    const sales = snap.docs.map((d) => d.data());

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalBills = sales.length;

    // Grouping by date (simplistic)
    const dailySales = sales.reduce((acc, s) => {
      const date = s.createdAt.toDate().toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + s.total;
      return acc;
    }, {});

    res.json({ totalSales, totalBills, dailySales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load analytics.' });
  }
});

module.exports = router;

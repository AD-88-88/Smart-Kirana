const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebaseAdmin');
const { requireAuth } = require('../middleware/auth');

const CUSTOMERS = 'customers';

// GET /api/customers?q=ramesh  - search by name or phone, or list all if no q
router.get('/', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  try {
    const snap = await db.collection(CUSTOMERS).orderBy('name').limit(200).get();
    let customers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (q) {
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q)
      );
    }
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load customers.' });
  }
});

// GET /api/customers/:id - profile with balance + recent purchases
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection(CUSTOMERS).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Customer not found.' });

    const salesSnap = await db
      .collection('sales')
      .where('customerId', '==', req.params.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    res.json({
      id: doc.id,
      ...doc.data(),
      recentSales: salesSnap.docs.map((s) => ({ id: s.id, ...s.data() })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load customer.' });
  }
});

// POST /api/customers - quick-add a new customer (used inline from POS udhar flow)
router.post('/', requireAuth, async (req, res) => {
  const { name, phone = '', address = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Customer name is required.' });

  try {
    const doc = {
      name,
      phone,
      address,
      outstandingBalance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(CUSTOMERS).add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add customer.' });
  }
});

// POST /api/customers/:id/payment - record a payment against outstanding udhar
router.post('/:id/payment', requireAuth, async (req, res) => {
  const { amount } = req.body;
  const paid = Number(amount);
  if (!paid || paid <= 0) return res.status(400).json({ error: 'Enter a valid payment amount.' });

  const ref = db.collection(CUSTOMERS).doc(req.params.id);

  try {
    const newBalance = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) throw new Error('NOT_FOUND');
      const current = doc.data().outstandingBalance || 0;
      const updated = Math.max(0, current - paid);
      tx.update(ref, { outstandingBalance: updated });
      tx.set(ref.collection('payments').doc(), {
        amount: paid,
        recordedAt: admin.firestore.FieldValue.serverTimestamp(),
        recordedBy: req.staff.uid,
      });
      return updated;
    });
    res.json({ outstandingBalance: newBalance });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Customer not found.' });
    console.error(err);
    res.status(500).json({ error: 'Could not record payment.' });
  }
});

module.exports = router;

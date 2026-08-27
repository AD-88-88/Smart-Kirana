const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebaseAdmin');
const { requireAuth } = require('../middleware/auth');

const PRODUCTS = 'products';
const SALES = 'sales';
const CUSTOMERS = 'customers';
const COUNTERS = 'counters';

// POST /api/sales
// Body: {
//   items: [{ productId, name, quantity, unitPrice, unit }],
//   gstEnabled: boolean,
//   gstRate: number (e.g. 5 for 5%),
//   discount: number (flat ₹ amount),
//   paymentMode: 'cash' | 'upi' | 'udhar',
//   customerId: string | null   // required if paymentMode === 'udhar'
// }
//
// This is the one place stock actually changes. It runs as a single
// Firestore transaction so two staff members billing at the same time
// can never both sell the "last" unit of an item (no negative stock,
// no double-deduction, no lost updates).
router.post('/', requireAuth, async (req, res) => {
  const { items, gstEnabled = false, gstRate = 0, discount = 0, paymentMode, customerId = null } =
    req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Bill has no items.' });
  }
  if (!['cash', 'upi', 'udhar'].includes(paymentMode)) {
    return res.status(400).json({ error: 'Choose a valid payment mode.' });
  }
  if (paymentMode === 'udhar' && !customerId) {
    return res.status(400).json({ error: 'Udhar bills must be tagged to a customer.' });
  }

  try {
    const result = await db.runTransaction(async (tx) => {
      // 1. Read + validate every product's current stock inside the transaction
      const productRefs = items.map((it) => db.collection(PRODUCTS).doc(it.productId));
      const productDocs = await Promise.all(productRefs.map((ref) => tx.get(ref)));

      productDocs.forEach((doc, idx) => {
        if (!doc.exists) throw new Error(`PRODUCT_MISSING:${items[idx].name}`);
        const stock = doc.data().stockQuantity;
        if (stock < items[idx].quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${doc.data().name}:${stock}`);
        }
      });

      // 2. Compute totals server-side (never trust client-calculated money)
      const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
      const gstAmount = gstEnabled ? +(subtotal * (gstRate / 100)).toFixed(2) : 0;
      const total = +(subtotal + gstAmount - Number(discount || 0)).toFixed(2);

      // 3. Decrement stock for every line item
      productDocs.forEach((doc, idx) => {
        tx.update(productRefs[idx], {
          stockQuantity: doc.data().stockQuantity - items[idx].quantity,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // 4. Bump the human-readable running bill number
      const counterRef = db.collection(COUNTERS).doc('bills');
      const counterDoc = await tx.get(counterRef);
      const nextBillNumber = (counterDoc.exists ? counterDoc.data().value : 1000) + 1;
      tx.set(counterRef, { value: nextBillNumber }, { merge: true });

      // 5. If udhar, add to the customer's outstanding balance
      let customerRef = null;
      if (paymentMode === 'udhar') {
        customerRef = db.collection(CUSTOMERS).doc(customerId);
        const customerDoc = await tx.get(customerRef);
        if (!customerDoc.exists) throw new Error('CUSTOMER_MISSING');
        tx.update(customerRef, {
          outstandingBalance: (customerDoc.data().outstandingBalance || 0) + total,
        });
      }

      // 6. Write the sale record itself
      const saleRef = db.collection(SALES).doc();
      const saleDoc = {
        billNumber: nextBillNumber,
        items,
        subtotal,
        gstEnabled,
        gstRate,
        gstAmount,
        discount: Number(discount || 0),
        total,
        paymentMode,
        customerId: customerId || null,
        staffUid: req.staff.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      tx.set(saleRef, saleDoc);

      return { id: saleRef.id, ...saleDoc };
    });

    res.status(201).json(result);
  } catch (err) {
    const msg = err.message || '';
    if (msg.startsWith('INSUFFICIENT_STOCK:')) {
      const [, name, stock] = msg.split(':');
      return res.status(409).json({ error: `Only ${stock} left of "${name}". Adjust the quantity.` });
    }
    if (msg.startsWith('PRODUCT_MISSING:')) {
      return res.status(404).json({ error: `"${msg.split(':')[1]}" no longer exists in inventory.` });
    }
    if (msg === 'CUSTOMER_MISSING') {
      return res.status(404).json({ error: 'Selected customer not found.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not generate bill. Please try again.' });
  }
});

// GET /api/sales/today - dashboard summary card
router.get('/today', requireAuth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const snap = await db
      .collection(SALES)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .get();

    const sales = snap.docs.map((d) => d.data());
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const udharCount = sales.filter((s) => s.paymentMode === 'udhar').length;

    res.json({ billCount: sales.length, totalSales, udharCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load today's summary." });
  }
});

// GET /api/sales/:id - single bill (for reprint / re-share)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection(SALES).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Bill not found.' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bill.' });
  }
});

module.exports = router;

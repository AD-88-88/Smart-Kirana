const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebaseAdmin');
const { requireAuth, requireOwner } = require('../middleware/auth');

const PRODUCTS = 'products';

// GET /api/products
// Returns the full product list. Frontend also listens to this collection
// directly via Firestore's realtime SDK for instant rate-lookup updates;
// this REST route exists for the initial page load / non-realtime clients.
router.get('/', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection(PRODUCTS).orderBy('name').get();
    const products = snap.docs.map((d) => {
      const data = d.data();
      // Staff (non-owner) never sees purchase price - margin protection.
      if (req.staff.role !== 'owner') delete data.purchasePrice;
      return { id: d.id, ...data };
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load products.' });
  }
});

// GET /api/products/search?q=milk
// Fast lookup used by the Quick Rate Lookup bar. Firestore doesn't do
// substring search natively, so we search a lowercase "nameLower" field
// with a prefix range query, then also filter by category name.
router.get('/search', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);

  try {
    const end = q.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1));

    const [byName, byCategory] = await Promise.all([
      db.collection(PRODUCTS).orderBy('nameLower').startAt(q).endAt(end).limit(20).get(),
      db.collection(PRODUCTS).where('categoryLower', '==', q).limit(20).get(),
    ]);

    const map = new Map();
    [...byName.docs, ...byCategory.docs].forEach((d) => {
      const data = d.data();
      if (req.staff.role !== 'owner') delete data.purchasePrice;
      map.set(d.id, { id: d.id, ...data });
    });

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed.' });
  }
});

// GET /api/products/low-stock
router.get('/low-stock', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection(PRODUCTS).get();
    const lowStock = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.stockQuantity <= p.lowStockThreshold);
    res.json(lowStock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load low-stock items.' });
  }
});

// POST /api/products  - add a new product
router.post('/', requireAuth, async (req, res) => {
  const {
    name,
    barcode = '',
    category,
    unit,
    purchasePrice,
    sellingPrice,
    stockQuantity,
    lowStockThreshold,
    imageUrl = '',
  } = req.body;

  if (!name || !category || !unit || sellingPrice == null || stockQuantity == null) {
    return res.status(400).json({ error: 'Name, category, unit, selling price and stock are required.' });
  }

  try {
    const doc = {
      name,
      nameLower: name.toLowerCase(),
      barcode,
      category,
      categoryLower: category.toLowerCase(),
      unit,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold) || 0,
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(PRODUCTS).add(doc);
    res.status(201).json({ id: ref.id, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save product.' });
  }
});

// PUT /api/products/:id  - edit a product
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const update = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    [
      'name',
      'barcode',
      'category',
      'unit',
      'purchasePrice',
      'sellingPrice',
      'stockQuantity',
      'lowStockThreshold',
      'imageUrl',
    ].forEach((field) => {
      if (body[field] !== undefined) update[field] = body[field];
    });
    if (body.name) update.nameLower = body.name.toLowerCase();
    if (body.category) update.categoryLower = body.category.toLowerCase();

    await db.collection(PRODUCTS).doc(id).update(update);
    res.json({ id, ...update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update product.' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireOwner, async (req, res) => {
  try {
    await db.collection(PRODUCTS).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete product.' });
  }
});

module.exports = router;

// Optional: populates a handful of sample products so you can try the app
// immediately after setup, before the owner enters real inventory.
// Usage: node scripts/seedDemoData.js

require('dotenv').config();
const { db, admin } = require('../config/firebaseAdmin');

const demoProducts = [
  { name: 'Tata Salt 1kg', category: 'Staples', unit: 'kg', purchasePrice: 20, sellingPrice: 28, stockQuantity: 45, lowStockThreshold: 10 },
  { name: 'Amul Milk 500ml', category: 'Dairy', unit: 'ml', purchasePrice: 26, sellingPrice: 32, stockQuantity: 6, lowStockThreshold: 10 },
  { name: 'Maggi Noodles 70g', category: 'Snacks', unit: 'pcs', purchasePrice: 11, sellingPrice: 14, stockQuantity: 0, lowStockThreshold: 15 },
  { name: 'Aashirvaad Atta 5kg', category: 'Staples', unit: 'kg', purchasePrice: 210, sellingPrice: 249, stockQuantity: 22, lowStockThreshold: 5 },
  { name: 'Fortune Sunflower Oil 1L', category: 'Staples', unit: 'L', purchasePrice: 128, sellingPrice: 149, stockQuantity: 18, lowStockThreshold: 6 },
  { name: 'Parle-G Biscuit 200g', category: 'Snacks', unit: 'packet', purchasePrice: 18, sellingPrice: 22, stockQuantity: 60, lowStockThreshold: 20 },
  { name: 'Coca-Cola 750ml', category: 'Beverages', unit: 'ml', purchasePrice: 32, sellingPrice: 40, stockQuantity: 30, lowStockThreshold: 12 },
  { name: 'Colgate Toothpaste 100g', category: 'Personal Care', unit: 'pcs', purchasePrice: 42, sellingPrice: 55, stockQuantity: 25, lowStockThreshold: 8 },
];

async function seed() {
  const batch = db.batch();
  demoProducts.forEach((p) => {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      ...p,
      barcode: '',
      imageUrl: '',
      nameLower: p.name.toLowerCase(),
      categoryLower: p.category.toLowerCase(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  console.log(`Seeded ${demoProducts.length} demo products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

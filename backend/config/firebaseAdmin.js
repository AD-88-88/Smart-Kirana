// Initializes the Firebase Admin SDK once and exports the Firestore + Auth handles.
// The backend uses Admin privileges so it can run atomic stock-deduction
// transactions that a browser client should never be trusted to run alone.

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

try {
  // Preferred: a local JSON key file (see .env.example)
  const keyPath = path.resolve(
    __dirname,
    '..',
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/serviceAccountKey.json'
  );
  serviceAccount = require(keyPath);
} catch (err) {
  console.error(
    '\n[firebaseAdmin] Could not load serviceAccountKey.json.\n' +
      'Download it from Firebase Console > Project Settings > Service Accounts,\n' +
      'save it at backend/config/serviceAccountKey.json, and try again.\n'
  );
  throw err;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

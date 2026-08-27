// One-off CLI helper the store owner runs to create a login for a new staff
// member (or the owner account itself). This is the Phase-1 stand-in for
// the "Staff Accounts & Permissions" screen in Settings (Phase 2 UI).
//
// Usage:
//   node scripts/createStaff.js <staffId> <pin> <role: staff|owner>
//
// Example:
//   node scripts/createStaff.js ramesh 4821 staff
//   node scripts/createStaff.js owner 998877 owner

require('dotenv').config();
const { auth } = require('../config/firebaseAdmin');

async function main() {
  const [, , staffId, pin, role = 'staff'] = process.argv;

  if (!staffId || !pin) {
    console.log('Usage: node scripts/createStaff.js <staffId> <pin> <role: staff|owner>');
    process.exit(1);
  }
  if (pin.length < 4) {
    console.log('PIN should be at least 4 digits.');
    process.exit(1);
  }

  const email = `${staffId.toLowerCase()}@smartkirana.local`;

  try {
    const existing = await auth.getUserByEmail(email).catch(() => null);
    let user;
    if (existing) {
      user = await auth.updateUser(existing.uid, { password: pin });
      console.log(`Updated PIN for existing staff "${staffId}".`);
    } else {
      user = await auth.createUser({ email, password: pin, displayName: staffId });
      console.log(`Created new staff login "${staffId}".`);
    }

    await auth.setCustomUserClaims(user.uid, { role });
    console.log(`Role set to "${role}". Staff can now log in with Staff ID "${staffId}" and their PIN.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create/update staff:', err.message);
    process.exit(1);
  }
}

main();

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Script — Firebase Realtime Database + Authentication
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Wipes and re-seeds all collections in the RTDB and creates (or re-creates)
 * Firebase Auth accounts for every user in the mock dataset.
 *
 * Run:
 *   node scripts/seed.js
 *
 * RTDB structure written:
 *   /users/{id}
 *   /bloodInventory/{type}   (e.g. "A+" → key "A+")
 *   /appointments/{id}
 *   /donationHistory/{id}
 *   /donationRequests/{id}
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import { getDatabase, ref, set, remove } from 'firebase/database';

// ── Firebase config (mirrors src/firebase/firebase.js) ──────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyB6weNm1c_LG7iU0uhKGLluznOv5voVL5Y',
  authDomain: 'bdms-software-engineering.firebaseapp.com',
  databaseURL:
    'https://bdms-software-engineering-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'bdms-software-engineering',
  storageBucket: 'bdms-software-engineering.firebasestorage.app',
  messagingSenderId: '776528961974',
  appId: '1:776528961974:web:78f5e27f6d96c415d32117',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

// ── Seed data ────────────────────────────────────────────────────────────────

const users = [
  // ── Donors ──────────────────────────────────────────────────────────────
  {
    id: 'D001', role: 'donor',
    email: 'john.smith@email.com', password: 'donor123',
    name: 'John Smith', phone: '555-0101',
    bloodType: 'O+', registrationDate: '2025-01-15',
    lastDonationDate: '2026-01-01', donationCount: 5, isActive: true,
  },
  {
    id: 'D002', role: 'donor',
    email: 'sarah.jones@email.com', password: 'donor123',
    name: 'Sarah Jones', phone: '555-0102',
    bloodType: 'A+', registrationDate: '2025-03-20',
    lastDonationDate: '2026-02-15', donationCount: 3, isActive: true,
  },
  {
    id: 'D003', role: 'donor',
    email: 'michael.brown@email.com', password: 'donor123',
    name: 'Michael Brown', phone: '555-0103',
    bloodType: 'B+', registrationDate: '2025-02-10',
    lastDonationDate: '2025-12-20', donationCount: 4, isActive: true,
  },
  {
    id: 'D004', role: 'donor',
    email: 'emily.davis@email.com', password: 'donor123',
    name: 'Emily Davis', phone: '555-0104',
    bloodType: 'AB+', registrationDate: '2025-04-05',
    lastDonationDate: '2026-01-10', donationCount: 2, isActive: true,
  },
  {
    id: 'D005', role: 'donor',
    email: 'david.wilson@email.com', password: 'donor123',
    name: 'David Wilson', phone: '555-0105',
    bloodType: 'O-', registrationDate: '2025-05-12',
    lastDonationDate: '2025-11-30', donationCount: 6, isActive: true,
  },
  {
    id: 'D006', role: 'donor',
    email: 'lisa.martinez@email.com', password: 'donor123',
    name: 'Lisa Martinez', phone: '555-0106',
    bloodType: 'A-', registrationDate: '2025-06-18',
    lastDonationDate: '2026-01-05', donationCount: 3, isActive: true,
  },
  {
    id: 'D007', role: 'donor',
    email: 'james.anderson@email.com', password: 'donor123',
    name: 'James Anderson', phone: '555-0107',
    bloodType: 'B-', registrationDate: '2025-07-22',
    lastDonationDate: '2025-12-10', donationCount: 2, isActive: true,
  },
  {
    id: 'D008', role: 'donor',
    email: 'jennifer.taylor@email.com', password: 'donor123',
    name: 'Jennifer Taylor', phone: '555-0108',
    bloodType: 'AB-', registrationDate: '2025-08-30',
    lastDonationDate: null, donationCount: 0, isActive: true,
  },
  {
    id: 'D009', role: 'donor',
    email: 'robert.thomas@email.com', password: 'donor123',
    name: 'Robert Thomas', phone: '555-0109',
    bloodType: 'O+', registrationDate: '2025-09-14',
    lastDonationDate: '2025-12-25', donationCount: 1, isActive: true,
  },
  {
    id: 'D010', role: 'donor',
    email: 'mary.jackson@email.com', password: 'donor123',
    name: 'Mary Jackson', phone: '555-0110',
    bloodType: 'A+', registrationDate: '2025-10-20',
    lastDonationDate: '2026-02-10', donationCount: 2, isActive: true,
  },
  {
    id: 'D011', role: 'donor',
    email: 'alex.chen@email.com', password: 'donor123',
    name: 'Alex Chen', phone: '555-0111',
    bloodType: null, registrationDate: '2026-02-26',
    lastDonationDate: null, donationCount: 0, isActive: true,
  },
  // ── Staff ────────────────────────────────────────────────────────────────
  {
    id: 'S001', role: 'staff',
    email: 'nurse.smith@bdms.org', password: 'staff123',
    name: 'Nurse Smith', phone: '555-0201',
    registrationDate: '2025-01-01', isActive: true,
  },
  {
    id: 'S002', role: 'staff',
    email: 'phlebotomist.johnson@bdms.org', password: 'staff123',
    name: 'Tech Johnson', phone: '555-0202',
    registrationDate: '2025-01-01', isActive: true,
  },
  // ── Admin ────────────────────────────────────────────────────────────────
  {
    id: 'A001', role: 'admin',
    email: 'admin@bdms.org', password: 'admin123',
    name: 'Admin User', phone: '555-0301',
    registrationDate: '2025-01-01', isActive: true,
  },
];

const bloodInventory = [
  {
    type: 'A+', units: 25, lastUpdated: '2026-02-25', expirationDate: '2026-03-07',
    batches: [
      { units: 5,  expirationDate: '2026-03-07' },
      { units: 20, expirationDate: '2026-03-30' },
    ],
  },
  {
    type: 'A-', units: 8, lastUpdated: '2026-02-24', expirationDate: '2026-03-06',
    batches: [
      { units: 4, expirationDate: '2026-03-06' },
      { units: 4, expirationDate: '2026-03-25' },
    ],
  },
  {
    type: 'B+', units: 15, lastUpdated: '2026-02-25', expirationDate: '2026-03-04',
    batches: [
      { units: 3,  expirationDate: '2026-03-04' },
      { units: 12, expirationDate: '2026-04-01' },
    ],
  },
  {
    type: 'B-', units: 5, lastUpdated: '2026-02-23', expirationDate: '2026-03-04',
    batches: [
      { units: 5, expirationDate: '2026-03-04' },
    ],
  },
  {
    type: 'AB+', units: 12, lastUpdated: '2026-02-25', expirationDate: '2026-03-02',
    batches: [
      { units: 2,  expirationDate: '2026-03-02' },
      { units: 10, expirationDate: '2026-03-28' },
    ],
  },
  {
    type: 'AB-', units: 3, lastUpdated: '2026-02-22', expirationDate: '2026-02-28',
    batches: [
      { units: 3, expirationDate: '2026-02-28' },
    ],
  },
  {
    type: 'O+', units: 30, lastUpdated: '2026-02-26', expirationDate: '2026-03-03',
    batches: [
      { units: 2,  expirationDate: '2026-03-03' },
      { units: 28, expirationDate: '2026-04-05' },
    ],
  },
  {
    type: 'O-', units: 7, lastUpdated: '2026-02-24', expirationDate: '2026-03-05',
    batches: [
      { units: 3, expirationDate: '2026-03-05' },
      { units: 4, expirationDate: '2026-03-22' },
    ],
  },
];

const appointments = [
  {
    id: 'APT001', donorId: 'D001', donorName: 'John Smith', bloodType: 'O+',
    date: '2026-02-27', time: '09:00 AM', status: 'confirmed',
    confirmationNumber: 'CONF-001', createdDate: '2026-02-20',
  },
  {
    id: 'APT002', donorId: 'D003', donorName: 'Michael Brown', bloodType: 'B+',
    date: '2026-02-27', time: '10:00 AM', status: 'confirmed',
    confirmationNumber: 'CONF-002', createdDate: '2026-02-21',
  },
  {
    id: 'APT003', donorId: 'D005', donorName: 'David Wilson', bloodType: 'O-',
    date: '2026-02-27', time: '02:00 PM', status: 'pending',
    confirmationNumber: 'CONF-003', createdDate: '2026-02-25',
  },
  {
    id: 'APT004', donorId: 'D007', donorName: 'James Anderson', bloodType: 'B-',
    date: '2026-02-28', time: '09:00 AM', status: 'confirmed',
    confirmationNumber: 'CONF-004', createdDate: '2026-02-22',
  },
  {
    id: 'APT005', donorId: 'D009', donorName: 'Robert Thomas', bloodType: 'O+',
    date: '2026-02-28', time: '11:00 AM', status: 'pending',
    confirmationNumber: 'CONF-005', createdDate: '2026-02-24',
  },
  {
    id: 'APT006', donorId: 'D002', donorName: 'Sarah Jones', bloodType: 'A+',
    date: '2026-03-01', time: '10:00 AM', status: 'cancelled',
    confirmationNumber: 'CONF-006', createdDate: '2026-02-18',
  },
  {
    id: 'APT007', donorId: 'D011', donorName: 'Alex Chen', bloodType: null,
    date: '2026-02-27', time: '03:00 PM', status: 'confirmed',
    confirmationNumber: 'CONF-007', createdDate: '2026-02-26',
  },
];

const donationHistory = [
  {
    id: 'DON001', donorId: 'D001', donorName: 'John Smith', bloodType: 'O+',
    date: '2026-01-01', units: 1, staffId: 'S001', status: 'completed',
  },
  {
    id: 'DON002', donorId: 'D001', donorName: 'John Smith', bloodType: 'O+',
    date: '2025-11-05', units: 1, staffId: 'S002', status: 'completed',
  },
  {
    id: 'DON003', donorId: 'D002', donorName: 'Sarah Jones', bloodType: 'A+',
    date: '2026-02-15', units: 1, staffId: 'S001', status: 'completed',
  },
  {
    id: 'DON004', donorId: 'D003', donorName: 'Michael Brown', bloodType: 'B+',
    date: '2025-12-20', units: 1, staffId: 'S002', status: 'completed',
  },
  {
    id: 'DON005', donorId: 'D005', donorName: 'David Wilson', bloodType: 'O-',
    date: '2025-11-30', units: 1, staffId: 'S001', status: 'completed',
  },
];

const donationRequests = [
  {
    id: 'REQ001', bloodType: 'A-', requestedBy: 'S001', requestedByName: 'Nurse Smith',
    donorId: 'D006', donorName: 'Lisa Martinez', requestDate: '2026-02-24', status: 'pending',
    message: 'We urgently need A- blood. Would you be able to donate soon?',
  },
  {
    id: 'REQ002', bloodType: 'B-', requestedBy: 'S002', requestedByName: 'Tech Johnson',
    donorId: 'D007', donorName: 'James Anderson', requestDate: '2026-02-23', status: 'accepted',
    message: 'Our B- inventory is critically low. Can you help?',
    responseDate: '2026-02-24', responseMessage: 'Yes, I can come in this week.',
  },
  {
    id: 'REQ003', bloodType: 'AB-', requestedBy: 'S001', requestedByName: 'Nurse Smith',
    donorId: 'D008', donorName: 'Jennifer Taylor', requestDate: '2026-02-22', status: 'declined',
    message: 'We need AB- donations. Are you available?',
    responseDate: '2026-02-23', responseMessage: 'Sorry, I am traveling this month.',
  },
  {
    id: 'REQ004', bloodType: 'O-', requestedBy: 'S001', requestedByName: 'Nurse Smith',
    donorId: 'D005', donorName: 'David Wilson', requestDate: '2026-02-25', status: 'pending',
    message: 'O- is running low. Your donation would be greatly appreciated!',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Remove undefined/null values so RTDB doesn't choke on them */
function clean(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/** Convert array to RTDB-friendly keyed object  { [item.id]: item, ... } */
function toMap(arr, keyField = 'id') {
  return arr.reduce((acc, item) => {
    acc[item[keyField]] = clean(item);
    return acc;
  }, {});
}

/**
 * Convert blood inventory array to keyed object.
 * Firebase RTDB forbids ".", "#", "$", "[", "]", "/" in keys.
 * "A+", "O-" etc. are safe — only those five chars are banned.
 */
function toInventoryMap(arr) {
  return arr.reduce((acc, item) => {
    const key = item.type; // e.g. "A+", "O-" — safe for RTDB
    acc[key] = clean(item);
    return acc;
  }, {});
}

// ── Auth + user profile seeding ──────────────────────────────────────────────
// Creates (or re-creates) each Auth account, then writes the profile at
// users/{firebase_uid} — the path AuthContext.jsx expects.
// Returns a map of customId → firebaseUid so relational data can be updated.

async function seedUsersAndAuth() {
  console.log('\n🔐 Creating Auth accounts & writing /users/{uid} profiles…');

  // Wipe the users node first (rest of DB is cleared separately)
  await remove(ref(db, 'users'));

  // Map: custom id (D001, S001…) → Firebase Auth UID
  const idToUid = {};

  for (const user of users) {
    const { email, password } = user;
    let firebaseUid = null;

    // Try to create; if exists sign-in to get UID then re-create
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUid = cred.user.uid;
      console.log(`  ✔ Created: ${email}  (uid: ${firebaseUid})`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          firebaseUid = cred.user.uid;
          await deleteUser(cred.user);
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUid = newCred.user.uid;
          console.log(`  ↺ Re-created: ${email}  (uid: ${firebaseUid})`);
        } catch (innerErr) {
          console.warn(`  ⚠ Could not re-create ${email}: ${innerErr.message}`);
          continue;
        }
      } else {
        console.warn(`  ⚠ Skipped ${email}: ${err.message}`);
        continue;
      }
    }

    idToUid[user.id] = firebaseUid;

    // Write full profile (including password) at users/{firebaseUid}
    await set(ref(db, `users/${firebaseUid}`), clean(user));
  }

  console.log(`  ✔ ${Object.keys(idToUid).length} user profiles written`);
  return idToUid;
}

// ── RTDB seeding ─────────────────────────────────────────────────────────────

async function seedDatabase(idToUid) {
  console.log('\n📦 Clearing non-user RTDB data…');
  await remove(ref(db, 'bloodInventory'));
  await remove(ref(db, 'appointments'));
  await remove(ref(db, 'donationHistory'));
  await remove(ref(db, 'donationRequests'));
  console.log('  ✔ Cleared');

  // Helper: replace custom donor/staff IDs with Firebase UIDs in a record
  const resolve = (obj) => {
    const o = { ...obj };
    if (o.donorId  && idToUid[o.donorId])      o.donorId      = idToUid[o.donorId];
    if (o.staffId  && idToUid[o.staffId])       o.staffId      = idToUid[o.staffId];
    if (o.requestedBy && idToUid[o.requestedBy]) o.requestedBy = idToUid[o.requestedBy];
    return o;
  };

  console.log('\n🩸 Seeding /bloodInventory…');
  await set(ref(db, 'bloodInventory'), toInventoryMap(bloodInventory));
  console.log(`  ✔ ${bloodInventory.length} blood types written`);

  console.log('\n📅 Seeding /appointments…');
  await set(ref(db, 'appointments'), toMap(appointments.map(resolve)));
  console.log(`  ✔ ${appointments.length} appointments written`);

  console.log('\n📋 Seeding /donationHistory…');
  await set(ref(db, 'donationHistory'), toMap(donationHistory.map(resolve)));
  console.log(`  ✔ ${donationHistory.length} donation history records written`);

  console.log('\n📨 Seeding /donationRequests…');
  await set(ref(db, 'donationRequests'), toMap(donationRequests.map(resolve)));
  console.log(`  ✔ ${donationRequests.length} donation requests written`);
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  BDMS — Firebase Seed Script');
  console.log('═══════════════════════════════════════════════');

  try {
    const idToUid = await seedUsersAndAuth();
    await seedDatabase(idToUid);

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅  Seed complete!');
    console.log('═══════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();

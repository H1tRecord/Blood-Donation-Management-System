/**
 * ─────────────────────────────────────────────
 * Firebase Realtime Database — Data Access Layer
 * ─────────────────────────────────────────────
 *
 * All RTDB paths:
 *   /users/{firebaseUid}
 *   /bloodInventory/{bloodType}   e.g. "A+"
 *   /appointments/{id}            e.g. "APT001"
 *   /donationHistory/{id}         e.g. "DON001"
 *   /donationRequests/{id}        e.g. "REQ001"
 *
 * Custom deterministic IDs are used as RTDB keys.
 * The `id` field is NOT stored inside documents — components receive it via
 * the snapshot converter which injects the key as `id`.
 */

import { ref, get, set, update, remove } from 'firebase/database';
import { db } from '../firebase/firebase';

// ── Snapshot converters ──────────────────────────────────────────────────────

/**
 * Users: RTDB key is the Firebase UID.
 * Injected as `uid` so components can reference it for updates/deletes.
 */
const usersSnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([uid, val]) => ({ ...val, uid }));
};

/**
 * General collections (appointments, donationHistory, donationRequests):
 * RTDB key is the custom ID (e.g. "APT001"). Injected as `id`.
 */
const collectionSnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, val]) => ({ ...val, id }));
};

/**
 * Blood inventory: RTDB key is the blood type string (e.g. "A+").
 * `type` is also stored inside the value for display convenience.
 */
const inventorySnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val());
};

// ── ID generation ────────────────────────────────────────────────────────────

/**
 * Reads all keys under `path`, finds the highest numeric suffix for `prefix`,
 * and returns the next padded ID, e.g. "APT008".
 */
const generateNextId = async (path, prefix) => {
  const snapshot = await get(ref(db, path));
  if (!snapshot.exists()) return `${prefix}001`;
  const nums = Object.keys(snapshot.val())
    .filter(k => k.startsWith(prefix))
    .map(k => parseInt(k.slice(prefix.length), 10))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
};

// ── Users ────────────────────────────────────────────────────────────────────

/** Fetch all users (returns array with `uid` field = Firebase UID) */
export const getUsers = async () => {
  const snapshot = await get(ref(db, 'users'));
  return usersSnap(snapshot);
};

/** Fetch a single user by Firebase UID */
export const getUserById = async (uid) => {
  const snapshot = await get(ref(db, `users/${uid}`));
  if (!snapshot.exists()) return null;
  return { ...snapshot.val(), uid };
};

/** Update fields on a user document */
export const updateUserInDB = async (uid, updates) => {
  await update(ref(db, `users/${uid}`), updates);
};

/** Delete a user document (does NOT delete Firebase Auth account) */
export const deleteUserFromDB = async (uid) => {
  await remove(ref(db, `users/${uid}`));
};

// ── Blood Inventory ──────────────────────────────────────────────────────────

/** Fetch all blood inventory items */
export const getBloodInventory = async () => {
  const snapshot = await get(ref(db, 'bloodInventory'));
  return inventorySnap(snapshot);
};

/**
 * Overwrite an inventory item entirely.
 * `type` is the blood-type key, e.g. "A+".
 */
export const setInventoryItem = async (type, data) => {
  await set(ref(db, `bloodInventory/${type}`), { ...data, type });
};

/**
 * Add a new donation batch to an existing blood inventory item.
 * Increments total `units` and appends the batch.
 * Creates the inventory entry if it doesn't yet exist.
 *
 * @param {string} type             Blood type key, e.g. "A+"
 * @param {number} units            Units collected
 * @param {string} expirationDate   ISO date string
 * @param {string} donationHistoryId  ID of the linked DON### record
 */
export const addInventoryBatch = async (type, units, expirationDate, donationHistoryId) => {
  const today = new Date().toISOString().split('T')[0];
  const newBatch = { units, expirationDate, donationHistoryId };

  const snapshot = await get(ref(db, `bloodInventory/${type}`));
  if (snapshot.exists()) {
    const current = snapshot.val();
    const batches = [...(current.batches || []), newBatch];
    const totalUnits = batches.reduce((sum, b) => sum + (b.units || 0), 0);
    await update(ref(db, `bloodInventory/${type}`), {
      units: totalUnits,
      lastUpdated: today,
      expirationDate,
      batches,
    });
  } else {
    await set(ref(db, `bloodInventory/${type}`), {
      type,
      units,
      lastUpdated: today,
      expirationDate,
      batches: [newBatch],
    });
  }
};

// ── Appointments ─────────────────────────────────────────────────────────────

/** Fetch all appointments */
export const getAppointments = async () => {
  const snapshot = await get(ref(db, 'appointments'));
  return collectionSnap(snapshot);
};

/**
 * Create a new appointment with a custom deterministic ID (APT###).
 * The ID is used as the RTDB key and is NOT stored inside the document.
 * Returns the generated id.
 */
export const createAppointment = async (appointmentData) => {
  const id = await generateNextId('appointments', 'APT');
  await set(ref(db, `appointments/${id}`), appointmentData);
  return id;
};

/** Update fields on an existing appointment */
export const updateAppointment = async (id, updates) => {
  await update(ref(db, `appointments/${id}`), updates);
};

/** Permanently delete an appointment */
export const deleteAppointment = async (id) => {
  await remove(ref(db, `appointments/${id}`));
};

// ── Donation History ─────────────────────────────────────────────────────────

/** Fetch all donation history records */
export const getDonationHistory = async () => {
  const snapshot = await get(ref(db, 'donationHistory'));
  return collectionSnap(snapshot);
};

/**
 * Create a new donation history record with a custom deterministic ID (DON###).
 * Returns the generated id.
 */
export const createDonationRecord = async (recordData) => {
  const id = await generateNextId('donationHistory', 'DON');
  await set(ref(db, `donationHistory/${id}`), recordData);
  return id;
};

/** Update fields on an existing donation history record */
export const updateDonationRecord = async (id, updates) => {
  await update(ref(db, `donationHistory/${id}`), updates);
};

// ── Donation Requests ────────────────────────────────────────────────────────

/** Fetch all donation requests */
export const getDonationRequests = async () => {
  const snapshot = await get(ref(db, 'donationRequests'));
  return collectionSnap(snapshot);
};

/**
 * Create a new donation request with a custom deterministic ID (REQ###).
 * Returns the generated id.
 */
export const createDonationRequest = async (requestData) => {
  const id = await generateNextId('donationRequests', 'REQ');
  await set(ref(db, `donationRequests/${id}`), requestData);
  return id;
};

/** Update fields on a donation request */
export const updateDonationRequest = async (id, updates) => {
  await update(ref(db, `donationRequests/${id}`), updates);
};

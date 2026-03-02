/**
 * ─────────────────────────────────────────────
 * Firebase Realtime Database — Data Access Layer
 * ─────────────────────────────────────────────
 *
 * All RTDB paths:
 *   /users/{firebaseUid}
 *   /bloodInventory/{bloodType}   e.g. "A+"
 *   /appointments/{id}
 *   /donationHistory/{id}
 *   /donationRequests/{id}
 */

import { ref, get, set, push, update, remove } from 'firebase/database';
import { db } from '../firebase/firebase';

// ── Snapshot converters ──────────────────────────────────────────────────────

/**
 * Users: RTDB key is the Firebase UID.
 * We inject it as `uid` so components can reference it for updates/deletes.
 */
const usersSnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([uid, val]) => ({ ...val, uid }));
};

/**
 * General collections (appointments, donationHistory, donationRequests):
 * The `id` field is already stored inside the value by the seed / create helpers.
 */
const collectionSnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val());
};

/**
 * Blood inventory: RTDB key is the blood type string.
 * The `type` field is also stored inside the value, so no injection needed.
 */
const inventorySnap = (snapshot) => {
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val());
};

// ── Users ────────────────────────────────────────────────────────────────────

/** Fetch all users (returns array with `uid` field = Firebase UID) */
export const getUsers = async () => {
  const snapshot = await get(ref(db, 'users'));
  return usersSnap(snapshot);
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
 * Overwrite an inventory item.
 * `type` is the blood-type key, e.g. "A+".
 */
export const setInventoryItem = async (type, data) => {
  await set(ref(db, `bloodInventory/${type}`), { ...data, type });
};

// ── Appointments ─────────────────────────────────────────────────────────────

/** Fetch all appointments */
export const getAppointments = async () => {
  const snapshot = await get(ref(db, 'appointments'));
  return collectionSnap(snapshot);
};

/**
 * Create a new appointment.
 * Uses Firebase push() to generate a unique key, then stores `id` = that key.
 * Returns the generated id.
 */
export const createAppointment = async (appointmentData) => {
  const newRef = push(ref(db, 'appointments'));
  const id = newRef.key;
  await set(newRef, { ...appointmentData, id });
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

/** Create a new donation history record */
export const createDonationRecord = async (recordData) => {
  const newRef = push(ref(db, 'donationHistory'));
  const id = newRef.key;
  await set(newRef, { ...recordData, id });
  return id;
};

// ── Donation Requests ────────────────────────────────────────────────────────

/** Fetch all donation requests */
export const getDonationRequests = async () => {
  const snapshot = await get(ref(db, 'donationRequests'));
  return collectionSnap(snapshot);
};

/** Create a new donation request */
export const createDonationRequest = async (requestData) => {
  const newRef = push(ref(db, 'donationRequests'));
  const id = newRef.key;
  await set(newRef, { ...requestData, id });
  return id;
};

/** Update fields on a donation request */
export const updateDonationRequest = async (id, updates) => {
  await update(ref(db, `donationRequests/${id}`), updates);
};

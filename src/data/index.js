/**
 * ─────────────────────────────────────────────
 * Data Layer — Barrel Export
 * ─────────────────────────────────────────────
 *
 * Single import point for config and helpers.
 * All collection data is fetched from Firebase Realtime Database via src/data/db.js.
 *
 * Usage:
 *   import { timeSlots, isEligibleToDonate } from '../data';
 *   import { getAppointments, createAppointment } from '../data/db';
 */

// ── Configuration ───────────────────────────
export {
  APP_CONFIG,
  timeSlots,
  BLOOD_TYPES,
  DEMO_ACCOUNTS,
} from './config';

// ── Helper / Utility Functions ──────────────
export {
  getInventoryStatus,
  getInventoryColor,
  calculateDaysSinceLastDonation,
  isEligibleToDonate,
  getDaysUntilEligible,
} from './helpers';

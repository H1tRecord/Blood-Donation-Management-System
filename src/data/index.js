/**
 * ─────────────────────────────────────────────
 * Data Layer — Barrel Export
 * ─────────────────────────────────────────────
 *
 * Single import point for all collections, config, and helpers.
 *
 * Usage:
 *   import { users, appointments, timeSlots, isEligibleToDonate } from '../data';
 */

// ── Collections (Firestore tables) ──────────
export { users }              from './collections/users';
export { appointments }       from './collections/appointments';
export { donationHistory }    from './collections/donationHistory';
export { donationRequests }   from './collections/donationRequests';
export { bloodInventory }     from './collections/bloodInventory';

// ── Configuration ───────────────────────────
export {
  APP_CONFIG,
  timeSlots,
  BLOOD_TYPES,
  BLOOD_TYPE_COMPATIBILITY,
  DEMO_ACCOUNTS,
} from './config';

// ── Helper / Utility Functions ──────────────
export {
  getInventoryStatus,
  getInventoryColor,
  calculateDaysSinceLastDonation,
  isEligibleToDonate,
  getDaysUntilEligible,
  getBloodTypeCompatibility,
} from './helpers';

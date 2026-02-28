/**
 * DEPRECATED — legacy re-export shim.
 *
 * All data now lives in:
 *   src/data/collections/   → Firestore-ready collection files
 *   src/data/config.js      → App configuration & constants
 *   src/data/helpers.js     → Pure utility functions
 *
 * Prefer importing from '../data' (barrel) or the specific file.
 */
export {
  users,
  bloodInventory,
  appointments,
  donationHistory,
  donationRequests,
  timeSlots,
  APP_CONFIG,
  BLOOD_TYPES,
  BLOOD_TYPE_COMPATIBILITY,
  DEMO_ACCOUNTS,
  getInventoryStatus,
  getInventoryColor,
  calculateDaysSinceLastDonation,
  isEligibleToDonate,
  getDaysUntilEligible,
  getBloodTypeCompatibility,
} from './index';

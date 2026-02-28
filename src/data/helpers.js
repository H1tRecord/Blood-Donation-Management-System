/**
 * ─────────────────────────────────────────────
 * Pure Helper / Utility Functions
 * ─────────────────────────────────────────────
 *
 * These are stateless functions that operate on data values.
 * When migrating to Firebase they could become:
 *   • Cloud Functions (server-side validation)
 *   • Client-side utility module (same code)
 *   • Firestore Security Rules (eligibility checks)
 */

import { APP_CONFIG, BLOOD_TYPE_COMPATIBILITY } from './config';

// ── Inventory helpers ───────────────────────

/** Returns 'adequate' | 'low' | 'critical' based on unit count */
export const getInventoryStatus = (units) => {
  if (units >= 20) return 'adequate';
  if (units >= 10) return 'low';
  return 'critical';
};

/** Returns a colour keyword for inventory level */
export const getInventoryColor = (units) => {
  if (units >= 20) return 'green';
  if (units >= 10) return 'yellow';
  return 'red';
};

// ── Eligibility helpers ─────────────────────

const TODAY = new Date(APP_CONFIG.TODAY);

/** Days since a donor's last donation (null if never donated) */
export const calculateDaysSinceLastDonation = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  const last = new Date(lastDonationDate);
  const diffTime = TODAY - last;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/** Whether a donor has passed the deferral period */
export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true; // Never donated → eligible
  const days = calculateDaysSinceLastDonation(lastDonationDate);
  return days >= APP_CONFIG.DEFERRAL_PERIOD_DAYS;
};

/** Days remaining until a donor becomes eligible again (0 if already eligible) */
export const getDaysUntilEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 0;
  const days = calculateDaysSinceLastDonation(lastDonationDate);
  if (days >= APP_CONFIG.DEFERRAL_PERIOD_DAYS) return 0;
  return APP_CONFIG.DEFERRAL_PERIOD_DAYS - days;
};

// ── Blood-type helpers ──────────────────────

/** Returns the list of recipient blood types compatible with a given donor type */
export const getBloodTypeCompatibility = (bloodType) => {
  return BLOOD_TYPE_COMPATIBILITY[bloodType] || [];
};

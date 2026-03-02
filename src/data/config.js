/**
 * ─────────────────────────────────────────────
 * App Configuration
 * ─────────────────────────────────────────────
 *
 * In Firebase this could live in:
 *   • Firestore doc  →  config/app
 *   • Remote Config  →  for feature flags / tunables
 *   • Environment vars for secrets
 */

// ── Core settings ───────────────────────────
export const APP_CONFIG = {
  /** Simulated "today" for the mock environment */
  TODAY: '2026-02-28',
  /** Minimum days between whole-blood donations (FDA guideline) */
  DEFERRAL_PERIOD_DAYS: 56,
  /** Default max appointments per time-slot (admin calendar) */
  DEFAULT_SLOT_CAPACITY: 3,
};

// ── Time slots ──────────────────────────────
/** Available booking slots per day (8 one-hour windows) */
export const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

// ── Blood types ─────────────────────────────
/** All ABO / Rh blood groups tracked by the system */
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

// ── Demo / quick-login accounts ─────────────
/**
 * Pre-filled credentials shown on the login page for demonstration.
 * In production these would not exist — remove or gate behind an env flag.
 */
export const DEMO_ACCOUNTS = {
  donor: { email: 'john.smith@email.com', password: 'donor123' },
  staff: { email: 'nurse.smith@bdms.org',  password: 'staff123' },
  admin: { email: 'admin@bdms.org',        password: 'admin123' },
};

/**
 * ─────────────────────────────────────────────
 * Firestore Collection : blood_inventory
 * Document ID          : item.type  (A+, A-, B+, …)
 * ─────────────────────────────────────────────
 *
 * Each document tracks the current stock of one blood type.
 *
 * Firebase indexes recommended:
 *   - units (ASC)   — for finding critical/low types
 *   - expirationDate (ASC)
 */

export const bloodInventory = [
  { type: 'A+',  units: 25, lastUpdated: '2026-02-25', expirationDate: '2026-03-30' },
  { type: 'A-',  units: 8,  lastUpdated: '2026-02-24', expirationDate: '2026-03-25' },
  { type: 'B+',  units: 15, lastUpdated: '2026-02-25', expirationDate: '2026-04-01' },
  { type: 'B-',  units: 5,  lastUpdated: '2026-02-23', expirationDate: '2026-03-20' },
  { type: 'AB+', units: 12, lastUpdated: '2026-02-25', expirationDate: '2026-03-28' },
  { type: 'AB-', units: 3,  lastUpdated: '2026-02-22', expirationDate: '2026-03-15' },
  { type: 'O+',  units: 30, lastUpdated: '2026-02-26', expirationDate: '2026-04-05' },
  { type: 'O-',  units: 7,  lastUpdated: '2026-02-24', expirationDate: '2026-03-22' },
];

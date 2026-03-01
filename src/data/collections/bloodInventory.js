/**
 * ─────────────────────────────────────────────
 * Firestore Collection : blood_inventory
 * Document ID          : item.type  (A+, A-, B+, …)
 * ─────────────────────────────────────────────
 *
 * Each document tracks the current stock of one blood type.
 * `batches` tracks individual donation batches with their own expiry dates.
 * `units` is the total of all valid (non-expired) batches and is recalculated on load.
 * `expirationDate` reflects the nearest-expiring active batch.
 *
 * Firebase indexes recommended:
 *   - units (ASC)   — for finding critical/low types
 *   - expirationDate (ASC)
 */

export const bloodInventory = [
  {
    type: 'A+',
    units: 25,
    lastUpdated: '2026-02-25',
    expirationDate: '2026-03-07',
    batches: [
      { units: 5,  expirationDate: '2026-03-07' },   // 6 days — caution
      { units: 20, expirationDate: '2026-03-30' },
    ],
  },
  {
    type: 'A-',
    units: 8,
    lastUpdated: '2026-02-24',
    expirationDate: '2026-03-06',
    batches: [
      { units: 4, expirationDate: '2026-03-06' },    // 5 days — caution
      { units: 4, expirationDate: '2026-03-25' },
    ],
  },
  {
    type: 'B+',
    units: 15,
    lastUpdated: '2026-02-25',
    expirationDate: '2026-03-04',
    batches: [
      { units: 3,  expirationDate: '2026-03-04' },   // 3 days — warning
      { units: 12, expirationDate: '2026-04-01' },
    ],
  },
  {
    type: 'B-',
    units: 5,
    lastUpdated: '2026-02-23',
    expirationDate: '2026-03-04',
    batches: [
      { units: 5, expirationDate: '2026-03-04' },    // 3 days — warning
    ],
  },
  {
    type: 'AB+',
    units: 12,
    lastUpdated: '2026-02-25',
    expirationDate: '2026-03-02',
    batches: [
      { units: 2,  expirationDate: '2026-03-02' },   // 1 day  — critical
      { units: 10, expirationDate: '2026-03-28' },
    ],
  },
  {
    type: 'AB-',
    units: 3,
    lastUpdated: '2026-02-22',
    expirationDate: '2026-02-28',
    batches: [
      { units: 3, expirationDate: '2026-02-28' },    // already expired — auto-removed
    ],
  },
  {
    type: 'O+',
    units: 30,
    lastUpdated: '2026-02-26',
    expirationDate: '2026-03-03',
    batches: [
      { units: 2,  expirationDate: '2026-03-03' },   // 2 days — warning
      { units: 28, expirationDate: '2026-04-05' },
    ],
  },
  {
    type: 'O-',
    units: 7,
    lastUpdated: '2026-02-24',
    expirationDate: '2026-03-05',
    batches: [
      { units: 3, expirationDate: '2026-03-05' },    // 4 days — caution
      { units: 4, expirationDate: '2026-03-22' },
    ],
  },
];

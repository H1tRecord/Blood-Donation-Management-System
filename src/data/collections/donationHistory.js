/**
 * ─────────────────────────────────────────────
 * Firestore Collection : donation_history
 * Document ID          : donation.id  (DON001 …)
 * ─────────────────────────────────────────────
 *
 * Each document records one completed blood donation.
 *
 * Foreign keys:
 *   donorId → users/{donorId}
 *   staffId → users/{staffId}
 *
 * Firebase indexes recommended:
 *   - donorId (ASC), date (DESC)
 *   - bloodType (ASC), date (DESC)
 */

export const donationHistory = [
  {
    id: 'DON001',
    donorId: 'D001',
    donorName: 'John Smith',
    bloodType: 'O+',
    date: '2026-01-01',
    units: 1,
    staffId: 'S001',
    status: 'completed',
  },
  {
    id: 'DON002',
    donorId: 'D001',
    donorName: 'John Smith',
    bloodType: 'O+',
    date: '2025-11-05',
    units: 1,
    staffId: 'S002',
    status: 'completed',
  },
  {
    id: 'DON003',
    donorId: 'D002',
    donorName: 'Sarah Jones',
    bloodType: 'A+',
    date: '2026-02-15',
    units: 1,
    staffId: 'S001',
    status: 'completed',
  },
  {
    id: 'DON004',
    donorId: 'D003',
    donorName: 'Michael Brown',
    bloodType: 'B+',
    date: '2025-12-20',
    units: 1,
    staffId: 'S002',
    status: 'completed',
  },
  {
    id: 'DON005',
    donorId: 'D005',
    donorName: 'David Wilson',
    bloodType: 'O-',
    date: '2025-11-30',
    units: 1,
    staffId: 'S001',
    status: 'completed',
  },
];

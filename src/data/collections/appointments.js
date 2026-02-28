/**
 * ─────────────────────────────────────────────
 * Firestore Collection : appointments
 * Document ID          : appointment.id  (APT001 …)
 * ─────────────────────────────────────────────
 *
 * Status flow: pending → confirmed → checked-in → completed
 *              pending | confirmed → cancelled
 *
 * Foreign keys (denormalised for reads):
 *   donorId   → users/{donorId}
 *   donorName — copied at creation time
 *
 * Firebase indexes recommended:
 *   - date (ASC), time (ASC)
 *   - donorId (ASC), date (ASC)
 *   - status (ASC), date (ASC)
 */

export const appointments = [
  {
    id: 'APT001',
    donorId: 'D001',
    donorName: 'John Smith',
    bloodType: 'O+',
    date: '2026-02-27',
    time: '09:00 AM',
    status: 'confirmed',
    confirmationNumber: 'CONF-001',
    createdDate: '2026-02-20',
  },
  {
    id: 'APT002',
    donorId: 'D003',
    donorName: 'Michael Brown',
    bloodType: 'B+',
    date: '2026-02-27',
    time: '10:00 AM',
    status: 'confirmed',
    confirmationNumber: 'CONF-002',
    createdDate: '2026-02-21',
  },
  {
    id: 'APT003',
    donorId: 'D005',
    donorName: 'David Wilson',
    bloodType: 'O-',
    date: '2026-02-27',
    time: '02:00 PM',
    status: 'pending',
    confirmationNumber: 'CONF-003',
    createdDate: '2026-02-25',
  },
  {
    id: 'APT004',
    donorId: 'D007',
    donorName: 'James Anderson',
    bloodType: 'B-',
    date: '2026-02-28',
    time: '09:00 AM',
    status: 'confirmed',
    confirmationNumber: 'CONF-004',
    createdDate: '2026-02-22',
  },
  {
    id: 'APT005',
    donorId: 'D009',
    donorName: 'Robert Thomas',
    bloodType: 'O+',
    date: '2026-02-28',
    time: '11:00 AM',
    status: 'pending',
    confirmationNumber: 'CONF-005',
    createdDate: '2026-02-24',
  },
  {
    id: 'APT006',
    donorId: 'D002',
    donorName: 'Sarah Jones',
    bloodType: 'A+',
    date: '2026-03-01',
    time: '10:00 AM',
    status: 'cancelled',
    confirmationNumber: 'CONF-006',
    createdDate: '2026-02-18',
  },
  {
    id: 'APT007',
    donorId: 'D011',
    donorName: 'Alex Chen',
    bloodType: null, // First-time donor — blood type set by staff after testing
    date: '2026-02-27',
    time: '03:00 PM',
    status: 'confirmed',
    confirmationNumber: 'CONF-007',
    createdDate: '2026-02-26',
  },
];

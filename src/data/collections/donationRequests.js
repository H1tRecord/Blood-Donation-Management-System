/**
 * ─────────────────────────────────────────────
 * Firestore Collection : donation_requests
 * Document ID          : request.id  (REQ001 …)
 * ─────────────────────────────────────────────
 *
 * Status: pending | accepted | declined
 *
 * Foreign keys:
 *   requestedBy → users/{staffId}
 *   donorId     → users/{donorId}
 *
 * Firebase indexes recommended:
 *   - donorId (ASC), status (ASC)
 *   - bloodType (ASC), status (ASC)
 */

export const donationRequests = [
  {
    id: 'REQ001',
    bloodType: 'A-',
    requestedBy: 'S001',
    requestedByName: 'Nurse Smith',
    donorId: 'D006',
    donorName: 'Lisa Martinez',
    requestDate: '2026-02-24',
    status: 'pending',
    message: 'We urgently need A- blood. Would you be able to donate soon?',
  },
  {
    id: 'REQ002',
    bloodType: 'B-',
    requestedBy: 'S002',
    requestedByName: 'Tech Johnson',
    donorId: 'D007',
    donorName: 'James Anderson',
    requestDate: '2026-02-23',
    status: 'accepted',
    message: 'Our B- inventory is critically low. Can you help?',
    responseDate: '2026-02-24',
    responseMessage: 'Yes, I can come in this week.',
  },
  {
    id: 'REQ003',
    bloodType: 'AB-',
    requestedBy: 'S001',
    requestedByName: 'Nurse Smith',
    donorId: 'D008',
    donorName: 'Jennifer Taylor',
    requestDate: '2026-02-22',
    status: 'declined',
    message: 'We need AB- donations. Are you available?',
    responseDate: '2026-02-23',
    responseMessage: 'Sorry, I am traveling this month.',
  },
  {
    id: 'REQ004',
    bloodType: 'O-',
    requestedBy: 'S001',
    requestedByName: 'Nurse Smith',
    donorId: 'D005',
    donorName: 'David Wilson',
    requestDate: '2026-02-25',
    status: 'pending',
    message: 'O- is running low. Your donation would be greatly appreciated!',
  },
];

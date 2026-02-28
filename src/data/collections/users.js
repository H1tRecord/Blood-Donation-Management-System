/**
 * ─────────────────────────────────────────────
 * Firestore Collection : users
 * Document ID          : user.id  (D001, S001, A001 …)
 * ─────────────────────────────────────────────
 *
 * Roles: donor | staff | admin
 *
 * Donor-specific fields : bloodType, lastDonationDate, donationCount
 * Staff-specific fields : position
 *
 * Firebase indexes recommended:
 *   - role (ASC), name (ASC)
 *   - role (ASC), isActive (ASC)
 *   - bloodType (ASC), isActive (ASC)
 */

export const users = [
  // ── Donors ────────────────────────────────
  {
    id: 'D001',
    role: 'donor',
    email: 'john.smith@email.com',
    password: 'donor123',
    name: 'John Smith',
    phone: '555-0101',
    bloodType: 'O+',
    registrationDate: '2025-01-15',
    lastDonationDate: '2026-01-01',
    donationCount: 5,
    isActive: true,
  },
  {
    id: 'D002',
    role: 'donor',
    email: 'sarah.jones@email.com',
    password: 'donor123',
    name: 'Sarah Jones',
    phone: '555-0102',
    bloodType: 'A+',
    registrationDate: '2025-03-20',
    lastDonationDate: '2026-02-15',
    donationCount: 3,
    isActive: true,
  },
  {
    id: 'D003',
    role: 'donor',
    email: 'michael.brown@email.com',
    password: 'donor123',
    name: 'Michael Brown',
    phone: '555-0103',
    bloodType: 'B+',
    registrationDate: '2025-02-10',
    lastDonationDate: '2025-12-20',
    donationCount: 4,
    isActive: true,
  },
  {
    id: 'D004',
    role: 'donor',
    email: 'emily.davis@email.com',
    password: 'donor123',
    name: 'Emily Davis',
    phone: '555-0104',
    bloodType: 'AB+',
    registrationDate: '2025-04-05',
    lastDonationDate: '2026-01-10',
    donationCount: 2,
    isActive: true,
  },
  {
    id: 'D005',
    role: 'donor',
    email: 'david.wilson@email.com',
    password: 'donor123',
    name: 'David Wilson',
    phone: '555-0105',
    bloodType: 'O-',
    registrationDate: '2025-05-12',
    lastDonationDate: '2025-11-30',
    donationCount: 6,
    isActive: true,
  },
  {
    id: 'D006',
    role: 'donor',
    email: 'lisa.martinez@email.com',
    password: 'donor123',
    name: 'Lisa Martinez',
    phone: '555-0106',
    bloodType: 'A-',
    registrationDate: '2025-06-18',
    lastDonationDate: '2026-01-05',
    donationCount: 3,
    isActive: true,
  },
  {
    id: 'D007',
    role: 'donor',
    email: 'james.anderson@email.com',
    password: 'donor123',
    name: 'James Anderson',
    phone: '555-0107',
    bloodType: 'B-',
    registrationDate: '2025-07-22',
    lastDonationDate: '2025-12-10',
    donationCount: 2,
    isActive: true,
  },
  {
    id: 'D008',
    role: 'donor',
    email: 'jennifer.taylor@email.com',
    password: 'donor123',
    name: 'Jennifer Taylor',
    phone: '555-0108',
    bloodType: 'AB-',
    registrationDate: '2025-08-30',
    lastDonationDate: null,
    donationCount: 0,
    isActive: true,
  },
  {
    id: 'D009',
    role: 'donor',
    email: 'robert.thomas@email.com',
    password: 'donor123',
    name: 'Robert Thomas',
    phone: '555-0109',
    bloodType: 'O+',
    registrationDate: '2025-09-14',
    lastDonationDate: '2025-12-25',
    donationCount: 1,
    isActive: true,
  },
  {
    id: 'D010',
    role: 'donor',
    email: 'mary.jackson@email.com',
    password: 'donor123',
    name: 'Mary Jackson',
    phone: '555-0110',
    bloodType: 'A+',
    registrationDate: '2025-10-20',
    lastDonationDate: '2026-02-10',
    donationCount: 2,
    isActive: true,
  },
  {
    id: 'D011',
    role: 'donor',
    email: 'alex.chen@email.com',
    password: 'donor123',
    name: 'Alex Chen',
    phone: '555-0111',
    bloodType: null, // First-time donor — blood type determined at first visit
    registrationDate: '2026-02-26',
    lastDonationDate: null,
    donationCount: 0,
    isActive: true,
  },

  // ── Staff ─────────────────────────────────
  {
    id: 'S001',
    role: 'staff',
    email: 'nurse.smith@bdms.org',
    password: 'staff123',
    name: 'Nurse Smith',
    phone: '555-0201',
    position: 'Registered Nurse',
    registrationDate: '2025-01-01',
    isActive: true,
  },
  {
    id: 'S002',
    role: 'staff',
    email: 'phlebotomist.johnson@bdms.org',
    password: 'staff123',
    name: 'Tech Johnson',
    phone: '555-0202',
    position: 'Phlebotomist',
    registrationDate: '2025-01-01',
    isActive: true,
  },

  // ── Admin ─────────────────────────────────
  {
    id: 'A001',
    role: 'admin',
    email: 'admin@bdms.org',
    password: 'admin123',
    name: 'Admin User',
    phone: '555-0301',
    registrationDate: '2025-01-01',
    isActive: true,
  },
];

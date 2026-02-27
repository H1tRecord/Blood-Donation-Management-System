// Mock Data for Blood Donation Management System
// Based on SRS_Simplified.txt

// Current date for calculations
const TODAY = new Date('2026-02-26');

// Users (Donors, Staff, Admins)
export const users = [
  // Donors
  {
    id: 'D001',
    role: 'donor',
    email: 'john.smith@email.com',
    password: 'donor123',
    name: 'John Smith',
    phone: '555-0101',
    bloodType: 'O+',
    registrationDate: '2025-01-15',
    lastDonationDate: '2026-01-01', // 56 days ago = eligible now
    donationCount: 5,
    isActive: true
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
    lastDonationDate: '2026-02-15', // 11 days ago = ineligible
    donationCount: 3,
    isActive: true
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
    lastDonationDate: '2025-12-20', // 68 days ago = eligible
    donationCount: 4,
    isActive: true
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
    lastDonationDate: '2026-01-10', // 47 days ago = ineligible
    donationCount: 2,
    isActive: true
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
    lastDonationDate: '2025-11-30', // 88 days ago = eligible
    donationCount: 6,
    isActive: true
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
    lastDonationDate: '2026-01-05', // 52 days ago = ineligible
    donationCount: 3,
    isActive: true
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
    lastDonationDate: '2025-12-10', // 78 days ago = eligible
    donationCount: 2,
    isActive: true
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
    lastDonationDate: null, // Never donated
    donationCount: 0,
    isActive: true
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
    lastDonationDate: '2025-12-25', // 63 days ago = eligible
    donationCount: 1,
    isActive: true
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
    lastDonationDate: '2026-02-10', // 16 days ago = ineligible
    donationCount: 2,
    isActive: true
  },
  {
    id: 'D011',
    role: 'donor',
    email: 'alex.chen@email.com',
    password: 'donor123',
    name: 'Alex Chen',
    phone: '555-0111',
    bloodType: null, // First-time donor - blood type to be determined
    registrationDate: '2026-02-26',
    lastDonationDate: null,
    donationCount: 0,
    isActive: true
  },
  
  // Staff
  {
    id: 'S001',
    role: 'staff',
    email: 'nurse.smith@bdms.org',
    password: 'staff123',
    name: 'Nurse Smith',
    phone: '555-0201',
    position: 'Registered Nurse',
    registrationDate: '2025-01-01',
    isActive: true
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
    isActive: true
  },
  
  // Admin
  {
    id: 'A001',
    role: 'admin',
    email: 'admin@bdms.org',
    password: 'admin123',
    name: 'Admin User',
    phone: '555-0301',
    registrationDate: '2025-01-01',
    isActive: true
  }
];

// Blood Inventory (8 blood types)
export const bloodInventory = [
  { type: 'A+', units: 25, lastUpdated: '2026-02-25', expirationDate: '2026-03-30' },
  { type: 'A-', units: 8, lastUpdated: '2026-02-24', expirationDate: '2026-03-25' },
  { type: 'B+', units: 15, lastUpdated: '2026-02-25', expirationDate: '2026-04-01' },
  { type: 'B-', units: 5, lastUpdated: '2026-02-23', expirationDate: '2026-03-20' },
  { type: 'AB+', units: 12, lastUpdated: '2026-02-25', expirationDate: '2026-03-28' },
  { type: 'AB-', units: 3, lastUpdated: '2026-02-22', expirationDate: '2026-03-15' },
  { type: 'O+', units: 30, lastUpdated: '2026-02-26', expirationDate: '2026-04-05' },
  { type: 'O-', units: 7, lastUpdated: '2026-02-24', expirationDate: '2026-03-22' }
];

// Appointments
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
    createdDate: '2026-02-20'
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
    createdDate: '2026-02-21'
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
    createdDate: '2026-02-25'
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
    createdDate: '2026-02-22'
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
    createdDate: '2026-02-24'
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
    createdDate: '2026-02-18'
  },
  {
    id: 'APT007',
    donorId: 'D011',
    donorName: 'Alex Chen',
    bloodType: null, // First-time donor - blood type to be determined by staff
    date: '2026-02-27',
    time: '03:00 PM',
    status: 'confirmed',
    confirmationNumber: 'CONF-007',
    createdDate: '2026-02-26'
  }
];

// Donation History
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
    hemoglobin: 14.2
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
    hemoglobin: 13.8
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
    hemoglobin: 13.5
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
    hemoglobin: 14.5
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
    hemoglobin: 15.1
  }
];

// Donation Requests (Staff requests to eligible donors)
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
    message: 'We urgently need A- blood. Would you be able to donate soon?'
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
    responseMessage: 'Yes, I can come in this week.'
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
    responseMessage: 'Sorry, I am traveling this month.'
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
    message: 'O- is running low. Your donation would be greatly appreciated!'
  }
];

// Available time slots for appointments (next 7 days)
export const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
];

// Helper functions
export const getInventoryStatus = (units) => {
  if (units >= 20) return 'adequate';
  if (units >= 10) return 'low';
  return 'critical';
};

export const getInventoryColor = (units) => {
  if (units >= 20) return 'green';
  if (units >= 10) return 'yellow';
  return 'red';
};

export const calculateDaysSinceLastDonation = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  const last = new Date(lastDonationDate);
  const diffTime = TODAY - last;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true; // Never donated = eligible
  const days = calculateDaysSinceLastDonation(lastDonationDate);
  return days >= 56; // 56-day deferral period
};

export const getDaysUntilEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 0;
  const days = calculateDaysSinceLastDonation(lastDonationDate);
  if (days >= 56) return 0;
  return 56 - days;
};

export const getBloodTypeCompatibility = (bloodType) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  return compatibility[bloodType] || [];
};

export default {
  users,
  bloodInventory,
  appointments,
  donationHistory,
  donationRequests,
  timeSlots,
  getInventoryStatus,
  getInventoryColor,
  calculateDaysSinceLastDonation,
  isEligibleToDonate,
  getDaysUntilEligible,
  getBloodTypeCompatibility
};

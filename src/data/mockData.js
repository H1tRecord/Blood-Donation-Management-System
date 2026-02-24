// Mock data for Blood Donation Management System

export const mockDonorProfile = {
  id: 'D001',
  name: 'John Smith',
  email: 'john.smith@email.com',
  bloodType: 'O+',
  phone: '555-123-4567',
  dateOfBirth: '1990-05-15',
  address: '123 Main St, Springfield, IL 62701',
  lastDonation: '2025-12-28',
  totalDonations: 8,
  nextEligibleDate: '2026-02-22', // 56 days after last donation
};

export const mockDonationHistory = [
  {
    id: 'DON008',
    date: '2025-12-28',
    location: 'Springfield Blood Center',
    type: 'Whole Blood',
    volume: '450ml',
    hemoglobin: '14.2 g/dL',
    bloodPressure: '120/78 mmHg',
    status: 'Completed',
  },
  {
    id: 'DON007',
    date: '2025-10-15',
    location: 'Community Hospital Drive',
    type: 'Whole Blood',
    volume: '450ml',
    hemoglobin: '13.8 g/dL',
    bloodPressure: '118/75 mmHg',
    status: 'Completed',
  },
  {
    id: 'DON006',
    date: '2025-08-02',
    location: 'Springfield Blood Center',
    type: 'Platelets',
    volume: '200ml',
    hemoglobin: '14.0 g/dL',
    bloodPressure: '122/80 mmHg',
    status: 'Completed',
  },
  {
    id: 'DON005',
    date: '2025-05-20',
    location: 'Mobile Blood Drive - City Hall',
    type: 'Whole Blood',
    volume: '450ml',
    hemoglobin: '13.5 g/dL',
    bloodPressure: '115/72 mmHg',
    status: 'Completed',
  },
  {
    id: 'DON004',
    date: '2025-03-08',
    location: 'Springfield Blood Center',
    type: 'Whole Blood',
    volume: '450ml',
    hemoglobin: '14.1 g/dL',
    bloodPressure: '119/76 mmHg',
    status: 'Completed',
  },
];

export const mockDonationCenters = [
  {
    id: 'CTR001',
    name: 'Springfield Blood Center',
    address: '456 Health Ave, Springfield, IL 62702',
    phone: '555-DONATE-1',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
  },
  {
    id: 'CTR002',
    name: 'Community Hospital Blood Bank',
    address: '789 Hospital Rd, Springfield, IL 62703',
    phone: '555-DONATE-2',
    hours: 'Mon-Sat: 7AM-7PM',
  },
  {
    id: 'CTR003',
    name: 'Downtown Donation Station',
    address: '101 Central Blvd, Springfield, IL 62701',
    phone: '555-DONATE-3',
    hours: 'Tue-Sat: 10AM-5PM',
  },
];

export const mockAvailableSlots = {
  'CTR001': {
    '2026-02-25': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    '2026-02-26': ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'],
    '2026-02-27': ['8:30 AM', '10:00 AM', '11:30 AM', '3:00 PM'],
    '2026-02-28': ['9:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '4:30 PM'],
    '2026-03-01': ['9:30 AM', '10:30 AM', '11:30 AM'],
  },
  'CTR002': {
    '2026-02-25': ['7:30 AM', '9:00 AM', '11:00 AM', '1:00 PM', '4:00 PM', '5:30 PM'],
    '2026-02-26': ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'],
    '2026-02-27': ['7:30 AM', '9:30 AM', '11:30 AM', '3:30 PM', '5:00 PM'],
    '2026-02-28': ['8:00 AM', '10:30 AM', '1:30 PM', '3:00 PM', '5:30 PM'],
    '2026-03-01': ['9:00 AM', '11:00 AM', '1:00 PM'],
  },
  'CTR003': {
    '2026-02-25': ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'],
    '2026-02-26': ['10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM'],
    '2026-02-27': ['10:00 AM', '11:00 AM', '1:30 PM', '3:00 PM', '4:30 PM'],
    '2026-02-28': ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM'],
    '2026-03-01': ['10:00 AM', '11:30 AM', '1:00 PM'],
  },
};

// Staff/Admin mock data
export const mockBloodInventory = [
  { bloodType: 'A+', units: 45, status: 'adequate', expiringIn7Days: 5 },
  { bloodType: 'A-', units: 12, status: 'low', expiringIn7Days: 2 },
  { bloodType: 'B+', units: 38, status: 'adequate', expiringIn7Days: 4 },
  { bloodType: 'B-', units: 8, status: 'critical', expiringIn7Days: 1 },
  { bloodType: 'AB+', units: 22, status: 'adequate', expiringIn7Days: 3 },
  { bloodType: 'AB-', units: 6, status: 'low', expiringIn7Days: 0 },
  { bloodType: 'O+', units: 52, status: 'adequate', expiringIn7Days: 8 },
  { bloodType: 'O-', units: 15, status: 'low', expiringIn7Days: 2 },
];

export const mockDonorDatabase = [
  {
    id: 'D001',
    name: 'John Smith',
    bloodType: 'O+',
    email: 'john.smith@email.com',
    phone: '555-123-4567',
    lastDonation: '2025-12-28',
    totalDonations: 8,
    status: 'Active',
  },
  {
    id: 'D002',
    name: 'Sarah Johnson',
    bloodType: 'A-',
    email: 'sarah.j@email.com',
    phone: '555-234-5678',
    lastDonation: '2026-01-15',
    totalDonations: 12,
    status: 'Active',
  },
  {
    id: 'D003',
    name: 'Michael Brown',
    bloodType: 'B+',
    email: 'm.brown@email.com',
    phone: '555-345-6789',
    lastDonation: '2025-11-20',
    totalDonations: 5,
    status: 'Eligible',
  },
  {
    id: 'D004',
    name: 'Emily Davis',
    bloodType: 'AB+',
    email: 'emily.d@email.com',
    phone: '555-456-7890',
    lastDonation: '2026-02-10',
    totalDonations: 3,
    status: 'Deferred',
  },
  {
    id: 'D005',
    name: 'David Wilson',
    bloodType: 'O-',
    email: 'd.wilson@email.com',
    phone: '555-567-8901',
    lastDonation: '2025-09-05',
    totalDonations: 20,
    status: 'Eligible',
  },
  {
    id: 'D006',
    name: 'Jennifer Taylor',
    bloodType: 'A+',
    email: 'j.taylor@email.com',
    phone: '555-678-9012',
    lastDonation: '2026-01-22',
    totalDonations: 7,
    status: 'Active',
  },
];

export const mockUpcomingAppointments = [
  {
    id: 'APT001',
    donorId: 'D003',
    donorName: 'Michael Brown',
    bloodType: 'B+',
    date: '2026-02-25',
    time: '10:00 AM',
    center: 'Springfield Blood Center',
    status: 'Confirmed',
  },
  {
    id: 'APT002',
    donorId: 'D005',
    donorName: 'David Wilson',
    bloodType: 'O-',
    date: '2026-02-25',
    time: '11:30 AM',
    center: 'Springfield Blood Center',
    status: 'Confirmed',
  },
  {
    id: 'APT003',
    donorId: 'D006',
    donorName: 'Jennifer Taylor',
    bloodType: 'A+',
    date: '2026-02-26',
    time: '9:00 AM',
    center: 'Community Hospital Blood Bank',
    status: 'Pending',
  },
];

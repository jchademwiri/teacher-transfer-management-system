import { School, Subject, TransferRequest, Teacher } from '@/types';

export const MOCK_SCHOOLS: School[] = [
  {
    id: "1",
    name: "Central Primary School",
    district: "Central District",
    type: "primary",
    address: "123 Main St, Central City",
    headmasterId: "2"
  },
  {
    id: "2",
    name: "Eastside Secondary School",
    district: "Eastern District",
    type: "secondary",
    address: "456 East Rd, Eastern Town"
  },
  {
    id: "3",
    name: "Northern Combined School",
    district: "Northern District",
    type: "combined",
    address: "789 North Ave, Northern City"
  },
  {
    id: "4",
    name: "Western Primary School",
    district: "Western District",
    type: "primary",
    address: "321 West Blvd, Western Village"
  }
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: "1", name: "Mathematics", level: "all" },
  { id: "2", name: "English", level: "all" },
  { id: "3", name: "Science", level: "all" },
  { id: "4", name: "History", level: "all" },
  { id: "5", name: "Geography", level: "all" },
  { id: "6", name: "Physical Education", level: "all" },
  { id: "7", name: "Art", level: "all" },
  { id: "8", name: "Music", level: "all" },
  { id: "9", name: "Computer Studies", level: "secondary" },
  { id: "10", name: "Physics", level: "secondary" },
  { id: "11", name: "Chemistry", level: "secondary" },
  { id: "12", name: "Biology", level: "secondary" }
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: "1",
    email: "teacher@example.com",
    ecNumber: "EC123456",
    name: "John Teacher",
    role: "teacher",
    schoolId: "1",
    subjectIds: ["1", "3"],
    level: "Primary",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    email: "jane.doe@example.com",
    ecNumber: "EC234567",
    name: "Jane Doe",
    role: "teacher",
    schoolId: "1",
    subjectIds: ["2", "4"],
    level: "Primary",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    email: "mark.smith@example.com",
    ecNumber: "EC345678",
    name: "Mark Smith",
    role: "teacher",
    schoolId: "2",
    subjectIds: ["1", "9", "10"],
    level: "Secondary",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    email: "sarah.johnson@example.com",
    ecNumber: "EC456789",
    name: "Sarah Johnson",
    role: "teacher",
    schoolId: "3",
    subjectIds: ["2", "5", "7"],
    level: "Combined",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const MOCK_TRANSFER_REQUESTS: TransferRequest[] = [
  {
    id: "1",
    teacherId: "1",
    fromSchoolId: "1",
    toSchoolId: "2",
    reason: "Moving closer to home",
    status: "pending_head_approval",
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    teacherId: "4",
    fromSchoolId: "1",
    toDistrict: "Northern District",
    reason: "Family relocation",
    status: "forwarded_to_admin",
    headmasterComment: "Approved, good standing teacher",
    submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    headmasterActionAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    teacherId: "5",
    fromSchoolId: "2",
    toSchoolId: "3",
    reason: "Professional development opportunity",
    status: "approved_by_admin",
    headmasterComment: "Highly recommend approval",
    adminComment: "Transfer approved effective next term",
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    headmasterActionAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    adminActionAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    teacherId: "6",
    fromSchoolId: "3",
    toDistrict: "Central District",
    reason: "Better opportunities for children's education",
    status: "rejected_by_headmaster",
    headmasterComment: "Cannot spare this teacher at this time",
    submittedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    headmasterActionAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    teacherId: "1",
    fromSchoolId: "1",
    toSchoolId: "4",
    reason: "Seeking new teaching environment",
    status: "rejected_by_admin",
    headmasterComment: "Recommended for approval",
    adminComment: "Position already filled at destination school",
    submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    headmasterActionAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), // 55 days ago
    adminActionAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days ago
    updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Add pending requests as a filtered subset of transfer requests
export const MOCK_PENDING_REQUESTS = MOCK_TRANSFER_REQUESTS.filter(
  req => req.status === 'pending_head_approval' || req.status === 'forwarded_to_admin'
);

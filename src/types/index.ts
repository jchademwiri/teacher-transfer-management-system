export type UserRole = "teacher" | "headmaster" | "admin";

export type RequestStatus = 
  | "submitted" 
  | "pending_head_approval" 
  | "rejected_by_headmaster"
  | "forwarded_to_admin"
  | "rejected_by_admin"
  | "approved_by_admin"
  | "withdrawn_by_teacher"
  | "expired";

export interface User {
  id: string;
  email: string;
  ecNumber?: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  setupComplete: boolean;
  school?: {
    id: string;
    name: string;
    type: string;
    district: string;
  };
}

export interface Teacher extends User {
  role: "teacher";
  schoolId: string;
  subjectIds: string[];
  level: string; // e.g. Primary, Secondary
}

export interface School {
  id: string;
  name: string;
  district: string;
  type: string; // Changed from "primary" | "secondary" | "combined" to string to match what's coming from the database
  address: string;
  headmasterId?: string;
}

export interface Subject {
  id: string;
  name: string;
  level: "primary" | "secondary" | "all";
}

export interface TransferRequest {
  id: string;
  teacherId: string;
  fromSchoolId: string;
  toSchoolId?: string;
  toDistrict?: string;
  reason: string;
  status: RequestStatus;
  headmasterComment?: string;
  adminComment?: string;
  submittedAt: string;
  headmasterActionAt?: string;
  adminActionAt?: string;
  updatedAt: string;
  _teachers?: any; // Property for joined teacher data
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Headmaster extends User {
  role: "headmaster";
  schoolId: string;
}

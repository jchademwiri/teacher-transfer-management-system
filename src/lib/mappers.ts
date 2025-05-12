
import { School, Subject, Teacher, TransferRequest, District, Headmaster } from "@/types";

// Map database response to TypeScript types
export const mapTransferRequest = (data: any): TransferRequest => ({
  id: data.id,
  teacherId: data.teacher_id,
  fromSchoolId: data.from_school_id,
  toSchoolId: data.to_school_id || undefined,
  toDistrict: data.to_district || undefined,
  reason: data.reason,
  status: data.status,
  headmasterComment: data.headmaster_comment || undefined,
  adminComment: data.admin_comment || undefined,
  submittedAt: data.submitted_at,
  headmasterActionAt: data.headmaster_action_at || undefined,
  adminActionAt: data.admin_action_at || undefined,
  updatedAt: data.updated_at,
  // Store joined teacher data in a separate property if it exists
  _teachers: data.teachers || undefined, 
});

export const mapSchool = (data: any): School => ({
  id: data.id,
  name: data.name,
  district: data.district,
  type: data.type as string,
  address: data.address || "",
  headmasterId: data.headmaster_id || undefined,
});

export const mapTeacher = (data: any): Teacher => ({
  id: data.id,
  email: data.email || "", // Fill this from User data if available
  ecNumber: data.ec_number,
  name: data.name,
  role: "teacher",
  schoolId: data.school_id,
  subjectIds: data.subject_ids || [], // This would need to be populated separately
  level: data.level,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  isActive: data.is_active || false,
  setupComplete: data.setup_complete || false,
});

export const mapSubject = (data: any): Subject => ({
  id: data.id,
  name: data.name,
  level: data.level as "primary" | "secondary" | "all",
});

export const mapDistrict = (data: any): District => ({
  id: data.id,
  name: data.name,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const mapHeadmaster = (data: any): Headmaster => ({
  id: data.id,
  email: data.email || "", // Fill this from User data if available
  ecNumber: data.ec_number,
  name: data.name,
  role: "headmaster",
  schoolId: data.school_id,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  isActive: data.is_active || false,
  setupComplete: data.setup_complete || false,
});

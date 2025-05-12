
import { School, Subject, TransferRequest, Teacher, District } from '@/types';

/**
 * Maps a database school to our application model
 */
export function mapSchool(dbSchool: any): School {
  return {
    id: dbSchool.id,
    name: dbSchool.name,
    district: dbSchool.district,
    type: dbSchool.type,
    address: dbSchool.address || '',
    headmasterId: dbSchool.headmaster_id
  };
}

/**
 * Maps a database subject to our application model
 */
export function mapSubject(dbSubject: any): Subject {
  return {
    id: dbSubject.id,
    name: dbSubject.name,
    level: dbSubject.level
  };
}

/**
 * Maps a database transfer request to our application model
 */
export function mapTransferRequest(dbRequest: any): TransferRequest {
  return {
    id: dbRequest.id,
    teacherId: dbRequest.teacher_id,
    fromSchoolId: dbRequest.from_school_id,
    toSchoolId: dbRequest.to_school_id,
    toDistrict: dbRequest.to_district,
    reason: dbRequest.reason,
    status: dbRequest.status,
    headmasterComment: dbRequest.headmaster_comment,
    adminComment: dbRequest.admin_comment,
    submittedAt: dbRequest.submitted_at,
    headmasterActionAt: dbRequest.headmaster_action_at,
    adminActionAt: dbRequest.admin_action_at,
    updatedAt: dbRequest.updated_at,
    _teachers: dbRequest.teachers
  };
}

/**
 * Maps a database teacher to our application model
 */
export function mapTeacher(dbTeacher: any): Teacher {
  return {
    id: dbTeacher.id,
    email: dbTeacher.email || '',
    ecNumber: dbTeacher.ec_number,
    name: dbTeacher.name,
    role: 'teacher',
    schoolId: dbTeacher.school_id,
    subjectIds: dbTeacher.subject_ids || [],
    level: dbTeacher.level,
    createdAt: dbTeacher.created_at,
    updatedAt: dbTeacher.updated_at,
    isActive: dbTeacher.is_active !== false, // Default to true if not specified
    setupComplete: dbTeacher.setup_complete !== false // Default to true if not specified
  };
}

/**
 * Maps a database district to our application model
 */
export function mapDistrict(dbDistrict: any): District {
  return {
    id: dbDistrict.id,
    name: dbDistrict.name,
    createdAt: dbDistrict.created_at,
    updatedAt: dbDistrict.updated_at
  };
}

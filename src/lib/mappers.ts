
import { School, Subject, TransferRequest, Teacher, District, User } from '@/types';

export const mapSchool = (data: any): School => {
  return {
    id: data.id || '',
    name: data.name || '',
    district: data.district || '',
    type: data.type || '',
    address: data.address || '',
    headmasterId: data.headmaster_id || null,
  };
};

export const mapUser = (data: any): User =>{
return{
  id: data.id || '',
  email: data.email || '',
  name: data.name || '',
  role: data.role || 'teacher',
  schoolId: data.school_id || null,
  createdAt: data.created_at || new Date().toISOString(),
  updatedAt: data.updated_at || new Date().toISOString(),
  isActive: data.is_active ?? true,
  setupComplete: data.setup_complete ?? false
}
}

export const mapSubject = (data: any): Subject => {
  return {
    id: data.id || '',
    name: data.name || '',
    level: data.level || 'all',
  };
};

export const mapTransferRequest = (data: any): TransferRequest => {
  return {
    id: data.id || '',
    teacherId: data.teacher_id || '',
    fromSchoolId: data.from_school_id || '',
    toSchoolId: data.to_school_id || null,
    toDistrict: data.to_district || '',
    reason: data.reason || '',
    status: data.status || 'submitted',
    headmasterComment: data.headmaster_comment || '',
    adminComment: data.admin_comment || '',
    submittedAt: data.submitted_at || new Date().toISOString(),
    headmasterActionAt: data.headmaster_action_at || null,
    adminActionAt: data.admin_action_at || null,
    updatedAt: data.updated_at || new Date().toISOString(),
    _teachers: data.teachers || null,
  };
};

export const mapTeacher = (data: any): Teacher => {
  return {
    id: data.id || '',
    email: data.email || '',
    ecNumber: data.ec_number || '',
    name: data.name || '',
    role: 'teacher',
    schoolId: data.school_id || '',
    subjectIds: data.subject_ids || [],
    level: data.level || '',
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
    isActive: data.is_active || false,
    setupComplete: data.setup_complete || false,
  };
};

export const mapDistrict = (data: any): District => {
  return {
    id: data.id || '',
    name: data.name || '',
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
};

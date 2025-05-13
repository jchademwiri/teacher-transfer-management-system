
import { School, Subject } from '@/types';

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

export const mapSubject = (data: any): Subject => {
  return {
    id: data.id || '',
    name: data.name || '',
    level: data.level || 'all',
  };
};


import * as z from 'zod';
import { UserRole } from '@/types';

// Define roles as a constant to avoid redundancy
export const USER_ROLES = ['admin', 'teacher', 'headmaster'] as const;

// Form schema for user creation/update
export const userSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(USER_ROLES),
  schoolId: z.string().optional(),
  subjectId: z.string().optional(),
});

// Define the form values type directly
export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId?: string;
  subjectId?: string;
};

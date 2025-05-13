
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, School, Subject } from '@/types';
import { mapSchool, mapSubject } from '@/lib/mappers';

// Define more specific types for the database query results
interface TeacherRecord {
  id: string;
  user_id?: string;
  school_id?: string;
  ec_number?: string;
  name?: string;
  users?: {
    id?: string;
    email?: string;
    name?: string;
    is_active?: boolean;
  } | null;
  schools?: {
    id?: string;
    name?: string;
    district?: string;
  } | null;
}

interface HeadmasterRecord {
  id: string;
  user_id?: string;
  school_id?: string;
  ec_number?: string;
  name?: string;
  users?: {
    id?: string;
    email?: string;
    name?: string;
    is_active?: boolean;
  } | null;
  schools?: {
    id?: string;
    name?: string;
    district?: string;
  } | null;
}

interface AdminRecord {
  id: string;
  email?: string;
  name?: string;
  is_active?: boolean;
  role?: string;
}

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch teachers with their user information
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          id, 
          users:user_id (id, email, name, is_active), 
          schools:school_id (id, name, district)
        `);

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
      }

      // Fetch headmasters with their user information
      const { data: headmastersData, error: headmastersError } = await supabase
        .from('headmasters')
        .select(`
          id, 
          users:user_id (id, email, name, is_active),
          schools:school_id (id, name, district)
        `);

      if (headmastersError) {
        console.error('Error fetching headmasters:', headmastersError);
      }

      // Fetch admins (plain users with admin role)
      const { data: adminsData, error: adminsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

      if (adminsError) {
        console.error('Error fetching admins:', adminsError);
      }

      // Map and combine the user data with proper type handling
      const teachers = (teachersData || []).map((teacher: TeacherRecord) => {
        const userData = teacher.users || {};
        const schoolData = teacher.schools || {};
        
        return {
          id: userData.id || teacher.id || '',
          email: userData.email || '',
          name: userData.name || teacher.name || 'Unknown Teacher',
          role: 'teacher' as const,
          isActive: !!userData.is_active,
          schoolId: schoolData.id,
          createdAt: '',
          updatedAt: '',
          setupComplete: false
        };
      });

      const headmasters = (headmastersData || []).map((headmaster: HeadmasterRecord) => {
        const userData = headmaster.users || {};
        const schoolData = headmaster.schools || {};
        
        return {
          id: userData.id || headmaster.id || '',
          email: userData.email || '',
          name: userData.name || headmaster.name || 'Unknown Headmaster',
          role: 'headmaster' as const,
          isActive: !!userData.is_active,
          schoolId: schoolData.id,
          createdAt: '',
          updatedAt: '',
          setupComplete: false
        };
      });

      const admins = (adminsData || []).map((admin: AdminRecord) => ({
        id: admin.id || '',
        email: admin.email || '',
        name: admin.name || 'Admin User',
        role: 'admin' as const,
        isActive: !!admin.is_active,
        createdAt: '',
        updatedAt: '',
        setupComplete: false
      }));

      // Combine all user types
      const allUsers = [...teachers, ...headmasters, ...admins];
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedSchools = data.map(mapSchool);
        setSchools(mappedSchools);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schools',
        variant: 'destructive',
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedSubjects = data.map(mapSubject);
        setSubjects(mappedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subjects',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSchools();
    fetchSubjects();
  }, []);

  return {
    users,
    schools,
    subjects,
    isLoading,
    fetchUsers,
    fetchSchools,
    fetchSubjects
  };
}

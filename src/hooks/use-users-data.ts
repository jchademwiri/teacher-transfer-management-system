
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, School, Subject } from '@/types';
import { mapSchool, mapSubject, mapUser } from '@/lib/mappers';

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
    // setIsLoading(true);
    try {
      // Fetch teachers with their user information
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

    if(error) throw error;

    if(data) {
      const mappedUsers = data.map(mapUser);
      setUsers(mappedUsers);
    }
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

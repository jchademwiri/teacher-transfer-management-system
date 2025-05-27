import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, School, Subject } from '@/types';
import { mapSchool, mapSubject, mapUser } from '@/lib/mappers';

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          school:schools (
            id,
            name,
            type,
            district
          )
        `)
        .order('name');

      if(error) throw error;

      if(data) {
        const mappedUsers = data.map((userData: any) => ({
          ...mapUser(userData),
          school: userData.school
        }));
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

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Optimistically update the UI
      setUsers(currentUsers => 
        currentUsers.map(user => 
          user.id === userId ? { ...user, isActive } : user
        )
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchSchools();
    fetchSubjects();
    // We don't want to include these functions in the dependency array
    // as they are stable and won't change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    schools,
    subjects,
    isLoading,
    fetchUsers,
    updateUserStatus,
  };
}


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types';

// Define headmaster data type
export type HeadmasterData = {
  id: string;
  name: string;
  email?: string;
  ec_number: string;
  school_id?: string | null;
  schoolId?: string | null;
  user_id?: string;
  schools?: {
    id?: string;
    name?: string;
    district?: string;
    type?: string;
  };
};

export function useHeadmastersData() {
  const [headmasters, setHeadmasters] = useState<HeadmasterData[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchHeadmasters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('headmasters')
        .select(`
          *,
          schools:school_id (
            id, 
            name, 
            district,
            type
          )
        `)
        .order('name');

      if (error) throw error;
      setHeadmasters(data || []);
    } catch (error) {
      console.error('Error fetching headmasters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load headmasters. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      // Get all schools
      const { data: allSchoolsData, error: allSchoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (allSchoolsError) throw allSchoolsError;
      setAllSchools(allSchoolsData || []);
      
      // Get schools that don't have a headmaster assigned
      const { data: availableSchoolsData, error: availableSchoolsError } = await supabase
        .from('schools')
        .select('*')
        .is('headmaster_id', null)
        .order('name');

      if (availableSchoolsError) throw availableSchoolsError;
      setAvailableSchools(availableSchoolsData || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schools. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, schoolId: string) => {
    try {
      // Remove headmaster_id from school
      await supabase
        .from('schools')
        .update({ headmaster_id: null })
        .eq('id', schoolId);
      
      // Delete headmaster
      const { error } = await supabase
        .from('headmasters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Headmaster deleted successfully',
      });
      
      fetchHeadmasters();
      fetchSchools();
    } catch (error: any) {
      console.error('Error deleting headmaster:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete headmaster.',
        variant: 'destructive',
      });
    }
  };

  return {
    headmasters,
    allSchools,
    availableSchools,
    isLoading,
    fetchHeadmasters,
    fetchSchools,
    handleDelete
  };
}

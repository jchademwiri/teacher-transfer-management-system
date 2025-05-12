
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapDistrict } from '@/lib/mappers';
import { District } from '@/types';

export const useDistricts = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setDistricts(data.map(mapDistrict));
      setError(null);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Failed to load districts');
    } finally {
      setIsLoading(false);
    }
  };

  const addDistrict = async (name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .insert([{ name: name.trim() }])
        .select();
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          return { success: false, error: 'A district with this name already exists.' };
        }
        throw error;
      }
      
      setDistricts([...districts, mapDistrict(data[0])]);
      return { success: true };
    } catch (err) {
      console.error('Error adding district:', err);
      return { success: false, error: 'Failed to add district' };
    }
  };

  const deleteDistrict = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if district has schools before deleting
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('district_id', id);
      
      if (schoolsError) throw schoolsError;
      
      if (schools && schools.length > 0) {
        return { 
          success: false, 
          error: 'This district has schools assigned to it. Remove the schools first.' 
        };
      }
      
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDistricts(districts.filter(district => district.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting district:', err);
      return { success: false, error: 'Failed to delete district' };
    }
  };

  return {
    districts,
    isLoading,
    error,
    fetchDistricts,
    addDistrict,
    deleteDistrict
  };
};

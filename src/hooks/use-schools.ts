
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapSchool } from '@/lib/mappers';
import { School } from '@/types';

interface SchoolsFilter {
  districtId?: string;
  type?: string;
  search?: string;
}

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async (filters?: SchoolsFilter) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('schools')
        .select(`
          *,
          districts(name)
        `);
      
      // Apply filters if provided
      if (filters?.districtId) {
        query = query.eq('district_id', filters.districtId);
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      const mappedSchools = data.map(item => ({
        ...mapSchool(item),
        district: item.districts?.name || item.district
      }));
      
      setSchools(mappedSchools);
      setError(null);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  const addSchool = async (newSchool: { 
    name: string; 
    districtId: string; 
    type: "primary" | "secondary" | "combined";
    address?: string;
  }): Promise<{ success: boolean; error?: string; school?: School }> => {
    try {
      // Get district name for the school record
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('name')
        .eq('id', newSchool.districtId)
        .single();

      if (districtError) throw districtError;

      const { data, error } = await supabase
        .from('schools')
        .insert([{ 
          name: newSchool.name.trim(),
          district_id: newSchool.districtId,
          district: districtData.name,
          type: newSchool.type,
          address: newSchool.address?.trim() || null
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      const addedSchool = mapSchool(data[0]);
      setSchools([...schools, addedSchool]);
      return { success: true, school: addedSchool };
    } catch (err) {
      console.error('Error adding school:', err);
      return { success: false, error: 'Failed to add school' };
    }
  };

  const updateSchool = async (id: string, updates: {
    name?: string;
    districtId?: string;
    type?: "primary" | "secondary" | "combined";
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
      }
      
      if (updates.districtId !== undefined) {
        updateData.district_id = updates.districtId;
        
        // Get district name for the school record
        const { data: districtData, error: districtError } = await supabase
          .from('districts')
          .select('name')
          .eq('id', updates.districtId)
          .single();

        if (districtError) throw districtError;
        updateData.district = districtData.name;
      }
      
      if (updates.type !== undefined) {
        updateData.type = updates.type;
      }
      
      if (updates.address !== undefined) {
        updateData.address = updates.address.trim() || null;
      }
      
      const { data, error } = await supabase
        .from('schools')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      const updatedSchool = mapSchool(data[0]);
      setSchools(schools.map(school => 
        school.id === id ? updatedSchool : school
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating school:', err);
      return { success: false, error: 'Failed to update school' };
    }
  };

  const deleteSchool = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if school has teachers or headmasters before deleting
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id')
        .eq('school_id', id);
      
      if (teachersError) throw teachersError;
      
      if (teachers && teachers.length > 0) {
        return { 
          success: false, 
          error: 'This school has teachers assigned to it. Remove the teachers first.' 
        };
      }

      const { data: headmasters, error: headmastersError } = await supabase
        .from('headmasters')
        .select('id')
        .eq('school_id', id);
      
      if (headmastersError) throw headmastersError;
      
      if (headmasters && headmasters.length > 0) {
        return { 
          success: false, 
          error: 'This school has a headmaster assigned to it. Remove the headmaster first.' 
        };
      }
      
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSchools(schools.filter(school => school.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting school:', err);
      return { success: false, error: 'Failed to delete school' };
    }
  };

  return {
    schools,
    isLoading,
    error,
    fetchSchools,
    addSchool,
    updateSchool,
    deleteSchool
  };
};

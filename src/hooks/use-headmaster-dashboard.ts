
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TransferRequest, School, Teacher } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapTransferRequest, mapSchool, mapTeacher } from '@/lib/mappers';

export function useHeadmasterDashboard() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [forwardedRequests, setForwardedRequests] = useState<TransferRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<TransferRequest[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [recentActivity, setRecentActivity] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchHeadmasterData() {
      if (!user) return;

      setIsLoading(true);
      try {
        // First, get the headmaster's school
        let schoolData;
        const { data: schoolsData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('headmaster_id', user.id)
          .single();

        if (schoolError && schoolError.code !== 'PGRST116') { // Not found
          console.error('Error fetching school:', schoolError);
          setError(schoolError.message);
          return;
        }

        schoolData = schoolsData;
        
        // If no school found, check if user's school ID is set
        if (!schoolData && user.schoolId) {
          const { data: schoolByUserId } = await supabase
            .from('schools')
            .select('*')
            .eq('id', user.schoolId)
            .single();
            
          schoolData = schoolByUserId;
        }

        setSchool(schoolData ? mapSchool(schoolData) : null);
        
        if (schoolData) {
          // Get pending transfer requests for this school
          const { data: pendingData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('from_school_id', schoolData.id)
            .eq('status', 'pending_head_approval');
            
          setPendingRequests(pendingData ? pendingData.map(mapTransferRequest) : []);
          
          // Get forwarded requests
          const { data: forwardedData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('from_school_id', schoolData.id)
            .eq('status', 'forwarded_to_admin');
            
          setForwardedRequests(forwardedData ? forwardedData.map(mapTransferRequest) : []);
          
          // Get rejected requests
          const { data: rejectedData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('from_school_id', schoolData.id)
            .eq('status', 'rejected_by_headmaster');
            
          setRejectedRequests(rejectedData ? rejectedData.map(mapTransferRequest) : []);
          
          // Get teachers at this school
          const { data: teachersData } = await supabase
            .from('teachers')
            .select('*, users(*)')
            .eq('school_id', schoolData.id);
            
          // Map teacher data with user information
          const mappedTeachers = teachersData ? teachersData.map(teacher => {
            const userData = teacher.users || {};
            return mapTeacher({
              ...teacher,
              email: userData.email || '',
              name: userData.name || teacher.name || 'Unknown Teacher'
            });
          }) : [];
          
          setTeachers(mappedTeachers);
          
          // Get recent activity
          const { data: recentData } = await supabase
            .from('transfer_requests')
            .select('*, teachers(*)')
            .eq('from_school_id', schoolData.id)
            .order('updated_at', { ascending: false })
            .limit(5);
            
          setRecentActivity(recentData ? recentData.map(mapTransferRequest) : []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeadmasterData();
  }, [user]);

  // Helper function to get teacher name
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get school name
  const getSchoolName = (schoolId: string) => {
    if (school && school.id === schoolId) return school.name;
    // In a real app, you'd need to fetch the school name if it's not the current school
    return "Unknown School";
  };

  return {
    user,
    pendingRequests,
    forwardedRequests,
    rejectedRequests,
    school,
    teachers,
    recentActivity,
    isLoading,
    error,
    getTeacherName,
    formatDate,
    getSchoolName,
  };
}

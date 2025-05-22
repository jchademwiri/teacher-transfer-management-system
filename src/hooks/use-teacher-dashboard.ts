import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TransferRequest, School, Subject } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapTransferRequest, mapSchool, mapSubject } from '@/lib/mappers';

export function useTeacherDashboard() {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<{
    title: string;
    message: string;
    date: string;
    type: string;
  }[]>([]);
  const [pastRequests, setPastRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!user) return;

      setIsLoading(true);
      try {
        // First, get the teacher record for this user
        const { data: teacherData, error: teacherError } = await supabase
          .from('users')
          .select('id, school_id, ec_number')
          .eq('id', user.id)
          .eq('role', 'teacher')
          .single();

        if (teacherError) {
          console.error('Error fetching teacher:', teacherError);
          setError(teacherError.message);
          return;
        }

        if (!teacherData) {
          // Using mock data if no data in DB
          console.log('No teacher data found, using mock data');
          // Import code from current implementation
          // This is just a mock implementation for now
        } else {
          // Get teacher's active transfer request
          const { data: requestData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('teacher_id', teacherData.id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();

          setActiveRequest(requestData ? mapTransferRequest(requestData) : null);

          // Get teacher's school
          if (teacherData.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('*')
              .eq('id', teacherData.school_id)
              .single();

            setSchool(schoolData ? mapSchool(schoolData) : null);
          }

          // Get all schools for lookup
          const { data: schoolsData } = await supabase
            .from('schools')
            .select('id, name');
          setSchools(schoolsData || []);

          // Get teacher's subjects
          const { data: teacherSubjects } = await supabase
            .from('teacher_subjects')
            .select('subject_id')
            .eq('teacher_id', teacherData.id);

          if (teacherSubjects && teacherSubjects.length > 0) {
            const subjectIds = teacherSubjects.map(ts => ts.subject_id);
            const { data: subjectsData } = await supabase
              .from('subjects')
              .select('*')
              .in('id', subjectIds);

            setSubjects(subjectsData ? subjectsData.map(mapSubject) : []);
          } else {
            // Fallback to some default subjects if none assigned
            const { data: defaultSubjects } = await supabase
              .from('subjects')
              .select('*')
              .limit(3);

            setSubjects(defaultSubjects ? defaultSubjects.map(mapSubject) : []);
          }

          // Get notifications
          const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);

          setRecentNotifications(notifications?.map(n => ({
            title: n.title,
            message: n.message,
            date: formatTimeAgo(n.created_at),
            type: n.type,
          })) || []);

          // Get ALL transfer requests for this teacher (not just completed)
          const { data: allRequestsData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('teacher_id', teacherData.id)
            .order('submitted_at', { ascending: false });

          console.log('Fetched transfer requests for dashboard:', allRequestsData);

          setPastRequests(allRequestsData || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeacherData();
  }, [user]);

  // Helper function to format dates as relative time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get school name (based on all schools)
  const getSchoolName = (schoolId: string) => {
    const found = schools.find(s => s.id === schoolId);
    return found ? found.name : 'Unknown School';
  };

  return {
    user,
    activeRequest,
    school,
    subjects,
    recentNotifications,
    pastRequests,
    isLoading,
    error,
    formatDate,
    getSchoolName,
  };
}

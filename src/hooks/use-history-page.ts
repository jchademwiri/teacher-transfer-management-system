import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RequestStatus, TransferRequest } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Default options for status filter
export const defaultStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved_by_admin', label: 'Approved' },
  { value: 'rejected_by_headmaster', label: 'Rejected by Headmaster' },
  { value: 'rejected_by_admin', label: 'Rejected by Admin' },
  { value: 'withdrawn_by_teacher', label: 'Withdrawn' },
];

// For headmaster history
export const headmasterStatusOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'approved', label: 'Approved & Forwarded' },
  { value: 'rejected', label: 'Rejected' },
];

export function useHistoryPage(role: 'teacher' | 'headmaster', itemsPerPage = 5) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  
  // Special state for headmaster view
  const [schoolId, setSchoolId] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setIsLoading(true);
      
      try {
        if (role === 'teacher') {
          // First, get the teacher record for this user
          const { data: teacherData, error: teacherError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .eq('role', 'teacher')
            .single();
          
          console.log('Current user id:', user.id, 'teacherData.id:', teacherData?.id);
          
          if (teacherError || !teacherData) {
            console.error('Error or no teacher data:', teacherError);
            return;
          }
          
          // Fetch transfer requests for this teacher
          const { data: requestsData, error: requestsError } = await supabase
            .from('transfer_requests')
            .select('*, schools!to_school_id(*)')
            .eq('teacher_id', teacherData.id);
          
          console.log('Fetched transfer requests for history:', requestsData);
          
          if (requestsError) {
            console.error('Error fetching requests:', requestsError);
            setError(requestsError.message);
            return;
          }
          
          setRequests(requestsData || []);
        } 
        else if (role === 'headmaster') {
          // Get headmaster's school
          let headSchoolData;
          
          // First try to find by headmaster_id
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('headmaster_id', user.id)
            .single();
          
          if (!schoolError) {
            headSchoolData = schoolData;
          } else if (user.schoolId) {
            // Try by user's schoolId
            const { data: schoolById } = await supabase
              .from('schools')
              .select('*')
              .eq('id', user.schoolId)
              .single();
              
            headSchoolData = schoolById;
          }
          
          if (headSchoolData) {
            setSchoolId(headSchoolData.id);
            
            // Get all requests for this school that have headmaster decisions
            const { data: historyData, error: historyError } = await supabase
              .from('transfer_requests')
              .select('*, teachers(*), schools!to_school_id(*)')
              .eq('from_school_id', headSchoolData.id)
              .or('status.eq.forwarded_to_admin,status.eq.rejected_by_headmaster');
            
            if (historyError) {
              console.error('Error fetching history:', historyError);
              setError(historyError.message);
              return;
            }
            
            setRequests(historyData || []);
          }
        }
      } catch (err) {
        console.error('Error fetching history data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user, role]);
  
  // Apply filters and sorting when requests, filters, or sort order change
  useEffect(() => {
    let filtered = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (role === 'headmaster') {
        // Special handling for headmaster view
        filtered = filtered.filter(request => {
          if (statusFilter === 'approved') {
            return request.status === 'forwarded_to_admin';
          } else if (statusFilter === 'rejected') {
            return request.status === 'rejected_by_headmaster';
          }
          return true;
        });
      } else {
        // Regular filtering for teacher view
        filtered = filtered.filter(req => req.status === statusFilter);
      }
    }
    
    // Apply unresolved filter (if applicable)
    if (role === 'headmaster' && showUnresolvedOnly) {
      filtered = filtered.filter(request => 
        request.status === 'forwarded_to_admin' && !request.adminStatus
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.actionDate || a.updated_at || a.submitted_at).getTime();
      const dateB = new Date(b.actionDate || b.updated_at || b.submitted_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredRequests(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [requests, statusFilter, sortOrder, showUnresolvedOnly, role, itemsPerPage]);
  
  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper function to get destination display name
  const getDestination = (request: any) => {
    return request.to_school_id && request.schools 
      ? request.schools.name
      : request.to_district || 'Unspecified';
  };
  
  // Get paginated data
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  return {
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedRequests,
    isLoading,
    error,
    showUnresolvedOnly,
    setShowUnresolvedOnly,
    formatDate,
    getDestination,
    schoolId,
  };
}

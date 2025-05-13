
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Subject, School, TransferRequest } from '@/types';
import { mapSchool, mapTeacher, mapSubject } from '@/lib/mappers';
import { MOCK_TEACHERS, MOCK_SCHOOLS, MOCK_SUBJECTS, MOCK_TRANSFER_REQUESTS } from '@/mock/data';

type TransferStatus = 'None' | 'Pending' | 'Rejected' | 'Forwarded' | 'Approved';

export interface TeacherWithTransferStatus extends Teacher {
  transferStatus: TransferStatus;
  subjectNames: string[];
}

export function useHeadmasterTeachers() {
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<TeacherWithTransferStatus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<{ [key: string]: Subject[] }>({});
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchHeadmasterData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error('User information not available');
        }

        // Check if we're using mock data or Supabase
        const isMockUser = user.id && user.id.length < 10; // Mock IDs like "2" vs UUIDs
        
        if (isMockUser) {
          console.log("Using mock data for headmaster teachers");
          
          // Find headmaster's school from mock data
          const mockSchool = MOCK_SCHOOLS.find(s => s.headmasterId === user.id);
          
          if (!mockSchool) {
            throw new Error('School information not available');
          }
          
          setSchool(mockSchool);
          
          // Get mock teachers for this school
          const mockTeachers = MOCK_TEACHERS.filter(t => t.schoolId === mockSchool.id);
          
          // Set all available subjects
          setSubjects(MOCK_SUBJECTS);
          
          // Create a subject mapping for each teacher
          const subjectMapping: { [key: string]: Subject[] } = {};
          mockTeachers.forEach(teacher => {
            subjectMapping[teacher.id] = teacher.subjectIds.map(
              sid => MOCK_SUBJECTS.find(s => s.id === sid)
            ).filter(Boolean) as Subject[];
          });
          
          setTeacherSubjects(subjectMapping);
          
          // Get transfer requests
          const mockTransferRequests = MOCK_TRANSFER_REQUESTS.filter(
            req => mockTeachers.some(t => t.id === req.teacherId)
          );
          setTransferRequests(mockTransferRequests);
          
          // Create teachersWithStatus array
          const teachersWithStatus: TeacherWithTransferStatus[] = mockTeachers.map(teacher => {
            const teacherTransferRequests = mockTransferRequests.filter(tr => tr.teacherId === teacher.id);
            const latestRequest = teacherTransferRequests.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];
            
            let transferStatus: TransferStatus = 'None';
            if (latestRequest) {
              switch (latestRequest.status) {
                case 'pending_head_approval':
                  transferStatus = 'Pending';
                  break;
                case 'rejected_by_headmaster':
                  transferStatus = 'Rejected';
                  break;
                case 'forwarded_to_admin':
                  transferStatus = 'Forwarded';
                  break;
                case 'approved_by_admin':
                  transferStatus = 'Approved';
                  break;
                default:
                  transferStatus = 'None';
              }
            }
            
            const subjectsForTeacher = subjectMapping[teacher.id] || [];
            const subjectNames = subjectsForTeacher.map(s => s.name);
            
            return {
              ...teacher,
              transferStatus,
              subjectNames,
              // Add email from teacher data if available
              email: teacher.email || '',
            };
          });
          
          setTeachers(teachersWithStatus);
          
        } else {
          // Using real Supabase data
          // Fetch school information
          if (!user.schoolId) {
            throw new Error('School ID not available for headmaster');
          }
          
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', user.schoolId)
            .single();

          if (schoolError) {
            throw new Error(`Error fetching school: ${schoolError.message}`);
          }

          if (schoolData) {
            setSchool(mapSchool(schoolData));
          }

          // Fetch all teachers in the school
          const { data: teachersData, error: teachersError } = await supabase
            .from('teachers')
            .select('*')
            .eq('school_id', user.schoolId);

          if (teachersError) {
            throw new Error(`Error fetching teachers: ${teachersError.message}`);
          }

          // Fetch all subjects
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('*');

          if (subjectsError) {
            throw new Error(`Error fetching subjects: ${subjectsError.message}`);
          }

          setSubjects(subjectsData.map(mapSubject));

          // Fetch teacher-subject relationships
          const { data: teacherSubjectsData, error: teacherSubjectsError } = await supabase
            .from('teacher_subjects')
            .select('*')
            .in(
              'teacher_id', 
              teachersData?.map(t => t.id) || []
            );

          if (teacherSubjectsError) {
            throw new Error(`Error fetching teacher subjects: ${teacherSubjectsError.message}`);
          }

          // Build teacher-subjects mapping
          const subjectMapping: { [key: string]: Subject[] } = {};
          teacherSubjectsData?.forEach(ts => {
            if (!subjectMapping[ts.teacher_id]) {
              subjectMapping[ts.teacher_id] = [];
            }
            const subject = subjectsData.find(s => s.id === ts.subject_id);
            if (subject) {
              subjectMapping[ts.teacher_id].push(mapSubject(subject));
            }
          });
          
          setTeacherSubjects(subjectMapping);

          // Fetch transfer requests
          const { data: transferData, error: transferError } = await supabase
            .from('transfer_requests')
            .select('*')
            .in(
              'teacher_id',
              teachersData?.map(t => t.id) || []
            );

          if (transferError) {
            throw new Error(`Error fetching transfer requests: ${transferError.message}`);
          }

          // Create teachers with transfer status info
          const teachersWithStatus: TeacherWithTransferStatus[] = teachersData.map(teacher => {
            const mappedTeacher = mapTeacher(teacher);
            const teacherTransferRequests = transferData?.filter(tr => tr.teacher_id === teacher.id) || [];
            const latestRequest = teacherTransferRequests.sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0];
            
            let transferStatus: TransferStatus = 'None';
            if (latestRequest) {
              switch (latestRequest.status) {
                case 'pending_head_approval':
                  transferStatus = 'Pending';
                  break;
                case 'rejected_by_headmaster':
                  transferStatus = 'Rejected';
                  break;
                case 'forwarded_to_admin':
                  transferStatus = 'Forwarded';
                  break;
                case 'approved_by_admin':
                  transferStatus = 'Approved';
                  break;
                default:
                  transferStatus = 'None';
              }
            }

            const subjectsForTeacher = subjectMapping[teacher.id] || [];
            const subjectNames = subjectsForTeacher.map(s => s.name);

            return {
              ...mappedTeacher,
              transferStatus,
              subjectNames,
              subjectIds: subjectsForTeacher.map(s => s.id),
              // Add email from teacher data if available
              email: mappedTeacher.email || '',
            };
          });

          setTeachers(teachersWithStatus);
        }
      } catch (err) {
        console.error('Error in fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeadmasterData();
  }, [user]);

  // Filter teachers based on selected filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // Filter by subject
      if (selectedSubject !== 'all' && !teacher.subjectIds.includes(selectedSubject)) {
        return false;
      }

      // Filter by level
      if (selectedLevel !== 'all' && teacher.level !== selectedLevel) {
        return false;
      }

      // Filter by transfer status
      if (selectedStatus !== 'all' && teacher.transferStatus !== selectedStatus) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(query) ||
          teacher.ecNumber.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [teachers, selectedSubject, selectedLevel, selectedStatus, searchQuery]);

  return {
    school,
    teachers,
    subjects,
    teacherSubjects,
    transferRequests,
    isLoading,
    error,
    filteredTeachers,
    selectedSubject,
    setSelectedSubject,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery
  };
}

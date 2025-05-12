
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from '@/integrations/supabase/client';
import { TransferRequest, School } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { mapTransferRequest } from '@/lib/mappers';
import { TransferFormValues, transferFormSchema } from '@/components/transfer/TransferForm';

export function useTransferForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      preferredDistrict: "",
      preferredSchool: "",
      reason: "",
    },
  });
  
  const watchedDistrict = form.watch("preferredDistrict");
  
  // Filter schools when district changes
  useEffect(() => {
    if (watchedDistrict) {
      const filtered = schools.filter(school => school.district === watchedDistrict);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [watchedDistrict, schools]);
  
  // Load user data, active request, districts, and schools
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get teacher ID and school
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('id, school_id')
          .eq('user_id', user.id)
          .single();
          
        if (teacherData) {
          setTeacherId(teacherData.id);
          setSchoolId(teacherData.school_id);
          
          // Get active transfer request if exists
          const { data: requestData } = await supabase
            .from('transfer_requests')
            .select('*')
            .eq('teacher_id', teacherData.id)
            .in('status', ['pending_head_approval', 'forwarded_to_admin', 'submitted'])
            .order('submitted_at', { ascending: false })
            .limit(1);
            
          if (requestData && requestData.length > 0) {
            setActiveRequest(mapTransferRequest(requestData[0]));
          }
        }
        
        // Get all districts
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('*');
          
        if (schoolsData) {
          // We cast the type here to match our interface
          const allSchools: School[] = schoolsData.map(s => ({
            id: s.id,
            name: s.name,
            district: s.district,
            type: s.type as string,
            address: s.address || '',
            headmasterId: s.headmaster_id,
          }));
          
          setSchools(allSchools);
          
          // Extract unique districts
          const uniqueDistricts = Array.from(new Set(schoolsData.map(s => s.district)));
          setDistricts(uniqueDistricts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [user, toast]);
  
  const handleSubmitTransfer = async (values: TransferFormValues) => {
    if (!teacherId || !schoolId) {
      toast({
        title: "Error",
        description: "Your teacher profile is not set up correctly.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the request payload
      const requestData = {
        teacher_id: teacherId,
        from_school_id: schoolId,
        to_school_id: values.preferredSchool || null,
        to_district: values.preferredDistrict,
        reason: values.reason,
        status: 'pending_head_approval',
      };
      
      // Submit the request
      const { data, error } = await supabase
        .from('transfer_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setActiveRequest(mapTransferRequest(data));
        
        toast({
          title: "Transfer request submitted",
          description: "Your transfer request has been submitted and is pending review by your headmaster.",
        });
        
        // Reset the form
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting transfer request:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your transfer request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWithdrawRequest = async () => {
    if (!activeRequest) return;
    
    setIsSubmitting(true);
    
    try {
      // Update the request status to withdrawn
      const { error } = await supabase
        .from('transfer_requests')
        .update({ status: 'withdrawn_by_teacher', updated_at: new Date().toISOString() })
        .eq('id', activeRequest.id);
      
      if (error) throw error;
      
      toast({
        title: "Request withdrawn",
        description: "Your transfer request has been withdrawn successfully.",
      });
      
      // Clear the active request
      setActiveRequest(null);
    } catch (error) {
      console.error('Error withdrawing request:', error);
      toast({
        title: "Error",
        description: "Failed to withdraw your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper function to get school name from ID
  const getSchoolName = (id: string) => {
    const school = schools.find(s => s.id === id);
    return school ? school.name : 'Unknown School';
  };

  return {
    form,
    activeRequest,
    isLoading,
    isSubmitting,
    districts,
    filteredSchools,
    watchedDistrict,
    handleSubmitTransfer,
    handleWithdrawRequest,
    formatDate,
    getSchoolName,
  };
}

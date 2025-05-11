
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TransferRequest, School } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { mapTransferRequest } from '@/lib/mappers';

// Form validation schema
const transferFormSchema = z.object({
  preferredDistrict: z.string().min(1, "Please select a preferred district"),
  preferredSchool: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters long"),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const TransferPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
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
          const allSchools = schoolsData.map(s => ({
            id: s.id,
            name: s.name,
            district: s.district,
            type: s.type,
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
    setWithdrawDialogOpen(false);
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Transfer Request</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Transfer Request</h1>
          <p className="text-muted-foreground">Submit or view your active transfer request</p>
        </div>
        
        {activeRequest ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Active Transfer Request</CardTitle>
                  <CardDescription>
                    Submitted on {formatDate(activeRequest.submittedAt)}
                  </CardDescription>
                </div>
                <StatusBadge status={activeRequest.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">From School</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeRequest.fromSchoolId ? getSchoolName(activeRequest.fromSchoolId) : 'Unknown School'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Preferred Location</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>District:</strong> {activeRequest.toDistrict || 'Unspecified'}
                  </p>
                  {activeRequest.toSchoolId && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>School:</strong> {getSchoolName(activeRequest.toSchoolId)}
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-1">Reason for Transfer</h3>
                <p className="text-sm text-muted-foreground">{activeRequest.reason}</p>
              </div>
              
              {activeRequest.headmasterComment && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Headmaster Comment</h3>
                    <p className="text-sm text-muted-foreground">{activeRequest.headmasterComment}</p>
                  </div>
                </>
              )}
              
              {activeRequest.adminComment && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Admin Comment</h3>
                    <p className="text-sm text-muted-foreground">{activeRequest.adminComment}</p>
                  </div>
                </>
              )}
            </CardContent>
            {(activeRequest.status === 'submitted' || activeRequest.status === 'pending_head_approval') && (
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Withdraw Request"}
                </Button>
                
                <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Withdraw Transfer Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to withdraw your transfer request? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleWithdrawRequest}>
                        Withdraw Request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Transfer Request</CardTitle>
              <CardDescription>
                Fill in the details to request a transfer to another district or school
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitTransfer)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferredDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred District</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map(district => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchedDistrict && filteredSchools.length > 0 && (
                    <FormField
                      control={form.control}
                      name="preferredSchool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred School (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a school (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredSchools.map(school => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {watchedDistrict && filteredSchools.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No schools found in this district. You can still request a transfer to the district.
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Transfer</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please explain why you are requesting a transfer (minimum 10 characters)"
                            rows={5}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                    {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransferPage;

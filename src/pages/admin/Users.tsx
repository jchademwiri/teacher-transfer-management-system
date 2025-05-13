import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form schema for teacher validation
const teacherSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  ec_number: z.string().min(5, "EC Number must be at least 5 characters"),
  school_id: z.string().min(1, "Please select a school"),
  level: z.string().min(1, "Please select a level"),
  primary_subject_id: z.string().min(1, "Please select a primary subject"),
  other_subject_ids: z.array(z.string()).optional(),
});

// Form schema for headmaster validation
const headmasterSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  ec_number: z.string().min(5, "EC Number must be at least 5 characters"),
  school_id: z.string().min(1, "Please select a school"),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;
type HeadmasterFormValues = z.infer<typeof headmasterSchema>;

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [headmasters, setHeadmasters] = useState<any[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isHeadmasterDialogOpen, setIsHeadmasterDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [currentHeadmaster, setCurrentHeadmaster] = useState<any>(null);
  
  const { toast } = useToast();
  
  const teacherForm = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: '',
      email: '',
      ec_number: '',
      school_id: '',
      level: '',
      primary_subject_id: '',
      other_subject_ids: [],
    },
  });
  
  const headmasterForm = useForm<HeadmasterFormValues>({
    resolver: zodResolver(headmasterSchema),
    defaultValues: {
      name: '',
      email: '',
      ec_number: '',
      school_id: '',
    },
  });

  // Load data
  useEffect(() => {
    fetchData();
  }, []);

  // Reset forms when dialog state changes
  useEffect(() => {
    if (isTeacherDialogOpen && currentTeacher) {
      teacherForm.reset({
        name: currentTeacher.name,
        email: currentTeacher.email,
        ec_number: currentTeacher.ec_number,
        school_id: currentTeacher.school_id,
        level: currentTeacher.level,
        primary_subject_id: currentTeacher.primary_subject_id,
        other_subject_ids: currentTeacher.other_subject_ids || [],
      });
    } else if (!isTeacherDialogOpen) {
      setCurrentTeacher(null);
      teacherForm.reset();
    }
    
    if (isHeadmasterDialogOpen && currentHeadmaster) {
      headmasterForm.reset({
        name: currentHeadmaster.name,
        email: currentHeadmaster.email,
        ec_number: currentHeadmaster.ec_number,
        school_id: currentHeadmaster.school_id,
      });
    } else if (!isHeadmasterDialogOpen) {
      setCurrentHeadmaster(null);
      headmasterForm.reset();
    }
  }, [isTeacherDialogOpen, isHeadmasterDialogOpen, currentTeacher, currentHeadmaster]);

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (schoolsError) throw schoolsError;
      
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (subjectsError) throw subjectsError;
      
      // Fetch teachers with proper error handling
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          *,
          schools:school_id (*),
          users:user_id (*)
        `);
      
      if (teachersError) throw teachersError;

      // Fetch teacher subjects separately
      const { data: teacherSubjectsData, error: teacherSubjectsError } = await supabase
        .from('teacher_subjects')
        .select(`
          teacher_id,
          subject_id,
          subjects:subject_id (name)
        `);
        
      if (teacherSubjectsError) throw teacherSubjectsError;

      // Fetch headmasters with proper error handling
      const { data: headmastersData, error: headmastersError } = await supabase
        .from('headmasters')
        .select(`
          *,
          schools:school_id (*),
          users:user_id (*)
        `);
      
      if (headmastersError) throw headmastersError;
      
      // Map data
      const mappedSchools = schoolsData.map(mapSchool);
      const mappedSubjects = subjectsData.map(mapSubject);
      
      // Process teachers data with null checks
      const processedTeachers = teachersData?.map(teacher => {
        const teacherSubjects = teacherSubjectsData?.filter(ts => ts.teacher_id === teacher.id) || [];
        const primarySubject = teacherSubjects[0]?.subjects || null;
        const otherSubjects = teacherSubjects.slice(1).map(ts => ts.subjects).filter(Boolean);
        
        return {
          ...teacher,
          email: teacher.users?.email || '',
          school_name: teacher.schools?.name || 'Unknown School',
          district: teacher.schools?.district || 'Unknown District',
          primary_subject: primarySubject?.name || 'None',
          other_subjects: otherSubjects.map(s => s?.name || 'Unknown').join(', '),
        };
      }) || [];
      
      // Process headmasters data with null checks
      const processedHeadmasters = headmastersData?.map(headmaster => {
        return {
          ...headmaster,
          email: headmaster.users?.email || '',
          school_name: headmaster.schools?.name || 'Unknown School',
          district: headmaster.schools?.district || 'Unknown District',
        };
      }) || [];
      
      // Find available schools for headmasters (schools without a headmaster)
      const schoolsWithHeadmaster = headmastersData.map(h => h.school_id);
      const availableForHeadmaster = mappedSchools.filter(
        school => !schoolsWithHeadmaster.includes(school.id)
      );
      
      setSchools(mappedSchools);
      setSubjects(mappedSubjects);
      setTeachers(processedTeachers);
      setHeadmasters(processedHeadmasters);
      setAvailableSchools(availableForHeadmaster);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handler for teacher form
  const handleTeacherSubmit = async (values: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      // First, check if a user with this email exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();
      
      let userId: string;
      
      if (!existingUser) {
        // Create user - fix the missing id field by using gen_random_uuid()
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: crypto.randomUUID(), // Generate a UUID for the id field
            email: values.email,
            name: values.name,
            is_active: true,
            setup_complete: true,
            token_identifier: values.email,
          })
          .select('id')
          .single();
          
        if (createError) throw createError;
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }
      
      let teacherId: string;
      
      if (currentTeacher) {
        // Update existing teacher
        const { error: updateError } = await supabase
          .from('teachers')
          .update({
            name: values.name,
            ec_number: values.ec_number,
            level: values.level,
            school_id: values.school_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentTeacher.id);
        
        if (updateError) throw updateError;
        
        // Delete existing subject relationships
        const { error: deleteError } = await supabase
          .from('teacher_subjects')
          .delete()
          .eq('teacher_id', currentTeacher.id);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new teacher - fix assignment to constant issue
        const { data: newTeacher, error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: userId,
            name: values.name,
            ec_number: values.ec_number,
            level: values.level,
            school_id: values.school_id,
          })
          .select('id')
          .single();
          
        if (teacherError) throw teacherError;
        teacherId = newTeacher.id;
      }
      
      // Add primary subject
      const { error: primarySubjectError } = await supabase
        .from('teacher_subjects')
        .insert({
          teacher_id: teacherId,
          subject_id: values.primary_subject_id,
        });
        
      if (primarySubjectError) throw primarySubjectError;
      
      // Add other subjects
      if (values.other_subject_ids && values.other_subject_ids.length > 0) {
        const otherSubjectRecords = values.other_subject_ids.map(subjectId => ({
          teacher_id: teacherId,
          subject_id: subjectId,
        }));
        
        const { error: otherSubjectsError } = await supabase
          .from('teacher_subjects')
          .insert(otherSubjectRecords);
          
        if (otherSubjectsError) throw otherSubjectsError;
      }
      
      toast({
        title: 'Success',
        description: currentTeacher ? 'Teacher updated successfully' : 'Teacher added successfully',
      });
      
      setIsTeacherDialogOpen(false);
      teacherForm.reset();
      fetchData();
      
    } catch (error: any) {
      console.error('Error submitting teacher form:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save teacher information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit handler for headmaster form
  const handleHeadmasterSubmit = async (values: HeadmasterFormValues) => {
    setIsSubmitting(true);
    try {
      // First, check if a user with this email exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', values.email)
        .single();
      
      let userId: string;
      
      if (!existingUser) {
        // Create user - fix the missing id field
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: crypto.randomUUID(), // Generate a UUID for the id field
            email: values.email,
            name: values.name,
            is_active: true,
            setup_complete: true,
            token_identifier: values.email,
          })
          .select('id')
          .single();
          
        if (createError) throw createError;
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }
      
      // Check if the school already has a headmaster
      if (!currentHeadmaster) {
        const { data: existingHeadmaster, error: checkError } = await supabase
          .from('headmasters')
          .select('id')
          .eq('school_id', values.school_id);
          
        if (existingHeadmaster && existingHeadmaster.length > 0) {
          throw new Error('This school already has a headmaster assigned');
        }
      }
      
      if (currentHeadmaster) {
        // Update existing headmaster
        const { error: updateError } = await supabase
          .from('headmasters')
          .update({
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentHeadmaster.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new headmaster
        const { error: headmasterError } = await supabase
          .from('headmasters')
          .insert({
            user_id: userId,
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
          });
          
        if (headmasterError) throw headmasterError;
      }
      
      // Update school with headmaster_id reference
      const { error: schoolUpdateError } = await supabase
        .from('schools')
        .update({
          headmaster_id: currentHeadmaster ? currentHeadmaster.id : null,
        })
        .eq('id', values.school_id);
        
      if (schoolUpdateError) throw schoolUpdateError;
      
      toast({
        title: 'Success',
        description: currentHeadmaster ? 'Headmaster updated successfully' : 'Headmaster added successfully',
      });
      
      setIsHeadmasterDialogOpen(false);
      headmasterForm.reset();
      fetchData();
      
    } catch (error: any) {
      console.error('Error submitting headmaster form:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save headmaster information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter data based on search query
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email.toLowerCase().includes(search.toLowerCase()) ||
    teacher.ec_number.toLowerCase().includes(search.toLowerCase()) ||
    teacher.school_name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredHeadmasters = headmasters.filter(headmaster =>
    headmaster.name.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.email.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.ec_number.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.school_name.toLowerCase().includes(search.toLowerCase())
  );

  // Open dialogs for add/edit
  const openAddTeacherDialog = () => {
    setCurrentTeacher(null);
    setIsTeacherDialogOpen(true);
  };
  
  const openEditTeacherDialog = (teacher: any) => {
    setCurrentTeacher(teacher);
    setIsTeacherDialogOpen(true);
  };
  
  const openAddHeadmasterDialog = () => {
    setCurrentHeadmaster(null);
    setIsHeadmasterDialogOpen(true);
  };
  
  const openEditHeadmasterDialog = (headmaster: any) => {
    setCurrentHeadmaster(headmaster);
    setIsHeadmasterDialogOpen(true);
  };

  // Toggle user active status
  const toggleUserActive = async (userId: string, isActive: boolean, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !isActive })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${role} ${isActive ? 'deactivated' : 'activated'} successfully`,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, EC number, or school..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="teachers" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="headmasters">Headmasters</TabsTrigger>
            </TabsList>
            
            <div>
              {activeTab === 'teachers' ? (
                <Button onClick={openAddTeacherDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Teacher
                </Button>
              ) : (
                <Button onClick={openAddHeadmasterDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Headmaster
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="teachers">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">EC Number</th>
                      <th className="text-left py-3 px-4">School</th>
                      <th className="text-left py-3 px-4">Primary Subject</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{teacher.name}</td>
                          <td className="py-3 px-4">{teacher.email}</td>
                          <td className="py-3 px-4">{teacher.ec_number}</td>
                          <td className="py-3 px-4">{teacher.school_name}</td>
                          <td className="py-3 px-4">{teacher.primary_subject}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={teacher.is_active ? "success" : "destructive"}
                              className="cursor-pointer"
                              onClick={() => toggleUserActive(teacher.user_id, teacher.is_active, 'teacher')}
                            >
                              {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditTeacherDialog(teacher)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6">
                          No teachers found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="headmasters">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">EC Number</th>
                      <th className="text-left py-3 px-4">School</th>
                      <th className="text-left py-3 px-4">District</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHeadmasters.length > 0 ? (
                      filteredHeadmasters.map((headmaster) => (
                        <tr key={headmaster.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{headmaster.name}</td>
                          <td className="py-3 px-4">{headmaster.email}</td>
                          <td className="py-3 px-4">{headmaster.ec_number}</td>
                          <td className="py-3 px-4">{headmaster.school_name}</td>
                          <td className="py-3 px-4">{headmaster.district}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={headmaster.is_active ? "success" : "destructive"}
                              className="cursor-pointer"
                              onClick={() => toggleUserActive(headmaster.user_id, headmaster.is_active, 'headmaster')}
                            >
                              {headmaster.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditHeadmasterDialog(headmaster)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6">
                          No headmasters found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
            <DialogDescription>
              {currentTeacher 
                ? 'Update the teacher information below.' 
                : 'Enter the details for the new teacher.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...teacherForm}>
            <form onSubmit={teacherForm.handleSubmit(handleTeacherSubmit)} className="space-y-4">
              <FormField
                control={teacherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Email address" 
                        type="email" 
                        disabled={currentTeacher !== null}
                      />
                    </FormControl>
                    {currentTeacher && (
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed for existing teachers
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="ec_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EC Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="EC Number" 
                        disabled={currentTeacher !== null}
                      />
                    </FormControl>
                    {currentTeacher && (
                      <p className="text-xs text-muted-foreground">
                        EC Number cannot be changed for existing teachers
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="school_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned School</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} - {school.district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Secondary">Secondary</SelectItem>
                        <SelectItem value="Combined">Combined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="primary_subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Subject</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsTeacherDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentTeacher ? 'Update Teacher' : 'Add Teacher'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Headmaster Dialog */}
      <Dialog open={isHeadmasterDialogOpen} onOpenChange={setIsHeadmasterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentHeadmaster ? 'Edit Headmaster' : 'Add New Headmaster'}</DialogTitle>
            <DialogDescription>
              {currentHeadmaster 
                ? 'Update the headmaster information below.' 
                : 'Enter the details for the new headmaster.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...headmasterForm}>
            <form onSubmit={headmasterForm.handleSubmit(handleHeadmasterSubmit)} className="space-y-4">
              <FormField
                control={headmasterForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={headmasterForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Email address" 
                        type="email" 
                        disabled={currentHeadmaster !== null}
                      />
                    </FormControl>
                    {currentHeadmaster && (
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed for existing headmasters
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={headmasterForm.control}
                name="ec_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EC Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="EC Number" 
                        disabled={currentHeadmaster !== null}
                      />
                    </FormControl>
                    {currentHeadmaster && (
                      <p className="text-xs text-muted-foreground">
                        EC Number cannot be changed for existing headmasters
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={headmasterForm.control}
                name="school_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned School</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(currentHeadmaster 
                          ? schools 
                          : availableSchools
                        ).map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} - {school.district}
                          </SelectItem>
                        ))}
                        {!currentHeadmaster && availableSchools.length === 0 && (
                          <SelectItem value="none" disabled>
                            No available schools (all have headmasters)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsHeadmasterDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentHeadmaster ? 'Update Headmaster' : 'Add Headmaster'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;


import React, { useState, useEffect } from 'react';
import MainNavigation from "@/components/MainNavigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { School, Subject, UserRole } from '@/types';
import { mapSchool, mapSubject } from '@/lib/mappers';
import { Edit, PlusCircle, Loader2, Search } from 'lucide-react';

// Form schema for user registration
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6).optional(),
  role: z.enum(['teacher', 'headmaster', 'admin']),
  schoolId: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  ecNumber: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

// Define types for teacher and headmaster data
type TeacherData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  schoolName: string;
  district: string;
  ecNumber: string;
  role: 'teacher';
  isActive: boolean;
};

type HeadmasterData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  schoolName: string;
  district: string;
  ecNumber: string;
  role: 'headmaster';
  isActive: boolean;
};

const UsersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [headmasters, setHeadmasters] = useState<HeadmasterData[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userType, setUserType] = useState<'teacher' | 'headmaster'>('teacher');
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Initialize form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'teacher',
      schoolId: '',
      subjects: [],
      ecNumber: '',
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchSchoolsAndSubjects();
  }, []);

  useEffect(() => {
    // Reset form when dialog is opened for adding a new user
    if (!isEditing && isDialogOpen) {
      form.reset({
        email: '',
        name: '',
        password: '',
        role: userType,
        schoolId: '',
        subjects: [],
        ecNumber: '',
      });
    }
    // Set form values when editing an existing user
    else if (isEditing && currentUser) {
      form.reset({
        email: currentUser.email || '',
        name: currentUser.name || '',
        password: '',
        role: currentUser.role || userType,
        schoolId: currentUser.schoolId || '',
        subjects: currentUser.subjects || [],
        ecNumber: currentUser.ecNumber || '',
      });
    }
  }, [isDialogOpen, isEditing, currentUser, form, userType]);

  const fetchSchoolsAndSubjects = async () => {
    try {
      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (schoolsError) throw schoolsError;

      if (schoolsData) {
        const mappedSchools = schoolsData.map(mapSchool);
        setSchools(mappedSchools);
      }

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      if (subjectsData) {
        const mappedSubjects = subjectsData.map(mapSubject);
        setSubjects(mappedSubjects);
      }
    } catch (error) {
      console.error('Error fetching schools and subjects:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch teachers with more robust error handling and type safety
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          ec_number,
          school_id,
          user_id,
          users:user_id (id, email, is_active, name),
          schools:school_id (id, name, district)
        `);

      if (teachersError) throw teachersError;

      const mappedTeachers: TeacherData[] = [];
      
      if (teachersData) {
        teachersData.forEach(teacher => {
          // Only add teachers where we can safely access all needed properties
          if (teacher && teacher.users && teacher.schools) {
            mappedTeachers.push({
              id: teacher.id,
              userId: teacher.user_id,
              name: teacher.name || teacher.users.name || 'Unknown',
              email: teacher.users.email || 'No email',
              schoolName: teacher.schools.name || 'No school',
              district: teacher.schools.district || 'No district',
              ecNumber: teacher.ec_number || 'No EC Number',
              role: 'teacher',
              isActive: teacher.users.is_active || false,
            });
          }
        });
      }

      setTeachers(mappedTeachers);

      // Fetch headmasters with similar robust handling
      const { data: headmastersData, error: headmastersError } = await supabase
        .from('headmasters')
        .select(`
          id,
          name,
          ec_number,
          school_id,
          user_id,
          users:user_id (id, email, is_active, name),
          schools:school_id (id, name, district)
        `);

      if (headmastersError) throw headmastersError;

      const mappedHeadmasters: HeadmasterData[] = [];
      
      if (headmastersData) {
        headmastersData.forEach(headmaster => {
          // Only add headmasters where we can safely access all needed properties
          if (headmaster && headmaster.users && headmaster.schools) {
            mappedHeadmasters.push({
              id: headmaster.id,
              userId: headmaster.user_id,
              name: headmaster.name || headmaster.users.name || 'Unknown',
              email: headmaster.users.email || 'No email',
              schoolName: headmaster.schools.name || 'No school',
              district: headmaster.schools.district || 'No district',
              ecNumber: headmaster.ec_number || 'No EC Number',
              role: 'headmaster',
              isActive: headmaster.users.is_active || false,
            });
          }
        });
      }

      setHeadmasters(mappedHeadmasters);

      // Fetch admin users - these are users with admin role that aren't teachers or headmasters
      const { data: adminsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

      setAdminUsers(adminsData || []);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (values: UserFormValues) => {
    try {
      // Create a user account in the auth system
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password || 'defaultPassword123', // Set a default password if not provided
        options: {
          data: {
            name: values.name,
            role: values.role,
          },
        },
      });

      if (userError) throw userError;
      
      if (!userData.user) {
        throw new Error('Failed to create user');
      }

      // Create a record in the users table
      const { error: userRecordError } = await supabase
        .from('users')
        .insert({
          id: userData.user.id,
          email: values.email,
          name: values.name,
          is_active: true,
          setup_complete: true,
          token_identifier: values.email,
        });

      if (userRecordError) throw userRecordError;

      // Based on the role, create a record in the appropriate table
      if (values.role === 'teacher') {
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: userData.user.id,
            school_id: values.schoolId,
            name: values.name,
            ec_number: values.ecNumber,
            level: 'primary', // Default value, can be updated later
          });

        if (teacherError) throw teacherError;

        // Add subject associations if provided
        if (values.subjects && values.subjects.length > 0) {
          const subjectAssociations = values.subjects.map(subjectId => ({
            teacher_id: userData.user.id,
            subject_id: subjectId,
          }));

          const { error: subjectError } = await supabase
            .from('teacher_subjects')
            .insert(subjectAssociations);

          if (subjectError) throw subjectError;
        }

        toast({
          title: 'Teacher Created',
          description: `${values.name} has been added as a teacher`,
          variant: 'default',
        });
      } else if (values.role === 'headmaster') {
        const { error: headmasterError } = await supabase
          .from('headmasters')
          .insert({
            user_id: userData.user.id,
            school_id: values.schoolId,
            name: values.name,
            ec_number: values.ecNumber,
          });

        if (headmasterError) throw headmasterError;

        toast({
          title: 'Headmaster Created',
          description: `${values.name} has been added as a headmaster`,
          variant: 'default',
        });
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async (values: UserFormValues) => {
    if (!currentUser) return;

    try {
      // Update user name and email if they've changed
      if (currentUser.name !== values.name || currentUser.email !== values.email) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: values.name,
            email: values.email,
          })
          .eq('id', currentUser.userId);

        if (userError) throw userError;
      }

      let updatedUser = null;

      // Update specific fields based on role
      if (currentUser.role === 'teacher') {
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .update({
            name: values.name,
            school_id: values.schoolId,
          })
          .eq('id', currentUser.id)
          .select();

        if (teacherError) throw teacherError;
        updatedUser = teacherData ? teacherData[0] : null;
      } else if (currentUser.role === 'headmaster') {
        const { data: headmasterData, error: headmasterError } = await supabase
          .from('headmasters')
          .update({
            name: values.name,
            school_id: values.schoolId,
          })
          .eq('id', currentUser.id)
          .select();

        if (headmasterError) throw headmasterError;
        updatedUser = headmasterData ? headmasterData[0] : null;
      }

      toast({
        title: 'User Updated',
        description: `${values.name}'s information has been updated`,
        variant: 'default',
      });

      setIsDialogOpen(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user information',
        variant: 'destructive',
      });
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      const newStatus = !user.isActive;
      
      // Update user status in the users table
      const { error } = await supabase
        .from('users')
        .update({
          is_active: newStatus,
        })
        .eq('id', user.userId);

      if (error) throw error;

      toast({
        title: newStatus ? 'User Activated' : 'User Deactivated',
        description: `${user.name} has been ${newStatus ? 'activated' : 'deactivated'}`,
        variant: newStatus ? 'default' : 'destructive',
      });

      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: any) => {
    setCurrentUser(user);
    setUserType(user.role as 'teacher' | 'headmaster');
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.ecNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHeadmasters = headmasters.filter(headmaster => 
    headmaster.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    headmaster.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    headmaster.ecNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    headmaster.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage teachers, headmasters, and administrators in the system
          </p>
        </div>

        {/* User Type Selection Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUserType('teacher')}
            className={userType === 'teacher' ? 'border-primary' : ''}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUserType('headmaster')}
            className={userType === 'headmaster' ? 'border-primary' : ''}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Headmaster
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-6 flex">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Teachers Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>
                  View and manage all teachers in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>EC Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.schoolName}</TableCell>
                          <TableCell>{teacher.district}</TableCell>
                          <TableCell>{teacher.ecNumber}</TableCell>
                          <TableCell>
                            <Badge variant={teacher.isActive ? "outline" : "destructive"}>
                              {teacher.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(teacher)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(teacher)}
                              >
                                {teacher.isActive ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No teachers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Headmasters Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Headmasters</CardTitle>
                <CardDescription>
                  View and manage all headmasters in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>EC Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHeadmasters.length > 0 ? (
                      filteredHeadmasters.map((headmaster) => (
                        <TableRow key={headmaster.id}>
                          <TableCell>{headmaster.name}</TableCell>
                          <TableCell>{headmaster.email}</TableCell>
                          <TableCell>{headmaster.schoolName}</TableCell>
                          <TableCell>{headmaster.district}</TableCell>
                          <TableCell>{headmaster.ecNumber}</TableCell>
                          <TableCell>
                            <Badge variant={headmaster.isActive ? "outline" : "destructive"}>
                              {headmaster.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(headmaster)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(headmaster)}
                              >
                                {headmaster.isActive ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No headmasters found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* User Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit User' : `Add New ${userType === 'teacher' ? 'Teacher' : 'Headmaster'}`}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? 'Update user information.' : `Enter details to create a new ${userType === 'teacher' ? 'teacher' : 'headmaster'}.`}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(isEditing ? handleUpdateUser : handleAddUser)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter full name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter email address"
                              disabled={isEditing} // Disable email change for existing users
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ecNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EC Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter EC number"
                              disabled={isEditing} // EC number should not be changed once set
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isEditing} // Disable role change for existing users
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="headmaster">Headmaster</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Assignment</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a school" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name} ({school.district})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isEditing && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Leave blank for default password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditing ? 'Update User' : 'Create User'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  PlusCircle, 
  Edit,
  Trash,
  Loader2 
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Headmaster, School } from '@/types';

// Form schema for headmaster validation
const headmasterSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  ec_number: z.string().min(3, "EC number is required"),
  email: z.string().email("Please enter a valid email address"),
  school_id: z.string().min(1, "Please select a school"),
});

type HeadmasterFormValues = z.infer<typeof headmasterSchema>;

const AdminHeadmasters = () => {
  const [search, setSearch] = useState('');
  const [headmasters, setHeadmasters] = useState<any[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHeadmaster, setCurrentHeadmaster] = useState<any>(null);
  const { toast } = useToast();
  
  const form = useForm<HeadmasterFormValues>({
    resolver: zodResolver(headmasterSchema),
    defaultValues: {
      name: '',
      ec_number: '',
      email: '',
      school_id: '',
    },
  });

  useEffect(() => {
    fetchHeadmasters();
    fetchSchools();
  }, []);

  useEffect(() => {
    if (currentHeadmaster) {
      form.setValue('name', currentHeadmaster.name);
      form.setValue('ec_number', currentHeadmaster.ec_number);
      form.setValue('email', currentHeadmaster.email);
      form.setValue('school_id', currentHeadmaster.school_id);
    } else {
      form.reset();
    }
  }, [currentHeadmaster, form]);

  const fetchHeadmasters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('headmasters')
        .select(`
          *,
          schools:school_id (
            id, 
            name, 
            district,
            type
          )
        `)
        .order('name');

      if (error) throw error;
      setHeadmasters(data || []);
    } catch (error) {
      console.error('Error fetching headmasters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load headmasters. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      // Get all schools
      const { data: allSchoolsData, error: allSchoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (allSchoolsError) throw allSchoolsError;
      setAllSchools(allSchoolsData || []);
      
      // Get schools that don't have a headmaster assigned
      const { data: availableSchoolsData, error: availableSchoolsError } = await supabase
        .from('schools')
        .select('*')
        .is('headmaster_id', null)
        .order('name');

      if (availableSchoolsError) throw availableSchoolsError;
      setAvailableSchools(availableSchoolsData || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schools. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setCurrentHeadmaster(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (headmaster: any) => {
    setCurrentHeadmaster(headmaster);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: HeadmasterFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentHeadmaster) {
        // Handle school reassignment if school changed
        if (currentHeadmaster.school_id !== values.school_id) {
          // Remove headmaster from old school
          await supabase
            .from('schools')
            .update({ headmaster_id: null })
            .eq('id', currentHeadmaster.school_id);
            
          // Set headmaster for new school
          await supabase
            .from('schools')
            .update({ headmaster_id: currentHeadmaster.id })
            .eq('id', values.school_id);
        }
        
        // Update existing headmaster
        const { error } = await supabase
          .from('headmasters')
          .update({
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
            updated_at: new Date().toISOString() // Changed Date to toISOString()
          })
          .eq('id', currentHeadmaster.id);

        if (error) throw error;
        
        // Update user email if changed
        if (currentHeadmaster.email !== values.email) {
          const { error: userError } = await supabase
            .from('users')
            .update({ email: values.email })
            .eq('id', currentHeadmaster.user_id);
            
          if (userError) throw userError;
        }
        
        toast({
          title: 'Success',
          description: 'Headmaster updated successfully',
        });
      } else {
        // Create new user account
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: values.email,
          email_confirm: true,
          user_metadata: { name: values.name, role: 'headmaster' }
        });

        if (userError) throw userError;
        
        // Create headmaster record
        const { data: headmasterData, error: headmasterError } = await supabase
          .from('headmasters')
          .insert({
            name: values.name,
            ec_number: values.ec_number,
            school_id: values.school_id,
            user_id: userData.user.id
          })
          .select()
          .single();

        if (headmasterError) throw headmasterError;
        
        // Update school with headmaster_id
        const { error: schoolError } = await supabase
          .from('schools')
          .update({ headmaster_id: headmasterData.id })
          .eq('id', values.school_id);
          
        if (schoolError) throw schoolError;
        
        toast({
          title: 'Success',
          description: 'Headmaster added successfully and invitation email sent',
        });
      }

      setIsDialogOpen(false);
      fetchHeadmasters();
      fetchSchools();
    } catch (error: any) {
      console.error('Error submitting headmaster:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save headmaster. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, schoolId: string) => {
    if (!confirm('Are you sure you want to delete this headmaster? This action cannot be undone.')) {
      return;
    }

    try {
      // Remove headmaster_id from school
      await supabase
        .from('schools')
        .update({ headmaster_id: null })
        .eq('id', schoolId);
      
      // Delete headmaster
      const { error } = await supabase
        .from('headmasters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Headmaster deleted successfully',
      });
      
      fetchHeadmasters();
      fetchSchools();
    } catch (error: any) {
      console.error('Error deleting headmaster:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete headmaster.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter headmasters based on search term
  const filteredHeadmasters = headmasters.filter(headmaster => 
    headmaster.name.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.ec_number.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.email?.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.schools?.name.toLowerCase().includes(search.toLowerCase()) ||
    headmaster.schools?.district.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Headmasters Management</h1>
          <Button onClick={openAddDialog} disabled={availableSchools.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Headmaster
          </Button>
        </div>
        
        {availableSchools.length === 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <p className="text-yellow-700">
                All schools currently have headmasters assigned. To add a new headmaster,
                first add a new school or remove an existing headmaster.
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Headmasters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, EC number, email, or school..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">EC Number</th>
                  <th className="text-left py-3 px-4">School</th>
                  <th className="text-left py-3 px-4">District</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeadmasters.length > 0 ? (
                  filteredHeadmasters.map((headmaster) => (
                    <tr key={headmaster.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{headmaster.name}</td>
                      <td className="py-3 px-4">{headmaster.ec_number}</td>
                      <td className="py-3 px-4">{headmaster.schools?.name}</td>
                      <td className="py-3 px-4">{headmaster.schools?.district}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(headmaster)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(headmaster.id, headmaster.school_id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6">
                      No headmasters found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Headmaster Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ec_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EC Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. EC12345" />
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
                      <Input {...field} type="email" placeholder="e.g. john.doe@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                        {/* Show all schools when editing, only available schools when adding */}
                        {(currentHeadmaster ? allSchools : availableSchools).map((school) => (
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
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
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

export default AdminHeadmasters;

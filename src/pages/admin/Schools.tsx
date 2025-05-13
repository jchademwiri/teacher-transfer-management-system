import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { District, School } from '@/types';
import { mapSchool, mapDistrict } from '@/lib/mappers';
import { Edit, PlusCircle, Loader2, Search, School as SchoolIcon } from 'lucide-react';

// Define headmaster data type
type HeadmasterData = {
  id: string;
  name?: string;
  email?: string;
  ecNumber?: string;
  schoolId?: string | null;
  users?: {
    name?: string;
    email?: string;
  } | null;
};

// Form schema for school
const schoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  type: z.string().min(1, 'School type is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  districtId: z.string().min(1, 'District is required'),
  headmasterId: z.string().optional(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const SchoolsPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [headmasters, setHeadmasters] = useState<HeadmasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const { toast } = useToast();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      type: '',
      address: '',
      districtId: '',
      headmasterId: '',
    },
  });

  useEffect(() => {
    fetchSchools();
    fetchDistricts();
    fetchAvailableHeadmasters();
  }, []);

  useEffect(() => {
    // Reset form when the dialog is opened for adding a new school
    if (!isEditing && isDialogOpen) {
      form.reset({
        name: '',
        type: '',
        address: '',
        districtId: '',
        headmasterId: '',
      });
    }
    // Set form values when editing an existing school
    else if (isEditing && currentSchool) {
      const districtId = districts.find(d => d.name === currentSchool.district)?.id || '';
      form.reset({
        name: currentSchool.name,
        type: currentSchool.type,
        address: currentSchool.address,
        districtId: districtId,
        headmasterId: currentSchool.headmasterId || '',
      });
    }
  }, [isDialogOpen, isEditing, currentSchool, form, districts]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const { data: schoolsData, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;

      if (schoolsData) {
        const mappedSchools = schoolsData.map(mapSchool);
        setSchools(mappedSchools);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schools',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedDistricts = data.map(mapDistrict);
        setDistricts(mappedDistricts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch districts',
        variant: 'destructive',
      });
    }
  };

  // Update the fetchAvailableHeadmasters function
  const fetchAvailableHeadmasters = async () => {
    try {
      // Fetch headmasters who are not assigned to any school
      const { data, error } = await supabase
        .from('headmasters')
        .select('id, name, ec_number, school_id, users:user_id (name, email)')
        .order('name');

      if (error) throw error;

      // Safely map the headmaster data with proper type checks
      const mappedHeadmasters = data?.map(headmaster => {
        // Use optional chaining and nullish coalescing to safely access properties
        const userName = headmaster.users?.name;
        const userEmail = headmaster.users?.email;
        
        return {
          id: headmaster.id,
          name: headmaster.name || userName || 'Unknown',
          email: userEmail || '',
          ecNumber: headmaster.ec_number,
          schoolId: headmaster.school_id,
        };
      }) || [];

      setHeadmasters(mappedHeadmasters);
    } catch (error) {
      console.error('Error fetching headmasters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch headmasters',
        variant: 'destructive',
      });
    }
  };

  const handleAddOrUpdateSchool = async (values: SchoolFormValues) => {
    try {
      // Get the district name from id
      const district = districts.find(d => d.id === values.districtId);
      
      if (!district) {
        toast({
          title: 'Error',
          description: 'Invalid district selected',
          variant: 'destructive',
        });
        return;
      }
      
      if (isEditing && currentSchool) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update({
            name: values.name,
            type: values.type,
            district: district.name,
            district_id: values.districtId,
            headmaster_id: values.headmasterId || null,
            address: values.address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSchool.id);

        if (error) throw error;

        toast({
          title: 'School updated',
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        // Create new school
        const { error } = await supabase
          .from('schools')
          .insert({
            name: values.name,
            type: values.type,
            district: district.name,
            district_id: values.districtId,
            headmaster_id: values.headmasterId || null,
            address: values.address,
          });

        if (error) throw error;

        toast({
          title: 'School added',
          description: `${values.name} has been added successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchSchools();
    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: 'Error',
        description: 'Failed to save school',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (school: School) => {
    setCurrentSchool(school);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
          <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredSchools.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSchools.map((school) => (
                  <Card key={school.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{school.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{school.district}</p>
                        {school.address && (
                          <p className="text-sm text-muted-foreground">{school.address}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No schools found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit School' : 'Add New School'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the school information below.' : 'Add a new school to the system.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddOrUpdateSchool)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter school name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="combined">Combined</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter school address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headmasterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headmaster (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select headmaster" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {headmasters
                            .filter(h => !h.schoolId || (currentSchool && h.schoolId === currentSchool.id))
                            .map((headmaster) => (
                              <SelectItem key={headmaster.id} value={headmaster.id}>
                                {headmaster.name} ({headmaster.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? 'Update School' : 'Add School'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SchoolsPage;

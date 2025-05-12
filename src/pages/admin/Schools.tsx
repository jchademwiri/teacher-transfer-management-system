
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
import { School } from '@/types';

// Form schema for school validation
const schoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  district_id: z.string().min(1, "Please select a district"),
  type: z.string().min(1, "Please select a school type"),
  address: z.string().optional(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const AdminSchools = () => {
  const [search, setSearch] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const { toast } = useToast();
  
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      district_id: '',
      type: '',
      address: '',
    },
  });

  useEffect(() => {
    Promise.all([
      fetchSchools(),
      fetchDistricts()
    ]);
  }, []);

  useEffect(() => {
    if (currentSchool) {
      form.setValue('name', currentSchool.name);
      form.setValue('district_id', currentSchool.district_id || '');
      form.setValue('type', currentSchool.type || '');
      form.setValue('address', currentSchool.address || '');
    } else {
      form.reset();
    }
  }, [currentSchool, form]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          districts(name)
        `)
        .order('name');

      if (error) throw error;
      
      const mappedSchools = data.map(school => ({
        id: school.id,
        name: school.name,
        district: school.districts?.name || school.district,
        districtId: school.district_id,
        type: school.type,
        address: school.address || '',
        headmasterId: school.headmaster_id || undefined,
      }));
      
      setSchools(mappedSchools as School[]);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schools. Please try again.',
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
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load districts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setCurrentSchool(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (school: any) => {
    setCurrentSchool(school);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: SchoolFormValues) => {
    setIsSubmitting(true);
    try {
      // Get district info for the district field
      const { data: districtData } = await supabase
        .from('districts')
        .select('name')
        .eq('id', values.district_id)
        .single();

      if (!districtData) {
        throw new Error("Selected district not found");
      }

      const schoolData = {
        name: values.name,
        district: districtData.name, // Set the district name
        district_id: values.district_id,
        type: values.type,
        address: values.address,
        updated_at: new Date().toISOString(),
      };

      if (currentSchool) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update(schoolData)
          .eq('id', currentSchool.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'School updated successfully',
        });
      } else {
        // Create new school
        const { error } = await supabase
          .from('schools')
          .insert(schoolData);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'School added successfully',
        });
      }

      setIsDialogOpen(false);
      fetchSchools();
    } catch (error: any) {
      console.error('Error submitting school:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save school. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone and may affect teachers and headmasters assigned to this school.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'School deleted successfully',
      });
      
      fetchSchools();
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete school. It may be referenced by teachers or headmasters.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter schools based on search term
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    school.district.toLowerCase().includes(search.toLowerCase()) ||
    school.type.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schools Management</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New School
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, district, or type..."
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
                  <th className="text-left py-3 px-4">School Name</th>
                  <th className="text-left py-3 px-4">District</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{school.name}</td>
                      <td className="py-3 px-4">{school.district}</td>
                      <td className="py-3 px-4">{school.type}</td>
                      <td className="py-3 px-4 space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(school)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(school.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6">
                      No schools found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit School Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
            <DialogDescription>
              {currentSchool 
                ? 'Update the school information below.' 
                : 'Enter the details for the new school.'
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
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Mutare High School" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="district_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school type" />
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
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="School address" />
                    </FormControl>
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
                  {currentSchool ? 'Update School' : 'Add School'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSchools;

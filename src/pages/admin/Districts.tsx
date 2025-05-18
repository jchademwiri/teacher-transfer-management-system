
import React, { useState, useEffect } from 'react';
// import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { District } from '@/types';
import { mapDistrict } from '@/lib/mappers';
import { Edit, PlusCircle, Loader2, Search } from 'lucide-react';

// Form schema for district
const districtSchema = z.object({
  name: z.string().min(3, 'District name must be at least 3 characters'),
});

type DistrictFormValues = z.infer<typeof districtSchema>;

const DistrictsPage = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
  const { toast } = useToast();

  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    // Reset form when the dialog is opened for adding a new district
    if (!isEditing && isDialogOpen) {
      form.reset({
        name: '',
      });
    }
    // Set form values when editing an existing district
    else if (isEditing && currentDistrict) {
      form.setValue('name', currentDistrict.name);
    }
  }, [isDialogOpen, isEditing, currentDistrict, form]);

  const fetchDistricts = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateDistrict = async (values: DistrictFormValues) => {
    try {
      if (isEditing && currentDistrict) {
        const { error } = await supabase
          .from('districts')
          .update({
            name: values.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentDistrict.id);

        if (error) throw error;

        toast({
          title: 'District updated',
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('districts')
          .insert({
            name: values.name,
          });

        if (error) throw error;

        toast({
          title: 'District added',
          description: `${values.name} has been added successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchDistricts();
    } catch (error) {
      console.error('Error saving district:', error);
      toast({
        title: 'Error',
        description: 'Failed to save district',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (district: District) => {
    setCurrentDistrict(district);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Districts</h1>
          <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add District
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search districts..."
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
            ) : filteredDistricts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDistricts.map((district) => (
                  <Card key={district.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{district.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(district)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No districts found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit District' : 'Add New District'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the district information below.' : 'Add a new district to the system.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddOrUpdateDistrict)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter district name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? 'Update District' : 'Add District'}
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

export default DistrictsPage;

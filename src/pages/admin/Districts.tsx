
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, Loader2 } from 'lucide-react';
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

// Form schema for district validation
const districtSchema = z.object({
  name: z.string().min(3, "District name must be at least 3 characters"),
});

type DistrictFormValues = z.infer<typeof districtSchema>;

const AdminDistricts = () => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<any>(null);
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
    if (currentDistrict) {
      form.setValue('name', currentDistrict.name);
    } else {
      form.reset();
    }
  }, [currentDistrict, form]);

  const fetchDistricts = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentDistrict(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (district: any) => {
    setCurrentDistrict(district);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: DistrictFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentDistrict) {
        // Update existing district
        const { error } = await supabase
          .from('districts')
          .update({ name: values.name, updated_at: new Date().toISOString() })
          .eq('id', currentDistrict.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'District updated successfully',
        });
      } else {
        // Create new district
        const { error } = await supabase
          .from('districts')
          .insert({ name: values.name });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'District added successfully',
        });
      }

      setIsDialogOpen(false);
      fetchDistricts();
    } catch (error: any) {
      console.error('Error submitting district:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save district. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this district? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'District deleted successfully',
      });
      
      fetchDistricts();
    } catch (error: any) {
      console.error('Error deleting district:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete district. It may be referenced by schools.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">District Management</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New District
          </Button>
        </div>

        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Districts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : districts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left py-3 px-4">District Name</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((district) => (
                      <tr key={district.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{district.name}</td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(district)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive" 
                            onClick={() => handleDelete(district.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No districts found. Add your first district using the button above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit District Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDistrict ? 'Edit District' : 'Add New District'}</DialogTitle>
            <DialogDescription>
              {currentDistrict 
                ? 'Update the district information below.' 
                : 'Enter the details for the new district.'
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
                    <FormLabel>District Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Mutare District" />
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
                  {currentDistrict ? 'Update District' : 'Add District'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDistricts;

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { District } from '@/types';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "District name must be at least 2 characters"
  })
});

type FormData = z.infer<typeof formSchema>;

const AdminDistricts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (currentDistrict) {
      editForm.reset({ name: currentDistrict.name });
    }
  }, [currentDistrict, editForm]);

  const fetchDistricts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast({
        title: "Error",
        description: "Failed to load districts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDistrict = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('districts')
        .insert({
          name: data.name,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "District added successfully"
      });
      
      setIsAddDialogOpen(false);
      form.reset();
      fetchDistricts();
    } catch (error: any) {
      console.error('Error adding district:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add district",
        variant: "destructive"
      });
    }
  };

  const handleEditDistrict = async (data: FormData) => {
    if (!currentDistrict) return;
    
    try {
      const { error } = await supabase
        .from('districts')
        .update({
          name: data.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentDistrict.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "District updated successfully"
      });
      
      setIsEditDialogOpen(false);
      editForm.reset();
      setCurrentDistrict(null);
      fetchDistricts();
    } catch (error: any) {
      console.error('Error updating district:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update district",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (district: District) => {
    setCurrentDistrict(district);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Districts Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add New District
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Districts List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading districts...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districts.map((district) => (
                      <TableRow key={district.id}>
                        <TableCell className="font-medium">{district.name}</TableCell>
                        <TableCell>{new Date(district.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(district.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(district)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add District Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New District</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddDistrict)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Name</FormLabel>
                      <FormControl>
                        <Input placeholder="District name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add District</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit District Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit District</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditDistrict)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Name</FormLabel>
                      <FormControl>
                        <Input placeholder="District name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Update District</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDistricts;

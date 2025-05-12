
import { useState, useEffect } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapDistrict } from '@/lib/mappers';
import { District } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const AdminDistricts = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDistrict, setNewDistrict] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setDistricts(data.map(mapDistrict));
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

  const handleAddDistrict = async () => {
    if (!newDistrict.trim()) {
      toast({
        title: 'Validation Error',
        description: 'District name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('districts')
        .insert([{ name: newDistrict.trim() }])
        .select();
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: 'Error',
            description: 'A district with this name already exists.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        setDistricts([...districts, mapDistrict(data[0])]);
        setNewDistrict('');
        setIsAddDialogOpen(false);
        toast({
          title: 'Success',
          description: 'District added successfully.',
        });
      }
    } catch (error) {
      console.error('Error adding district:', error);
      toast({
        title: 'Error',
        description: 'Failed to add district. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDistrict = async (id: string) => {
    // Check if district has schools before deleting
    try {
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('district_id', id);
      
      if (schoolsError) throw schoolsError;
      
      if (schools && schools.length > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'This district has schools assigned to it. Remove the schools first.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDistricts(districts.filter(district => district.id !== id));
      toast({
        title: 'Success',
        description: 'District deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting district:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete district. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Districts Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New District
          </Button>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">Loading districts...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {districts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <p>No districts found. Add a district to get started.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              districts.map((district) => (
                <Card key={district.id} className="shadow-sm">
                  <CardContent className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="text-lg font-medium">{district.name}</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteDistrict(district.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        
        {/* Add District Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New District</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="district-name" className="block text-sm font-medium mb-2">
                District Name
              </label>
              <Input
                id="district-name"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="Enter district name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDistrict}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDistricts;

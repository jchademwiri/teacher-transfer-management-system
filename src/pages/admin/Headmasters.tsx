
import { useState, useEffect } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchools } from '@/hooks/use-schools';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Headmaster } from '@/types';
import { mapHeadmaster } from '@/lib/mappers';

const AdminHeadmasters = () => {
  const [search, setSearch] = useState('');
  const [headmasters, setHeadmasters] = useState<Headmaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { schools, isLoading: isLoadingSchools } = useSchools();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHeadmaster, setSelectedHeadmaster] = useState<Headmaster | null>(null);
  
  // Form states for adding/editing headmasters
  const [formData, setFormData] = useState({
    name: '',
    ecNumber: '',
    email: '',
    schoolId: ''
  });
  
  useEffect(() => {
    fetchHeadmasters();
  }, []);
  
  const fetchHeadmasters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('headmasters')
        .select(`
          *,
          schools(name, district)
        `);
      
      if (error) {
        throw error;
      }
      
      // Get user details for each headmaster
      const headmasterIds = data.map(h => h.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, is_active, setup_complete')
        .in('id', headmasterIds);
      
      if (usersError) {
        throw usersError;
      }
      
      // Combine headmaster and user data
      const mappedHeadmasters = data.map(headmaster => {
        const user = users?.find(u => u.id === headmaster.user_id);
        return {
          ...mapHeadmaster(headmaster),
          email: user?.email || '',
          isActive: user?.is_active || false,
          setupComplete: user?.setup_complete || false,
          schoolName: headmaster.schools?.name || '',
          district: headmaster.schools?.district || ''
        };
      });
      
      setHeadmasters(mappedHeadmasters);
    } catch (err) {
      console.error('Error fetching headmasters:', err);
      toast({
        title: 'Error',
        description: 'Failed to load headmasters. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddHeadmaster = () => {
    setFormData({
      name: '',
      ecNumber: '',
      email: '',
      schoolId: ''
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEditHeadmaster = (headmaster: Headmaster) => {
    setSelectedHeadmaster(headmaster);
    setFormData({
      name: headmaster.name,
      ecNumber: headmaster.ecNumber || '',
      email: headmaster.email || '',
      schoolId: headmaster.schoolId
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just filter the existing data
    // In a real app, you might want to fetch from server with the search term
  };
  
  const handleSaveHeadmaster = async () => {
    // This is a placeholder for the full implementation
    // You would need to:
    // 1. Create a user in auth
    // 2. Add the user to the users table
    // 3. Create the headmaster record
    
    toast({
      title: 'Feature not implemented',
      description: 'This feature is currently being developed.',
      variant: 'destructive',
    });
    
    setIsAddDialogOpen(false);
  };
  
  const filteredHeadmasters = headmasters.filter(headmaster => 
    headmaster.name.toLowerCase().includes(search.toLowerCase()) ||
    (headmaster.ecNumber && headmaster.ecNumber.toLowerCase().includes(search.toLowerCase())) ||
    (headmaster.email && headmaster.email.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Headmasters Management</h1>
          <Button onClick={handleAddHeadmaster}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Headmaster
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Headmasters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, EC number, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="text-center py-8">Loading headmasters...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">EC Number</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">School</th>
                  <th className="text-left py-3 px-4">District</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeadmasters.length > 0 ? (
                  filteredHeadmasters.map((headmaster) => (
                    <tr key={headmaster.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{headmaster.name}</td>
                      <td className="py-3 px-4">{headmaster.ecNumber || '—'}</td>
                      <td className="py-3 px-4">{headmaster.email || '—'}</td>
                      <td className="py-3 px-4">{(headmaster as any).schoolName || '—'}</td>
                      <td className="py-3 px-4">{(headmaster as any).district || '—'}</td>
                      <td className="py-3 px-4">
                        {headmaster.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditHeadmaster(headmaster)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
        
        {/* Add Headmaster Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Headmaster</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="headmaster-name" className="text-right">Full Name</Label>
                <Input
                  id="headmaster-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="headmaster-ec" className="text-right">EC Number</Label>
                <Input
                  id="headmaster-ec"
                  value={formData.ecNumber}
                  onChange={(e) => setFormData({...formData, ecNumber: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="headmaster-email" className="text-right">Email</Label>
                <Input
                  id="headmaster-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="headmaster-school" className="text-right">School</Label>
                <Select 
                  value={formData.schoolId} 
                  onValueChange={(value) => setFormData({...formData, schoolId: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSchools ? (
                      <SelectItem value="" disabled>Loading schools...</SelectItem>
                    ) : (
                      schools
                        .filter(school => !school.headmasterId) // Only show schools without a headmaster
                        .map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} ({school.district})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveHeadmaster}>Save Headmaster</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Headmaster Dialog - placeholder for now */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Headmaster</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-center">This functionality is not yet implemented.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminHeadmasters;

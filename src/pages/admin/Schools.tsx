
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useSchools } from '@/hooks/use-schools';
import { useDistricts } from '@/hooks/use-districts';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { School } from '@/types';

const AdminSchools = () => {
  const [search, setSearch] = useState('');
  const { schools, isLoading, fetchSchools, addSchool, updateSchool, deleteSchool } = useSchools();
  const { districts, isLoading: isLoadingDistricts } = useDistricts();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  
  // Form states for adding/editing schools
  const [formData, setFormData] = useState({
    name: '',
    districtId: '',
    type: 'primary' as 'primary' | 'secondary' | 'combined',
    address: ''
  });
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools({ search });
  };
  
  const handleAddSchool = () => {
    setFormData({
      name: '',
      districtId: '',
      type: 'primary',
      address: ''
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      districtId: school.districtId || '',
      type: school.type,
      address: school.address || ''
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveSchool = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'School name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.districtId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a district.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await addSchool(formData);
    
    if (result.success) {
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'School added successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add school.',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateSchool = async () => {
    if (!selectedSchool) return;
    
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'School name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.districtId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a district.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = await updateSchool(selectedSchool.id, formData);
    
    if (result.success) {
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'School updated successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update school.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteSchool = async (schoolId: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) {
      return;
    }
    
    const result = await deleteSchool(schoolId);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'School deleted successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete school.',
        variant: 'destructive',
      });
    }
  };
  
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    school.district.toLowerCase().includes(search.toLowerCase()) ||
    school.type.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schools Management</h1>
          <Button onClick={handleAddSchool}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New School
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
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
            </form>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="text-center py-8">Loading schools...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left py-3 px-4">School Name</th>
                  <th className="text-left py-3 px-4">District</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{school.name}</td>
                      <td className="py-3 px-4">{school.district}</td>
                      <td className="py-3 px-4 capitalize">{school.type}</td>
                      <td className="py-3 px-4">{school.address || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSchool(school)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeleteSchool(school.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6">
                      No schools found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Add School Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-name" className="text-right">Name</Label>
                <Input
                  id="school-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-district" className="text-right">District</Label>
                <Select 
                  value={formData.districtId} 
                  onValueChange={(value) => setFormData({...formData, districtId: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDistricts ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-type" className="text-right">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-address" className="text-right">Address</Label>
                <Input
                  id="school-address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchool}>Save School</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit School Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-school-name" className="text-right">Name</Label>
                <Input
                  id="edit-school-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-school-district" className="text-right">District</Label>
                <Select 
                  value={formData.districtId} 
                  onValueChange={(value) => setFormData({...formData, districtId: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDistricts ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-school-type" className="text-right">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-school-address" className="text-right">Address</Label>
                <Input
                  id="edit-school-address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSchool}>Update School</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSchools;

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import MainNavigation from "@/components/MainNavigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TeachersTable, TeacherData } from '@/components/admin/TeachersTable';
import { useToast } from '@/hooks/use-toast';
import { UserForm, UserFormValues } from '@/components/admin/UserForm';
import { userSchema } from '@/components/admin/UserFormSchema';
import { z } from 'zod';

const AdminTeachers = () => {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        ec_number,
        school_id,
        schools:school_id (
          id,
          name,
          district
        )
      `)
      .eq('role', 'teacher')
      .order('name');

    console.log('Teachers data:', data, 'Error:', error);

    if (error || !Array.isArray(data)) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } else {
      const mapped = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email || '',
        ec_number: t.ec_number || '',
        school: t.schools && t.schools.id ? {
          id: t.schools.id,
          name: t.schools.name,
          district: t.schools.district
        } : undefined
      }));
      setTeachers(mapped);
    }
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (teacher.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (teacher.ec_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (teacher.school?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (teacher.school?.district || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (teacher: TeacherData) => {
    setCurrentTeacher(teacher);
    setIsDialogOpen(true);
  };

  const handleUpdateTeacher = async (values: UserFormValues) => {
    if (!currentTeacher) return;
    const { error } = await supabase
      .from('users')
      .update({
        name: values.name,
        email: values.email,
        ec_number: values.ecNumber,
        school_id: values.schoolId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentTeacher.id);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update teacher',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Teacher updated successfully',
      });
      handleDialogClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully',
      });
      fetchTeachers();
    }
  };

  // Placeholder for edit form/dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentTeacher(null);
    fetchTeachers();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teachers Management</h1>
          {/* Future: Add New Teacher Button */}
          {/* <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Teacher
          </Button> */}
        </div>
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, EC number, school, or district..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <TeachersTable
          teachers={teachers}
          filteredTeachers={filteredTeachers}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/* Edit Teacher Dialog (future-proof, can add form here) */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>
                Edit teacher details below.
              </DialogDescription>
            </DialogHeader>
            {currentTeacher && (
              <UserForm
                isEditing={true}
                currentUser={{
                  ...currentTeacher,
                  email: currentTeacher.email || '',
                  ecNumber: currentTeacher.ec_number || '',
                  schoolId: currentTeacher.school?.id || '',
                  role: 'teacher',
                  createdAt: '',
                  updatedAt: '',
                  isActive: true,
                  setupComplete: false,
                }}
                schools={[]}
                subjects={[]}
                onSubmit={handleUpdateTeacher}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTeachers;

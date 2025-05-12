
import { useState, useEffect } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { useSchools } from '@/hooks/use-schools';
import { supabase } from '@/integrations/supabase/client';
import { mapTeacher } from '@/lib/mappers';
import { Teacher } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const AdminTeachers = () => {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { schools } = useSchools();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTeachers();
  }, []);
  
  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          schools(name, district)
        `);
      
      if (error) {
        throw error;
      }
      
      // Get user details for each teacher
      const teacherIds = data.map(t => t.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, is_active, setup_complete')
        .in('id', teacherIds);
      
      if (usersError) {
        throw usersError;
      }
      
      // Get subject information for each teacher
      const { data: subjectRelations, error: subjectError } = await supabase
        .from('teacher_subjects')
        .select(`
          teacher_id,
          subject_id,
          is_primary,
          subjects(name)
        `);
      
      if (subjectError) {
        throw subjectError;
      }
      
      // Combine teacher, user, and subject data
      const mappedTeachers = data.map(teacher => {
        const user = users?.find(u => u.id === teacher.user_id);
        
        // Get subjects for this teacher
        const teacherSubjects = subjectRelations?.filter(sr => sr.teacher_id === teacher.id) || [];
        const primarySubject = teacherSubjects.find(s => s.is_primary)?.subjects?.name || '';
        const otherSubjects = teacherSubjects
          .filter(s => !s.is_primary)
          .map(s => s.subjects?.name)
          .filter(Boolean);
        
        return {
          ...mapTeacher(teacher),
          email: user?.email || '',
          isActive: user?.is_active || false,
          setupComplete: user?.setup_complete || false,
          schoolName: teacher.schools?.name || '',
          district: teacher.schools?.district || '',
          primarySubject,
          otherSubjects
        };
      });
      
      setTeachers(mappedTeachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      toast({
        title: 'Error',
        description: 'Failed to load teachers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just filter the existing data
    // In a real app, you might want to fetch from server with the search term
  };
  
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    (teacher.ecNumber && teacher.ecNumber.toLowerCase().includes(search.toLowerCase())) ||
    (teacher.email && teacher.email.toLowerCase().includes(search.toLowerCase())) ||
    ((teacher as any).schoolName && (teacher as any).schoolName.toLowerCase().includes(search.toLowerCase())) ||
    ((teacher as any).primarySubject && (teacher as any).primarySubject.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teachers Management</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Teacher
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, EC number, school, or subject..."
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
          <div className="text-center py-8">Loading teachers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">EC Number</th>
                  <th className="text-left py-3 px-4">School</th>
                  <th className="text-left py-3 px-4">District</th>
                  <th className="text-left py-3 px-4">Primary Subject</th>
                  <th className="text-left py-3 px-4">Other Subjects</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{teacher.name}</td>
                      <td className="py-3 px-4">{teacher.ecNumber || '—'}</td>
                      <td className="py-3 px-4">{(teacher as any).schoolName || '—'}</td>
                      <td className="py-3 px-4">{(teacher as any).district || '—'}</td>
                      <td className="py-3 px-4">{(teacher as any).primarySubject || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(teacher as any).otherSubjects?.length > 0 ? (
                            (teacher as any).otherSubjects.map((subject: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {subject}
                              </Badge>
                            ))
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-purple-50">
                          {teacher.level}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {teacher.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6">
                      No teachers found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeachers;

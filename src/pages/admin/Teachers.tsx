import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import MainNavigation from "@/components/MainNavigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const AdminTeachers = () => {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email
        `)
        .eq('role', 'teacher');

      if (error || !Array.isArray(data)) {
        console.error('Error fetching teachers:', error);
        setTeachers([]);
      } else {
        const mapped = data.map(t => ({
          id: t.id,
          name: t.name,
          email: t.email || '',
        }));
        setTeachers(mapped);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (teacher.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading teachers...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Teachers Management</h1>
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
                  placeholder="Search by name, email, or school..."
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{teacher.name}</td>
                    <td className="py-3 px-4">{teacher.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-6">
                    No teachers found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTeachers;

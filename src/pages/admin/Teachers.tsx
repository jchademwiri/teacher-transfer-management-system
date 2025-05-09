
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Mock data for teachers
const mockTeachers = [
  {
    id: '1',
    name: 'John Smith',
    ec: 'EC123456',
    email: 'john.smith@example.com',
    school: 'Sunset Primary School',
    district: 'Western District',
    subject: 'Mathematics',
    level: 'Primary',
    yearsOfExperience: 8,
  },
  {
    id: '2',
    name: 'Emily Johnson',
    ec: 'EC234567',
    email: 'emily.johnson@example.com',
    school: 'Sunset Primary School',
    district: 'Western District',
    subject: 'English',
    level: 'Primary',
    yearsOfExperience: 5,
  },
  {
    id: '3',
    name: 'Michael Brown',
    ec: 'EC345678',
    email: 'michael.brown@example.com',
    school: 'Sunset Primary School',
    district: 'Western District',
    subject: 'Science',
    level: 'Primary',
    yearsOfExperience: 3,
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    ec: 'EC456789',
    email: 'sarah.wilson@example.com',
    school: 'Westside Secondary',
    district: 'Western District',
    subject: 'History',
    level: 'Secondary',
    yearsOfExperience: 10,
  },
  {
    id: '5',
    name: 'David Lee',
    ec: 'EC567890',
    email: 'david.lee@example.com',
    school: 'Westside Secondary',
    district: 'Western District',
    subject: 'Chemistry',
    level: 'Secondary',
    yearsOfExperience: 12,
  },
  {
    id: '6',
    name: 'Jennifer Miller',
    ec: 'EC678901',
    email: 'jennifer.miller@example.com',
    school: 'Eastside Elementary',
    district: 'Eastern District',
    subject: 'Art',
    level: 'Primary',
    yearsOfExperience: 6,
  },
];

const AdminTeachers = () => {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState(mockTeachers);
  
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.ec.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email.toLowerCase().includes(search.toLowerCase()) ||
    teacher.school.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
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
                  placeholder="Search by name, EC number, school, or subject..."
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
                <th className="text-left py-3 px-4">EC Number</th>
                <th className="text-left py-3 px-4">School</th>
                <th className="text-left py-3 px-4">District</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Level</th>
                <th className="text-left py-3 px-4">Experience</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{teacher.name}</td>
                    <td className="py-3 px-4">{teacher.ec}</td>
                    <td className="py-3 px-4">{teacher.school}</td>
                    <td className="py-3 px-4">{teacher.district}</td>
                    <td className="py-3 px-4">{teacher.subject}</td>
                    <td className="py-3 px-4">{teacher.level}</td>
                    <td className="py-3 px-4">{teacher.yearsOfExperience} years</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6">
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

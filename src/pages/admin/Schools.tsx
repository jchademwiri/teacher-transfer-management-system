
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';

// Mock data for schools
const mockSchools = [
  {
    id: '1',
    name: 'Sunset Primary School',
    district: 'Western District',
    type: 'Primary',
    teacherCount: 45,
    studentCount: 850,
    address: '123 Sunset Blvd, Western City',
    phone: '+1234567890',
  },
  {
    id: '2',
    name: 'Westside Secondary',
    district: 'Western District',
    type: 'Secondary',
    teacherCount: 60,
    studentCount: 1200,
    address: '456 West Avenue, Western City',
    phone: '+1234567891',
  },
  {
    id: '3',
    name: 'Eastside Elementary',
    district: 'Eastern District',
    type: 'Primary',
    teacherCount: 38,
    studentCount: 720,
    address: '789 East Street, Eastern Town',
    phone: '+1234567892',
  },
  {
    id: '4',
    name: 'Northern High School',
    district: 'Northern District',
    type: 'Secondary',
    teacherCount: 65,
    studentCount: 1350,
    address: '101 North Road, Northern City',
    phone: '+1234567893',
  },
  {
    id: '5',
    name: 'Central Academy',
    district: 'Central District',
    type: 'Combined',
    teacherCount: 85,
    studentCount: 1600,
    address: '505 Central Avenue, Central City',
    phone: '+1234567894',
  },
  {
    id: '6',
    name: 'Southside Elementary',
    district: 'Southern District',
    type: 'Primary',
    teacherCount: 32,
    studentCount: 620,
    address: '202 South Lane, Southern Village',
    phone: '+1234567895',
  },
];

const AdminSchools = () => {
  const [search, setSearch] = useState('');
  const [schools] = useState(mockSchools);
  
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New School
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
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
            </div>
          </CardContent>
        </Card>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted border-b">
                <th className="text-left py-3 px-4">School Name</th>
                <th className="text-left py-3 px-4">District</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Teachers</th>
                <th className="text-left py-3 px-4">Students</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <tr key={school.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{school.name}</td>
                    <td className="py-3 px-4">{school.district}</td>
                    <td className="py-3 px-4">{school.type}</td>
                    <td className="py-3 px-4">{school.teacherCount}</td>
                    <td className="py-3 px-4">{school.studentCount}</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    No schools found matching your search criteria.
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

export default AdminSchools;

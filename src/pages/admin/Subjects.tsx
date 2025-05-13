import React from 'react';
import MainNavigation from "@/components/MainNavigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';

// Mock data for subjects
const mockSubjects = [
  {
    id: '1',
    name: 'Mathematics',
    levels: ['Primary', 'Secondary'],
    teacherCount: 120,
    description: 'Mathematics curriculum including algebra, geometry, and calculus',
  },
  {
    id: '2',
    name: 'English Language',
    levels: ['Primary', 'Secondary'],
    teacherCount: 145,
    description: 'English language and literature studies',
  },
  {
    id: '3',
    name: 'Science',
    levels: ['Primary'],
    teacherCount: 85,
    description: 'General science curriculum for primary education',
  },
  {
    id: '4',
    name: 'Physics',
    levels: ['Secondary'],
    teacherCount: 42,
    description: 'Physics curriculum for secondary education',
  },
  {
    id: '5',
    name: 'Chemistry',
    levels: ['Secondary'],
    teacherCount: 38,
    description: 'Chemistry curriculum for secondary education',
  },
  {
    id: '6',
    name: 'Biology',
    levels: ['Secondary'],
    teacherCount: 45,
    description: 'Biology curriculum for secondary education',
  },
  {
    id: '7',
    name: 'History',
    levels: ['Primary', 'Secondary'],
    teacherCount: 65,
    description: 'History curriculum covering local and world history',
  },
  {
    id: '8',
    name: 'Geography',
    levels: ['Primary', 'Secondary'],
    teacherCount: 58,
    description: 'Geography curriculum covering physical and human geography',
  },
  {
    id: '9',
    name: 'Physical Education',
    levels: ['Primary', 'Secondary'],
    teacherCount: 72,
    description: 'Physical education curriculum for all levels',
  },
  {
    id: '10',
    name: 'Art',
    levels: ['Primary', 'Secondary'],
    teacherCount: 48,
    description: 'Visual arts curriculum including drawing, painting, and craft',
  },
];

const AdminSubjects = () => {
  const [search, setSearch] = useState('');
  const [subjects] = useState(mockSubjects);
  
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(search.toLowerCase()) ||
    subject.levels.some(level => level.toLowerCase().includes(search.toLowerCase())) ||
    subject.description.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Subjects Management</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Subject
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Search Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by subject name, level, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <Card key={subject.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{subject.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Levels</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {subject.levels.map((level, idx) => (
                          <span
                            key={idx}
                            className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Teachers</p>
                      <p className="text-muted-foreground">{subject.teacherCount}</p>
                    </div>
                    <div>
                      <p className="font-medium">Description</p>
                      <p className="text-muted-foreground">{subject.description}</p>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Subject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg text-center">No subjects found matching your search criteria.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubjects;

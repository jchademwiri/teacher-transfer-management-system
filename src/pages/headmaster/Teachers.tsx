
import React, { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { useHeadmasterTeachers } from '@/hooks/use-headmaster-teachers';

// Import components
import { TeachersTable } from '@/components/headmaster/TeachersTable';
import { TeacherFilters } from '@/components/headmaster/TeacherFilters';
import { TeacherProfile } from '@/components/headmaster/TeacherProfile';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const HeadmasterTeachers = () => {
  const {
    teachers,
    subjects,
    isLoading,
    error,
    school,
    filteredTeachers,
    selectedSubject,
    setSelectedSubject,
    selectedLevel,
    setSelectedLevel,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery
  } = useHeadmasterTeachers();

  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const handleTeacherClick = (teacherId: string) => {
    setSelectedTeacher(teacherId);
  };

  const handleCloseProfile = () => {
    setSelectedTeacher(null);
  };

  // Find the selected teacher object
  const teacherProfile = selectedTeacher ? 
    teachers.find(teacher => teacher.id === selectedTeacher) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container py-6">
          <p>Loading teachers...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container py-6">
          <p className="text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">School Teachers</h1>
          <p className="text-muted-foreground">
            {school ? `${school.name}, ${school.district}` : 'Loading school information...'}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or EC number..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <TeacherFilters 
            subjects={subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        </div>

        {/* Teachers Table */}
        <TeachersTable 
          teachers={filteredTeachers}
          onTeacherClick={handleTeacherClick}
        />

        {/* Teacher Profile Drawer */}
        <Sheet open={!!selectedTeacher} onOpenChange={handleCloseProfile}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Teacher Profile</SheetTitle>
              <SheetDescription>
                View detailed information about this teacher.
              </SheetDescription>
            </SheetHeader>
            {teacherProfile && <TeacherProfile teacher={teacherProfile} />}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
};

export default HeadmasterTeachers;

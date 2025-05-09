
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/hooks/use-database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCard } from '@/components/DashboardCard';
import { 
  Users, 
  School as SchoolIcon, 
  FileText, 
  Database 
} from 'lucide-react';
import { 
  MOCK_PENDING_REQUESTS,
  MOCK_SCHOOLS, 
  MOCK_SUBJECTS, 
  MOCK_TEACHERS,
  MOCK_TRANSFER_REQUESTS
} from '@/mock/data';
import { TransferRequest, Teacher } from '@/types';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isConnected, isLoading: dbLoading, error: dbError } = useDatabase();
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);

  // Helper function to get school name by ID
  const getSchoolName = (schoolId: string): string => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  // Helper function to get teacher name by ID
  const getTeacherName = (teacherId: string): string => {
    const teacher = MOCK_TEACHERS.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  useEffect(() => {
    // In a real app, this would fetch data from Supabase
    setPendingRequests(MOCK_PENDING_REQUESTS);
    setTotalTeachers(MOCK_TEACHERS.length);
    setTotalSchools(MOCK_SCHOOLS.length);
    setTotalSubjects(MOCK_SUBJECTS.length);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        {dbLoading ? (
          <Card className="mt-4">
            <CardContent className="p-4">
              <p>Checking database connection...</p>
            </CardContent>
          </Card>
        ) : isConnected ? (
          <Card className="mt-4 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              <p className="text-green-600 dark:text-green-400">Database connected successfully</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-red-600 dark:text-red-400">Database connection error</p>
                {dbError && <p className="text-sm text-red-500 dark:text-red-300">{dbError}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Pending Requests"
          value={pendingRequests.length.toString()}
          description="Requests awaiting review"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          linkText="View all requests"
          linkHref="/admin/requests"
        />
        <DashboardCard 
          title="Teachers"
          value={totalTeachers.toString()}
          description="Registered teachers"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          linkText="Manage teachers"
          linkHref="/admin/teachers"
        />
        <DashboardCard 
          title="Schools"
          value={totalSchools.toString()}
          description="Registered schools"
          icon={<SchoolIcon className="h-4 w-4 text-muted-foreground" />}
          linkText="Manage schools"
          linkHref="/admin/schools"
        />
        <DashboardCard 
          title="Subjects"
          value={totalSubjects.toString()}
          description="Available subjects"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          linkText="Manage subjects"
          linkHref="/admin/subjects"
        />
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfer Requests</CardTitle>
            <CardDescription>
              Recent transfer requests requiring your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => {
                  const teacherName = getTeacherName(request.teacherId);
                  const fromSchool = getSchoolName(request.fromSchoolId);
                  const toSchool = request.toSchoolId ? getSchoolName(request.toSchoolId) : request.toDistrict || 'Unspecified';
                  
                  return (
                    <div key={request.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">{teacherName}</p>
                        <p className="text-sm text-muted-foreground">
                          {fromSchool} → {toSchool}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`status-badge status-${request.status}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending requests.</p>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Updated {new Date().toLocaleDateString()}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

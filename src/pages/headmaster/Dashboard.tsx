
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/hooks/use-database';
import { File, Users, School as SchoolIcon, ArrowRight } from 'lucide-react';
import { 
  MOCK_SCHOOLS, 
  MOCK_TRANSFER_REQUESTS,
  MOCK_TEACHERS 
} from '@/mock/data';
import { TransferRequest, School, Teacher } from '@/types';

const HeadmasterDashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useDatabase();
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [forwardedRequests, setForwardedRequests] = useState<TransferRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<TransferRequest[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [recentActivity, setRecentActivity] = useState<TransferRequest[]>([]);
  
  useEffect(() => {
    // Get the headmaster's school
    if (user?.schoolId) {
      const headSchool = MOCK_SCHOOLS.find(s => s.id === user.schoolId);
      setSchool(headSchool || null);
      
      if (headSchool) {
        // Get pending transfer requests for this school
        const pending = MOCK_TRANSFER_REQUESTS.filter(
          req => req.fromSchoolId === headSchool.id && 
                req.status === 'pending_head_approval'
        );
        setPendingRequests(pending);
        
        // Get forwarded requests
        const forwarded = MOCK_TRANSFER_REQUESTS.filter(
          req => req.fromSchoolId === headSchool.id && 
                req.status === 'forwarded_to_admin'
        );
        setForwardedRequests(forwarded);
        
        // Get rejected requests
        const rejected = MOCK_TRANSFER_REQUESTS.filter(
          req => req.fromSchoolId === headSchool.id && 
                req.status === 'rejected_by_headmaster'
        );
        setRejectedRequests(rejected);
        
        // Get teachers at this school
        const schoolTeachers = MOCK_TEACHERS.filter(
          t => t.schoolId === headSchool.id
        );
        setTeachers(schoolTeachers);
        
        // Get recent activity
        const recent = [...MOCK_TRANSFER_REQUESTS]
          .filter(req => req.fromSchoolId === headSchool.id)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setRecentActivity(recent);
      }
    }
  }, [user]);

  // Helper function to get teacher name
  const getTeacherName = (teacherId: string) => {
    const teacher = MOCK_TEACHERS.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  // Helper function to get school name
  const getSchoolName = (schoolId: string) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Headmaster {user.name}</h1>
          <p className="text-muted-foreground">
            {school ? `${school.name}, ${school.district}` : 'Loading school information...'}
          </p>
          {!isConnected && (
            <p className="text-amber-600 mt-2 text-sm">
              ⚠️ Database connection issue. Some features may be limited.
            </p>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending Requests Card */}
          <DashboardCard
            title="Pending Requests"
            icon={<File className="h-4 w-4 text-muted-foreground" />}
            value={pendingRequests.length.toString()}
            description="Teachers waiting for your approval"
            linkText="Review Requests"
            linkHref="/headmaster/requests"
          />
          
          {/* Approved & Forwarded Card */}
          <DashboardCard
            title="Approved & Forwarded"
            icon={<ArrowRight className="h-4 w-4 text-muted-foreground" />}
            value={forwardedRequests.length.toString()}
            description="Requests sent to Admin"
            linkText="View History"
            linkHref="/headmaster/history"
          />
          
          {/* Rejected Requests Card */}
          <DashboardCard
            title="Rejected Requests"
            icon={<File className="h-4 w-4 text-muted-foreground" />}
            value={rejectedRequests.length.toString()}
            description="Transfer requests rejected"
            linkText="View History"
            linkHref="/headmaster/history"
          />
          
          {/* Teachers Card */}
          <DashboardCard
            title="Teachers in My School"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            value={teachers.length.toString()}
            description={`Teachers at ${school?.name || 'your school'}`}
            linkText="View All"
            linkHref="/headmaster/teachers"
          />
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/headmaster/requests">View All Requests</Link>
            </Button>
          </div>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Date Updated</th>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((request) => {
                      const teacherName = getTeacherName(request.teacherId);
                      const destination = request.toSchoolId 
                        ? getSchoolName(request.toSchoolId)
                        : request.toDistrict || 'Unspecified';
                      
                      return (
                        <tr key={request.id} className="border-t">
                          <td className="px-4 py-3">{teacherName}</td>
                          <td className="px-4 py-3">
                            {new Date(request.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{destination}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/headmaster/requests/${request.id}`}>
                                Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No recent transfer requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Shortcuts / Action Links */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Button asChild size="lg" className="h-auto py-4">
            <Link to="/headmaster/requests">
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">Review Requests</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Process pending teacher transfer requests
                </span>
              </div>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-4">
            <Link to="/headmaster/history">
              <div className="flex flex-col items-start">
                <span className="text-base font-semibold">Action History</span>
                <span className="text-xs text-muted-foreground mt-1">
                  View past decisions on transfer requests
                </span>
              </div>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HeadmasterDashboard;

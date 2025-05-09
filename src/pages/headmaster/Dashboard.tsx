
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { File, Users, Bell, School, ArrowRight } from 'lucide-react';
import { 
  MOCK_SCHOOLS, 
  MOCK_SUBJECTS, 
  MOCK_TRANSFER_REQUESTS,
  MOCK_TEACHERS 
} from '@/mock/data';
import { TransferRequest, School, Teacher } from '@/types';

const HeadmasterDashboard = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  useEffect(() => {
    // Get the headmaster's school
    if (user?.schoolId) {
      const headSchool = MOCK_SCHOOLS.find(s => s.id === user.schoolId);
      setSchool(headSchool || null);
      
      if (headSchool) {
        // Get pending transfer requests for this school
        const requests = MOCK_TRANSFER_REQUESTS.filter(
          req => req.fromSchoolId === headSchool.id && 
                req.status === 'pending_head_approval'
        );
        setPendingRequests(requests);
        
        // Get teachers at this school
        const schoolTeachers = MOCK_TEACHERS.filter(
          t => t.schoolId === headSchool.id
        );
        setTeachers(schoolTeachers);
      }
    }
  }, [user]);

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
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pending Requests Card */}
          <DashboardCard
            title="Pending Transfer Requests"
            icon={<File className="h-4 w-4 text-muted-foreground" />}
          >
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">
                  Teachers waiting for your approval
                </p>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link to="/headmaster/requests">
                    <span>Review Requests</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">No pending transfer requests</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/headmaster/requests">
                    <span>View All Requests</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </DashboardCard>
          
          {/* Teachers Card */}
          <DashboardCard
            title="School Teachers"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-3">
              <p className="text-2xl font-bold">{teachers.length}</p>
              <p className="text-sm text-muted-foreground">
                Teachers currently at {school?.name}
              </p>
              <div className="space-y-1">
                {teachers.slice(0, 3).map(teacher => (
                  <div key={teacher.id} className="flex items-center text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                    <span>{teacher.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
          
          {/* School Info Card */}
          <DashboardCard
            title="School Information"
            icon={<School className="h-4 w-4 text-muted-foreground" />}
          >
            {school ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">School Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {school.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">District</p>
                  <p className="text-sm text-muted-foreground">
                    {school.district}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {school.address}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">School information unavailable</p>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Recent Transfer Requests */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transfer Requests</h2>
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
                    <th className="px-4 py-3 text-left">Submitted</th>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSFER_REQUESTS
                    .filter(req => req.fromSchoolId === school?.id)
                    .slice(0, 5)
                    .map((request) => {
                      const teacher = MOCK_TEACHERS.find(t => t.id === request.teacherId);
                      const destination = request.toSchoolId 
                        ? MOCK_SCHOOLS.find(s => s.id === request.toSchoolId)?.name 
                        : request.toDistrict || 'Unspecified';
                      
                      return (
                        <tr key={request.id} className="border-t">
                          <td className="px-4 py-3">{teacher?.name || 'Unknown'}</td>
                          <td className="px-4 py-3">
                            {new Date(request.submittedAt).toLocaleDateString()}
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
                    })}
                  {MOCK_TRANSFER_REQUESTS.filter(req => req.fromSchoolId === school?.id).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No transfer requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeadmasterDashboard;

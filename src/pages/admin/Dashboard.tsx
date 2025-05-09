
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  File, 
  Users, 
  School, 
  Activity, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { 
  MOCK_SCHOOLS, 
  MOCK_TEACHERS,
  MOCK_TRANSFER_REQUESTS
} from '@/mock/data';
import { TransferRequest } from '@/types';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  
  useEffect(() => {
    // Get all forwarded requests
    const forwarded = MOCK_TRANSFER_REQUESTS.filter(
      req => req.status === 'forwarded_to_admin'
    );
    setPendingRequests(forwarded);
  }, []);

  if (!user) return null;
  
  // Calculate some statistics
  const totalTeachers = MOCK_TEACHERS.length;
  const totalSchools = MOCK_SCHOOLS.length;
  const approvedRequests = MOCK_TRANSFER_REQUESTS.filter(req => req.status === 'approved_by_admin').length;
  const rejectedRequests = MOCK_TRANSFER_REQUESTS.filter(req => 
    req.status === 'rejected_by_admin' || req.status === 'rejected_by_headmaster'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of teacher transfers and school management
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards */}
          <DashboardCard
            title="Pending Approvals"
            icon={<File className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Transfer requests awaiting your review
            </p>
          </DashboardCard>
          
          <DashboardCard
            title="Total Teachers"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Teachers in the system
            </p>
          </DashboardCard>
          
          <DashboardCard
            title="Total Schools"
            icon={<School className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              Schools in all districts
            </p>
          </DashboardCard>
          
          <DashboardCard
            title="Transfer Approval Rate"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">
              {approvedRequests + rejectedRequests > 0 
                ? Math.round((approvedRequests / (approvedRequests + rejectedRequests)) * 100) + '%'
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedRequests} approved, {rejectedRequests} rejected
            </p>
          </DashboardCard>
        </div>
        
        {/* Recent Actions Summary */}
        <div className="grid gap-6 mt-8 md:grid-cols-2">
          {/* Pending Requests */}
          <DashboardCard title="Pending Approval Requests">
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                <div>
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map(request => {
                      const teacher = MOCK_TEACHERS.find(t => t.id === request.teacherId);
                      const fromSchool = MOCK_SCHOOLS.find(s => s.id === request.fromSchoolId);
                      const toSchool = request.toSchoolId 
                        ? MOCK_SCHOOLS.find(s => s.id === request.toSchoolId)?.name
                        : request.toDistrict;
                      
                      return (
                        <div key={request.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{teacher?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              From: {fromSchool?.name} → To: {toSchool}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/admin/requests/${request.id}`}>Review</Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {pendingRequests.length > 3 && (
                    <Button asChild variant="outline" size="sm" className="w-full mt-3">
                      <Link to="/admin/requests">
                        <span>View All Pending Requests</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Check className="h-12 w-12 text-muted mb-2" />
                  <p className="text-muted-foreground">No pending requests</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/admin/requests">View All Requests</Link>
                  </Button>
                </div>
              )}
            </div>
          </DashboardCard>
          
          {/* Recent Decisions */}
          <DashboardCard title="Recent Decisions">
            <div className="space-y-4">
              {MOCK_TRANSFER_REQUESTS
                .filter(req => 
                  req.status === 'approved_by_admin' || 
                  req.status === 'rejected_by_admin'
                )
                .slice(0, 4)
                .map(request => {
                  const teacher = MOCK_TEACHERS.find(t => t.id === request.teacherId);
                  const isApproved = request.status === 'approved_by_admin';
                  
                  return (
                    <div key={request.id} className="flex items-start space-x-3 p-2 border rounded">
                      <div className={`p-1.5 rounded-full ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isApproved ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{teacher?.name}</p>
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-muted">
                            {isApproved ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.adminComment || (isApproved ? 'Transfer approved' : 'Transfer rejected')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.adminActionAt ? new Date(request.adminActionAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/admin/requests">
                  <span>View All Decisions</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </DashboardCard>
        </div>
        
        {/* Quick Access Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            to="/admin/teachers" 
            className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <Users className="h-8 w-8 mb-2" />
            <p className="font-medium">Manage Teachers</p>
          </Link>
          
          <Link 
            to="/admin/schools" 
            className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <School className="h-8 w-8 mb-2" />
            <p className="font-medium">Manage Schools</p>
          </Link>
          
          <Link 
            to="/admin/subjects" 
            className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <File className="h-8 w-8 mb-2" />
            <p className="font-medium">Manage Subjects</p>
          </Link>
          
          <Link 
            to="/admin/requests" 
            className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent transition-colors"
          >
            <Activity className="h-8 w-8 mb-2" />
            <p className="font-medium">All Transfer Requests</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

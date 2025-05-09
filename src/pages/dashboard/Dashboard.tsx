
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { File, FileCheck, Bell, ArrowRight } from 'lucide-react';
import { MOCK_SCHOOLS, MOCK_SUBJECTS, MOCK_TRANSFER_REQUESTS } from '@/mock/data';
import { TransferRequest, School, Subject } from '@/types';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<{ title: string, message: string, date: string, type: string }[]>([]);
  
  useEffect(() => {
    // Get the teacher's active transfer request
    if (user) {
      const request = MOCK_TRANSFER_REQUESTS.find(
        req => req.teacherId === user.id && 
        ['pending_head_approval', 'forwarded_to_admin'].includes(req.status)
      );
      
      setActiveRequest(request || null);
      
      // Get the teacher's school
      if (user.schoolId) {
        const teacherSchool = MOCK_SCHOOLS.find(s => s.id === user.schoolId);
        setSchool(teacherSchool || null);
      }
      
      // Get the teacher's subjects if we had subjectIds in the user object
      if ((user as any).subjectIds) {
        const teacherSubjects = MOCK_SUBJECTS.filter(s => 
          (user as any).subjectIds.includes(s.id)
        );
        setSubjects(teacherSubjects.length > 0 ? teacherSubjects : MOCK_SUBJECTS.slice(0, 3));
      } else {
        setSubjects(MOCK_SUBJECTS.slice(0, 3));
      }

      // Mock recent notifications
      setRecentNotifications([
        {
          title: "Transfer Request Update",
          message: "Your transfer request has been forwarded to the admin.",
          date: "2 days ago",
          type: "info"
        },
        {
          title: "Profile Updated",
          message: "Your profile information has been updated.",
          date: "1 week ago",
          type: "success"
        }
      ]);
    }
  }, [user]);

  if (!user) return null;

  // Helper function to get school name by ID
  const getSchoolName = (schoolId: string) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school ? school.name : "Unknown School";
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">
            {school ? `${school.name}, ${school.district}` : 'Loading school information...'}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Transfer Request Card */}
          <DashboardCard
            title="Transfer Request Status"
            icon={<File className="h-4 w-4 text-muted-foreground" />}
          >
            {activeRequest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={activeRequest.status} />
                  <span className="text-xs text-muted-foreground">
                    Submitted: {formatDate(activeRequest.submittedAt)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm">
                  <strong>Reason:</strong> {activeRequest.reason}
                </p>
                <p className="text-sm">
                  <strong>To:</strong> {
                    activeRequest.toSchoolId 
                      ? getSchoolName(activeRequest.toSchoolId)
                      : activeRequest.toDistrict || 'Unspecified'
                  }
                </p>
                {activeRequest.headmasterComment && (
                  <p className="text-sm">
                    <strong>Headmaster:</strong> {activeRequest.headmasterComment}
                  </p>
                )}
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/dashboard/transfer">
                      <span>View Details</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">You don't have any active transfer requests.</p>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link to="/dashboard/transfer">Submit Transfer Request</Link>
                </Button>
              </div>
            )}
          </DashboardCard>
          
          {/* Teaching Information Card */}
          <DashboardCard
            title="Teaching Information"
            icon={<FileCheck className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">EC Number</p>
                <p className="text-sm text-muted-foreground">{(user as any).ecNumber || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Teaching Level</p>
                <p className="text-sm text-muted-foreground">
                  {(user as any).level || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subjects.map(subject => (
                    <span key={subject.id} className="text-xs bg-secondary px-2 py-1 rounded">
                      {subject.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
          
          {/* Notifications Card */}
          <DashboardCard
            title="Recent Notifications"
            icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              {recentNotifications.map((notification, index) => (
                <div key={index} className={`border-l-4 border-${notification.type} pl-3 py-1`}>
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/notifications">
                  <span>View All Notifications</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Past Requests Preview */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Past Transfer Requests</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/history">View All History</Link>
            </Button>
          </div>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSFER_REQUESTS
                    .filter(req => req.teacherId === user.id && 
                           !['pending_head_approval', 'forwarded_to_admin'].includes(req.status))
                    .slice(0, 3)
                    .map((request) => {
                      const destinationSchool = request.toSchoolId 
                        ? getSchoolName(request.toSchoolId)
                        : request.toDistrict || 'Unspecified';
                      
                      return (
                        <tr key={request.id} className="border-t">
                          <td className="px-4 py-3">
                            {formatDate(request.submittedAt)}
                          </td>
                          <td className="px-4 py-3">{destinationSchool}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={request.status} />
                          </td>
                        </tr>
                      );
                    })}
                  {MOCK_TRANSFER_REQUESTS.filter(req => req.teacherId === user.id && 
                    !['pending_head_approval', 'forwarded_to_admin'].includes(req.status)).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                        No past transfer requests found
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

export default TeacherDashboard;

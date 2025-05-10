
import React from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/hooks/use-database';

// Import custom hooks and components
import { useHeadmasterDashboard } from '@/hooks/use-headmaster-dashboard';
import { StatCards } from '@/components/headmaster/StatCards';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';

const HeadmasterDashboard = () => {
  const {
    user,
    pendingRequests,
    forwardedRequests,
    rejectedRequests,
    school,
    teachers,
    recentActivity,
    isLoading,
    getTeacherName,
    formatDate,
    error
  } = useHeadmasterDashboard();
  
  const { isConnected } = useDatabase();

  // Format activity data for the RecentActivityTable component
  const formattedActivity = recentActivity.map((request) => {
    const teacherName = request.teachers ? request.teachers.name : getTeacherName(request.teacher_id);
    return {
      id: request.id,
      teacherName,
      teacherId: request.teacher_id,
      date: formatDate(request.updated_at),
      destination: request.to_school_id ? request.to_school_id : request.to_district || 'Unspecified',
      status: request.status
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container py-6">
          <p>Loading dashboard...</p>
        </main>
      </div>
    );
  }

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
          {error && (
            <p className="text-red-600 mt-2 text-sm">
              ⚠️ Error: {error}
            </p>
          )}
        </div>
        
        <StatCards 
          pendingRequestsCount={pendingRequests.length}
          forwardedRequestsCount={forwardedRequests.length}
          rejectedRequestsCount={rejectedRequests.length}
          teachersCount={teachers.length}
        />

        {/* Recent Activity Feed */}
        <RecentActivityTable 
          activities={formattedActivity}
          basePath="/headmaster"
          isTeacherView={false}
          linkText="View All Requests"
          linkPath="/requests"
        />

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

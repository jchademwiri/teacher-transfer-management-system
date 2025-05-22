import React, { useState } from 'react';
// import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { File } from 'lucide-react';

// Import custom hooks and components
import { useTeacherDashboard } from '@/hooks/use-teacher-dashboard';
import { RequestSummaryCard } from '@/components/dashboard/RequestSummaryCard';
import { TeachingInfoCard } from '@/components/dashboard/TeachingInfoCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { useDatabase } from '@/hooks/use-database';
import { TransferRequest, User } from '@/types';

function mapTransferRequest(row) {
  return {
    ...row,
    updatedAt: row.updated_at,
    toSchoolId: row.to_school_id,
    toDistrict: row.to_district,
    // ...map other fields as needed
  };
}

const TeacherDashboard = () => {
  const { 
    user,
    activeRequest,
    school,
    subjects,
    recentNotifications,
    pastRequests,
    isLoading,
    formatDate,
    getSchoolName,
  } = useTeacherDashboard();
  
  const { isConnected } = useDatabase();

  const [pastRequestsState, setPastRequestsState] = useState<TransferRequest[]>([]);

  // Combine activeRequest (if present) with pastRequests, avoiding duplicates
  let allRequests: TransferRequest[] = pastRequests;
  if (activeRequest && !pastRequests.some(r => r.id === activeRequest.id)) {
    allRequests = [activeRequest, ...pastRequests];
  }

  // Format all requests for the activity table, including status updates
  const formattedPastRequests = allRequests.map((request: TransferRequest) => {
    // Date: use updatedAt
    const date = formatDate(request.updatedAt);
    // Destination logic
    let destination = 'Unspecified';
    if (request.toSchoolId) {
      const schoolName = getSchoolName(request.toSchoolId);
      destination = schoolName;
      if (request.toDistrict) {
        destination += `, ${request.toDistrict}`;
      }
    } else if (request.toDistrict) {
      destination = `Any School, ${request.toDistrict}`;
    }
    return {
      id: request.id,
      date,
      destination,
      status: request.status,
      headmasterStatus: request.headmasterComment || '',
      adminStatus: request.adminComment || '',
      headmasterActionAt: request.headmasterActionAt,
      adminActionAt: request.adminActionAt,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* <MainNavigation /> */}
        <main className="container py-6">
          <p>Loading dashboard...</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">
            {school ? `${school.name}, ${school.district}` : 'Loading school information...'}
          </p>
          {!isConnected && (
            <p className="text-amber-600 mt-2 text-sm">
              ⚠️ Database connection issue. Some features may be limited.
            </p>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Transfer Request Card */}
          <RequestSummaryCard 
            activeRequest={activeRequest}
            formatDate={formatDate}
            getSchoolName={getSchoolName}
            userRole="teacher"
          />
          
          {/* Teaching Information Card */}
          <TeachingInfoCard 
            ecNumber={user.ecNumber}
            level={(user as any).level}
            subjects={subjects}
          />
          
          {/* Notifications Card */}
          <NotificationsCard notifications={recentNotifications} />
        </div>

        {/* Past Requests Preview */}
        <RecentActivityTable 
          activities={formattedPastRequests}
          basePath="/dashboard"
          isTeacherView={true}
          linkText="View All History"
          linkPath="/history"
          title="Transfer Request Log"
        />
      </main>
    </div>
  );
};

export default TeacherDashboard;

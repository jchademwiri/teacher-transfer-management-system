import React from 'react';
// import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/hooks/use-database';

// Import hooks and components
import { useHistoryPage, headmasterStatusOptions } from '@/hooks/use-history-page';
import { FilterControls } from '@/components/history/FilterControls';
import { RequestHistoryCard } from '@/components/history/RequestHistoryCard';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';

const HeadmasterHistory = () => {
  const {
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    showUnresolvedOnly,
    setShowUnresolvedOnly,
    paginatedRequests,
    isLoading,
    formatDate,
    error,
    schools
  } = useHistoryPage('headmaster');
  const { isConnected } = useDatabase();
  
  // Format activity data for the RecentActivityTable component
  const formattedActivity = paginatedRequests.map((request) => {
    // Teacher name logic (if you have a teachers array, use it; otherwise fallback)
    const teacherName = request.teachers ? request.teachers.name : 'Unknown Teacher';
    let destination = 'Unspecified';
    if (request.to_school_id) {
      const schoolObj = schools.find(s => s.id === request.to_school_id);
      if (schoolObj) {
        destination = `${schoolObj.name}, ${schoolObj.district}`;
      } else {
        destination = request.to_school_id; // fallback to id if not found
      }
    } else if (request.to_district) {
      destination = `Any School, ${request.to_district}`;
    }
    return {
      id: request.id,
      teacherName,
      teacherId: request.teacher_id,
      date: formatDate(request.updated_at),
      destination,
      status: request.status
    };
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* <MainNavigation /> */}
        <div className="container mx-auto py-8 px-4">
          <p>Loading history...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Request History</h1>
          {!isConnected && (
            <p className="text-amber-600 text-sm">
              ⚠️ Database connection issue. Some features may be limited.
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm">
              ⚠️ Error: {error}
            </p>
          )}
        </div>
        
        <FilterControls
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showUnresolvedOnly={showUnresolvedOnly}
          setShowUnresolvedOnly={setShowUnresolvedOnly}
          statusOptions={headmasterStatusOptions}
        />
        
        {paginatedRequests.length > 0 ? (
          <RecentActivityTable
            activities={formattedActivity}
            basePath="/headmaster"
            isTeacherView={false}
            linkText="View All Requests"
            linkPath="/history"
            title="All Transfer Requests"
          />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg text-center">No request history found.</p>
              <p className="text-muted-foreground text-center mt-1">
                Your past decisions on transfer requests will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeadmasterHistory;

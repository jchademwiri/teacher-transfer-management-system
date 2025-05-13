
import React from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/hooks/use-database';

// Import hooks and components
import { useHistoryPage, headmasterStatusOptions } from '@/hooks/use-history-page';
import { FilterControls } from '@/components/history/FilterControls';
import { RequestHistoryCard } from '@/components/history/RequestHistoryCard';

const HeadmasterHistory = () => {
  const { isConnected } = useDatabase();
  
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
  } = useHistoryPage('headmaster');
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto py-8 px-4">
          <p>Loading history...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
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
          <div className="grid gap-6">
            {paginatedRequests.map((request) => {
              const teacherName = request.teachers ? request.teachers.name : 'Unknown Teacher';
              const currentSchool = request.from_school ? request.from_school.name : 'Current School';
              const targetSchool = request.to_school_id && request.schools ? 
                request.schools.name : request.to_district || 'Unspecified';
              
              return (
                <RequestHistoryCard
                  key={request.id}
                  id={request.id}
                  teacherName={teacherName}
                  subject={request.subject || 'N/A'}
                  currentSchool={currentSchool}
                  targetSchool={targetSchool}
                  status={request.status}
                  submittedAt={request.submitted_at}
                  actionDate={request.headmaster_action_at || request.updated_at}
                  headmasterComment={request.headmaster_comment}
                  adminStatus={request.adminStatus}
                  adminActionDate={request.admin_action_at}
                  adminComment={request.admin_comment}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
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


import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { DashboardCard } from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { RequestStatus } from '@/types';

// Mock data for teacher transfer requests
const mockRequests = [
  {
    id: '101',
    teacherName: 'John Smith',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Morning Star Academy',
    subject: 'Mathematics',
    reason: 'Moving closer to family',
    status: 'submitted' as RequestStatus,
    submittedAt: '2024-05-03T10:30:00Z',
  },
  {
    id: '102',
    teacherName: 'Emily Johnson',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Riverdale Secondary',
    subject: 'English',
    reason: 'Professional development opportunity',
    status: 'submitted' as RequestStatus,
    submittedAt: '2024-05-01T14:20:00Z',
  },
  {
    id: '103',
    teacherName: 'Michael Brown',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Lakeview Elementary',
    subject: 'Science',
    reason: 'Better facilities for science experiments',
    status: 'submitted' as RequestStatus,
    submittedAt: '2024-04-28T09:15:00Z',
  },
];

const HeadmasterRequests = () => {
  const [requests] = useState(mockRequests);
  const navigate = useNavigate();
  
  const viewRequest = (id: string) => {
    navigate(`/headmaster/requests/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Teacher Transfer Requests</h1>
        
        <DashboardCard 
          title="Pending Requests" 
          className="mb-6"
        >
          <p className="text-2xl font-bold">{requests.length}</p>
          <p className="text-sm text-muted-foreground">Awaiting your review</p>
        </DashboardCard>
        
        {requests.length > 0 ? (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {request.teacherName} - {request.subject}
                    </CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted on {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Current School</p>
                        <p className="text-muted-foreground">{request.currentSchool}</p>
                      </div>
                      <div>
                        <p className="font-medium">Target School</p>
                        <p className="text-muted-foreground">{request.targetSchool}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Reason for Transfer</p>
                      <p className="text-muted-foreground">{request.reason}</p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={() => viewRequest(request.id)}
                      >
                        Review Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg text-center">No pending transfer requests.</p>
              <p className="text-muted-foreground text-center mt-1">
                When teachers submit transfer requests, they will appear here for your review.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeadmasterRequests;


import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { RequestStatus } from '@/types';

// Mock data for admin transfer requests
const mockRequests = [
  {
    id: '301',
    teacherName: 'Alice Johnson',
    teacherEC: 'EC345678',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Eastside Elementary',
    district: 'Eastern District',
    subject: 'Science',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-05-01T10:30:00Z',
    forwardedAt: '2024-05-03T14:45:00Z',
    headmasterName: 'Dr. Wilson',
    headmasterComment: 'Strong recommendation for approval',
  },
  {
    id: '302',
    teacherName: 'David Brown',
    teacherEC: 'EC456789',
    currentSchool: 'Westside Secondary',
    targetSchool: 'Central High School',
    district: 'Central District',
    subject: 'Mathematics',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-04-28T09:15:00Z',
    forwardedAt: '2024-05-02T11:30:00Z',
    headmasterName: 'Mrs. Thompson',
    headmasterComment: 'Teacher has specialized skills needed at target school',
  },
  {
    id: '303',
    teacherName: 'Linda Martinez',
    teacherEC: 'EC567890',
    currentSchool: 'Northside Primary',
    targetSchool: 'Southside Elementary',
    district: 'Southern District',
    subject: 'English',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-04-25T14:20:00Z',
    forwardedAt: '2024-05-01T09:45:00Z',
    headmasterName: 'Mr. Roberts',
    headmasterComment: 'Transfer would benefit teacher professional development',
  },
];

const AdminRequests = () => {
  const [requests] = useState(mockRequests);
  const navigate = useNavigate();
  
  const viewRequest = (id: string) => {
    navigate(`/admin/requests/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Transfer Requests</h1>
        
        {requests.length > 0 ? (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {request.teacherName} ({request.teacherEC})
                    </CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Forwarded by {request.headmasterName} on {new Date(request.forwardedAt).toLocaleDateString()}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">District</p>
                        <p className="text-muted-foreground">{request.district}</p>
                      </div>
                      <div>
                        <p className="font-medium">Subject</p>
                        <p className="text-muted-foreground">{request.subject}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Headmaster Comment</p>
                      <p className="text-muted-foreground">{request.headmasterComment}</p>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button onClick={() => viewRequest(request.id)}>
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
                When headmasters approve and forward transfer requests, they will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;

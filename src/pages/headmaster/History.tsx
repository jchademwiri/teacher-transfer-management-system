
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestStatus } from '@/types';

// Mock data for headmaster request history
const mockRequestHistory = [
  {
    id: '201',
    teacherName: 'Robert Davis',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Westside Elementary',
    subject: 'Physical Education',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-04-15T10:30:00Z',
    actionDate: '2024-04-18T14:45:00Z',
    headmasterComment: 'Approved due to excellent record and staffing situation at target school',
  },
  {
    id: '202',
    teacherName: 'Sarah Wilson',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Northside Secondary',
    subject: 'History',
    status: 'rejected_by_headmaster' as RequestStatus,
    submittedAt: '2024-04-10T09:20:00Z',
    actionDate: '2024-04-12T11:10:00Z',
    headmasterComment: 'Rejected due to critical staff shortage in History department',
  },
  {
    id: '203',
    teacherName: 'Thomas Jones',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Eastside High',
    subject: 'Chemistry',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-03-25T08:15:00Z',
    actionDate: '2024-03-28T10:30:00Z',
    headmasterComment: 'Skilled teacher with specialized qualifications',
    adminStatus: 'approved_by_admin' as RequestStatus,
    adminActionDate: '2024-04-05T14:20:00Z',
  },
  {
    id: '204',
    teacherName: 'Jennifer Miller',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Central Academy',
    subject: 'Art',
    status: 'forwarded_to_admin' as RequestStatus,
    submittedAt: '2024-03-12T13:45:00Z',
    actionDate: '2024-03-15T09:50:00Z',
    headmasterComment: 'Strong recommendation for transfer',
    adminStatus: 'rejected_by_admin' as RequestStatus,
    adminActionDate: '2024-03-22T16:10:00Z',
    adminComment: 'No vacancy in Art department at target school',
  },
];

const HeadmasterHistory = () => {
  const [history] = useState(mockRequestHistory);

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Request History</h1>
        
        {history.length > 0 ? (
          <div className="grid gap-6">
            {history.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {request.teacherName} - {request.subject}
                    </CardTitle>
                    <StatusBadge status={request.adminStatus || request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted: {new Date(request.submittedAt).toLocaleDateString()} | 
                    Your action: {new Date(request.actionDate).toLocaleDateString()}
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
                      <p className="font-medium">Your Comment</p>
                      <p className="text-muted-foreground">{request.headmasterComment}</p>
                    </div>
                    
                    {request.adminStatus && (
                      <div className="border-t pt-3 mt-2">
                        <p className="font-medium">Admin Decision</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.adminActionDate!).toLocaleDateString()}
                        </p>
                        {request.adminComment && (
                          <p className="text-muted-foreground mt-1">{request.adminComment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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

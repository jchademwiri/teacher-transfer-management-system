
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestStatus } from '@/types';

// Mock data for transfer request history
const mockTransferHistory = [
  {
    id: '1',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Morning Star Academy',
    reason: 'Moving closer to family',
    status: 'approved_by_admin' as RequestStatus,
    submittedAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-25T14:45:00Z',
  },
  {
    id: '2',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Lake View Secondary',
    reason: 'Better facilities for specialized teaching',
    status: 'rejected_by_headmaster' as RequestStatus,
    submittedAt: '2024-02-10T08:20:00Z',
    updatedAt: '2024-02-15T11:10:00Z',
    rejectionReason: 'Critical staff shortage in your department',
  },
  {
    id: '3',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Hillside Elementary',
    reason: 'Specialized curriculum for mathematics',
    status: 'rejected_by_admin' as RequestStatus,
    submittedAt: '2023-11-05T09:15:00Z',
    updatedAt: '2023-11-20T16:30:00Z',
    rejectionReason: 'No matching position available at the target school',
  },
];

const TeacherHistory = () => {
  const [history] = useState(mockTransferHistory);

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Transfer Request History</h1>
        
        {history.length > 0 ? (
          <div className="grid gap-6">
            {history.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Transfer to {request.targetSchool}
                    </CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted on {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <p className="font-medium">Current School</p>
                      <p className="text-muted-foreground">{request.currentSchool}</p>
                    </div>
                    <div>
                      <p className="font-medium">Reason for Transfer</p>
                      <p className="text-muted-foreground">{request.reason}</p>
                    </div>
                    {request.rejectionReason && (
                      <div className="border-t pt-3">
                        <p className="font-medium text-destructive">Rejection Reason</p>
                        <p className="text-muted-foreground">{request.rejectionReason}</p>
                      </div>
                    )}
                    <div className="border-t pt-3 text-sm text-muted-foreground">
                      Last updated: {new Date(request.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg text-center">You have no transfer request history yet.</p>
              <p className="text-muted-foreground text-center mt-1">
                When you submit transfer requests, they will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherHistory;

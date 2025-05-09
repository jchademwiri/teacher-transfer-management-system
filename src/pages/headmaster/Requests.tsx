
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { DashboardCard } from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { RequestStatus } from '@/types';
import { useDatabase } from '@/hooks/use-database';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data for teacher transfer requests
const mockRequests = [
  {
    id: '101',
    teacherName: 'John Smith',
    teacherEC: 'EC123456',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Morning Star Academy',
    subject: 'Mathematics',
    reason: 'Moving closer to family',
    status: 'pending_head_approval' as RequestStatus,
    submittedAt: '2024-05-03T10:30:00Z',
  },
  {
    id: '102',
    teacherName: 'Emily Johnson',
    teacherEC: 'EC789012',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Riverdale Secondary',
    subject: 'English',
    reason: 'Professional development opportunity',
    status: 'pending_head_approval' as RequestStatus,
    submittedAt: '2024-05-01T14:20:00Z',
  },
  {
    id: '103',
    teacherName: 'Michael Brown',
    teacherEC: 'EC345678',
    currentSchool: 'Sunset Primary School',
    targetSchool: 'Lakeview Elementary',
    subject: 'Science',
    reason: 'Better facilities for science experiments',
    status: 'pending_head_approval' as RequestStatus,
    submittedAt: '2024-04-28T09:15:00Z',
  },
];

const HeadmasterRequests = () => {
  const [requests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isConnected } = useDatabase();
  
  const viewRequest = (id: string) => {
    navigate(`/headmaster/requests/${id}`);
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter(request => 
    request.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.teacherEC.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teacher Transfer Requests</h1>
          {!isConnected && (
            <p className="text-amber-600 text-sm">
              ⚠️ Database connection issue. Some features may be limited.
            </p>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <DashboardCard 
            title="Pending Requests" 
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            value={requests.length.toString()}
            description="Awaiting your review"
          />
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by teacher name or EC number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filteredRequests.length > 0 ? (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {request.teacherName} - {request.subject}
                    </CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>EC: {request.teacherEC}</span>
                    <span>•</span>
                    <span>Submitted on {new Date(request.submittedAt).toLocaleDateString()}</span>
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
              {searchQuery ? (
                <>
                  <p className="text-lg text-center">No matching transfer requests found.</p>
                  <p className="text-muted-foreground text-center mt-1">
                    Try adjusting your search criteria.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg text-center">No pending transfer requests.</p>
                  <p className="text-muted-foreground text-center mt-1">
                    When teachers submit transfer requests, they will appear here for your review.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeadmasterRequests;

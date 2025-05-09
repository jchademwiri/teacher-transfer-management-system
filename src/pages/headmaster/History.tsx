
import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestStatus } from '@/types';
import { useDatabase } from '@/hooks/use-database';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  const { isConnected } = useDatabase();
  
  // Filter and sort the history
  let filteredHistory = [...history];
  
  // Apply action filter
  if (actionFilter !== 'all') {
    filteredHistory = filteredHistory.filter(request => {
      if (actionFilter === 'approved') {
        return request.status === 'forwarded_to_admin';
      } else if (actionFilter === 'rejected') {
        return request.status === 'rejected_by_headmaster';
      }
      return true;
    });
  }
  
  // Apply unresolved filter (if applicable)
  if (showUnresolvedOnly) {
    filteredHistory = filteredHistory.filter(request => 
      request.status === 'forwarded_to_admin' && !request.adminStatus
    );
  }
  
  // Apply sorting
  filteredHistory.sort((a, b) => {
    const dateA = new Date(a.actionDate).getTime();
    const dateB = new Date(b.actionDate).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

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
        </div>
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">Filter by action:</span>
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="approved">Approved & Forwarded</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Sort by:</span>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant={showUnresolvedOnly ? "default" : "outline"}
              onClick={() => setShowUnresolvedOnly(!showUnresolvedOnly)}
            >
              {showUnresolvedOnly ? "Showing Unresolved Only" : "Show All Requests"}
            </Button>
          </div>
        </div>
        
        {filteredHistory.length > 0 ? (
          <div className="grid gap-6">
            {filteredHistory.map((request) => (
              <Card key={request.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {request.teacherName} - {request.subject}
                    </CardTitle>
                    <StatusBadge status={request.adminStatus || request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Request Submitted: {new Date(request.submittedAt).toLocaleDateString()} | 
                    Your Action: {new Date(request.actionDate).toLocaleDateString()}
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
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={request.adminStatus} />
                          <span className="text-sm text-muted-foreground">
                            on {new Date(request.adminActionDate!).toLocaleDateString()}
                          </span>
                        </div>
                        {request.adminComment && (
                          <p className="text-muted-foreground mt-2">{request.adminComment}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="outline"
                        asChild
                      >
                        <Link to={`/headmaster/requests/${request.id}`}>
                          View Details
                        </Link>
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

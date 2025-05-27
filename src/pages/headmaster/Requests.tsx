import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDatabase } from '@/hooks/use-database';
import { DashboardCard } from '@/components/DashboardCard';
import { StatusBadge } from '@/components/StatusBadge';
import type { TransferRequest, School, User } from '@/types';
import { mapTransferRequest, mapUser, mapSchool } from '@/lib/mappers';

const HeadmasterRequests = () => {
  const [requests, setRequests] = useState<(TransferRequest & { teacher: User })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useDatabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  
  useEffect(() => {
    if (!user) return;

    async function fetchRequests() {
      try {
        // Get headmaster's school
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('headmaster_id', user.id)
          .single();
        
        if (schoolError) throw schoolError;

        // Get all schools for mapping
        const { data: allSchools } = await supabase
          .from('schools')
          .select('*');
        
        setSchools(allSchools ? allSchools.map(mapSchool) : []);

        // Get transfer requests for this school
        const { data: requestsData, error: requestsError } = await supabase
          .from('transfer_requests')
          .select('*, users:teacher_id(*)')
          .eq('from_school_id', schoolData.id)
          .eq('status', 'pending_head_approval')
          .order('submitted_at', { ascending: false });

        if (requestsError) throw requestsError;

        // Map the data
        const mappedRequests = requestsData.map(request => ({
          ...mapTransferRequest(request),
          teacher: mapUser(request.users)
        }));

        setRequests(mappedRequests);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, [user]);

  const viewRequest = (id: string) => {
    navigate(`/headmaster/requests/${id}`);
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter(request => 
    request.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.teacher.ecNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-8 px-4">
          <p>Loading requests...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teacher Transfer Requests</h1>
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
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <DashboardCard 
            title="Pending Requests" 
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
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
            {filteredRequests.map((request) => {
              const targetSchool = request.toSchoolId 
                ? schools.find(s => s.id === request.toSchoolId)
                : null;

              return (
                <Card key={request.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {request.teacher.name}
                      </CardTitle>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>EC: {request.teacher.ecNumber}</span>
                      <span>•</span>
                      <span>Submitted on {new Date(request.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Requested Transfer To:</p>
                          <p className="font-medium">
                            {request.toSchoolId 
                              ? `${targetSchool?.name}, ${targetSchool?.district}`
                              : `Any School, ${request.toDistrict}`
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Transfer Reason:</p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button onClick={() => viewRequest(request.id)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

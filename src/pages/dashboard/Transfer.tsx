
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MOCK_SCHOOLS, MOCK_TRANSFER_REQUESTS } from '@/mock/data';
import { TransferRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';

const TransferPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [transferType, setTransferType] = useState<'school' | 'district'>('school');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  useEffect(() => {
    // Get the teacher's active transfer request
    if (user) {
      const request = MOCK_TRANSFER_REQUESTS.find(
        req => req.teacherId === user.id && 
        ['submitted', 'pending_head_approval', 'forwarded_to_admin'].includes(req.status)
      );
      
      setActiveRequest(request || null);
    }
  }, [user]);

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate the form
    if (transferType === 'school' && !selectedSchoolId) {
      toast({
        title: "Missing information",
        description: "Please select a destination school.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (transferType === 'district' && !selectedDistrict) {
      toast({
        title: "Missing information",
        description: "Please select a destination district.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for your transfer request.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // In a real app, this would make an API call
    // For now, let's simulate a successful submission
    setTimeout(() => {
      // Create a new mock request
      const newRequest: TransferRequest = {
        id: `new-${Date.now()}`,
        teacherId: user?.id || '',
        fromSchoolId: user?.schoolId || '',
        ...(transferType === 'school' ? { toSchoolId: selectedSchoolId } : { toDistrict: selectedDistrict }),
        reason: reason,
        status: 'pending_head_approval',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setActiveRequest(newRequest);
      
      toast({
        title: "Transfer request submitted",
        description: "Your transfer request has been submitted and is pending review by your headmaster.",
      });
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleWithdrawRequest = () => {
    if (!activeRequest) return;
    
    setIsSubmitting(true);
    
    // In a real app, this would make an API call
    // For now, let's simulate a successful withdrawal
    setTimeout(() => {
      toast({
        title: "Request withdrawn",
        description: "Your transfer request has been withdrawn successfully.",
      });
      
      setActiveRequest(null);
      setIsSubmitting(false);
    }, 1500);
  };

  if (!user) return null;

  // Get unique districts for the dropdown
  const uniqueDistricts = Array.from(new Set(MOCK_SCHOOLS.map(school => school.district)));
  
  // Filter out the current school from the destination options
  const availableSchools = MOCK_SCHOOLS.filter(school => school.id !== user.schoolId);

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Transfer Request</h1>
          <p className="text-muted-foreground">Submit or view your active transfer request</p>
        </div>
        
        {activeRequest ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Active Transfer Request</CardTitle>
                  <CardDescription>
                    Submitted on {new Date(activeRequest.submittedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <StatusBadge status={activeRequest.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">From School</h3>
                  <p className="text-sm text-muted-foreground">
                    {MOCK_SCHOOLS.find(s => s.id === activeRequest.fromSchoolId)?.name || 'Unknown School'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">To</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeRequest.toSchoolId 
                      ? MOCK_SCHOOLS.find(s => s.id === activeRequest.toSchoolId)?.name || 'Unknown School'
                      : activeRequest.toDistrict || 'Unspecified'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-1">Reason for Transfer</h3>
                <p className="text-sm text-muted-foreground">{activeRequest.reason}</p>
              </div>
              
              {activeRequest.headmasterComment && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Headmaster Comment</h3>
                    <p className="text-sm text-muted-foreground">{activeRequest.headmasterComment}</p>
                  </div>
                </>
              )}
              
              {activeRequest.adminComment && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Admin Comment</h3>
                    <p className="text-sm text-muted-foreground">{activeRequest.adminComment}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              {(activeRequest.status === 'submitted' || activeRequest.status === 'pending_head_approval') && (
                <Button 
                  variant="destructive" 
                  onClick={handleWithdrawRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Withdraw Request"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Transfer Request</CardTitle>
              <CardDescription>
                Fill in the details to request a transfer to another school or district
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitTransfer}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferType">Transfer Type</Label>
                  <Select
                    value={transferType}
                    onValueChange={(value) => setTransferType(value as 'school' | 'district')}
                  >
                    <SelectTrigger id="transferType">
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">Specific School</SelectItem>
                      <SelectItem value="district">Any School in District</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {transferType === 'school' ? (
                  <div className="space-y-2">
                    <Label htmlFor="school">Destination School</Label>
                    <Select
                      value={selectedSchoolId}
                      onValueChange={setSelectedSchoolId}
                    >
                      <SelectTrigger id="school">
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSchools.map(school => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} ({school.district})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="district">Destination District</Label>
                    <Select
                      value={selectedDistrict}
                      onValueChange={setSelectedDistrict}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueDistricts.map(district => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Transfer</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain why you are requesting a transfer"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransferPage;

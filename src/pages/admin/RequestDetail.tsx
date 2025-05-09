
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainNavigation } from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { RequestStatus } from '@/types';

// Mock data for a single transfer request
const mockRequest = {
  id: '301',
  teacherName: 'Alice Johnson',
  teacherEC: 'EC345678',
  teacherEmail: 'alice.johnson@example.com',
  currentSchool: 'Sunset Primary School',
  currentSchoolId: '101',
  targetSchool: 'Eastside Elementary',
  targetSchoolId: '202',
  district: 'Eastern District',
  subject: 'Science',
  teachingLevel: 'Primary',
  yearsOfExperience: 6,
  reason: 'I am requesting a transfer to Eastside Elementary as it specializes in science education with better laboratory facilities. This would enhance my ability to provide quality science education to students.',
  status: 'forwarded_to_admin' as RequestStatus,
  submittedAt: '2024-05-01T10:30:00Z',
  forwardedAt: '2024-05-03T14:45:00Z',
  headmasterName: 'Dr. Wilson',
  headmasterId: '501',
  headmasterEmail: 'dr.wilson@example.com',
  headmasterComment: 'Strong recommendation for approval. Alice has been an exceptional science teacher and would benefit from the specialized facilities at Eastside Elementary.',
};

const AdminRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request] = useState(mockRequest);
  const [decision, setDecision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulating API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Request Approved",
        description: "The transfer request has been approved. Notifications have been sent to the teacher and headmaster.",
      });
      
      navigate('/admin/requests');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!decision.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulating API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Request Rejected",
        description: "The transfer request has been rejected. Notifications have been sent to the teacher and headmaster.",
      });
      
      navigate('/admin/requests');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transfer Request Details</h1>
          <Button variant="outline" onClick={() => navigate('/admin/requests')}>
            Back to Requests
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {request.teacherName} - {request.subject}
              </CardTitle>
              <StatusBadge status={request.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              EC: {request.teacherEC} | Submitted: {new Date(request.submittedAt).toLocaleDateString()} | 
              Forwarded: {new Date(request.forwardedAt).toLocaleDateString()}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">District</p>
                  <p className="text-muted-foreground">{request.district}</p>
                </div>
                <div>
                  <p className="font-medium">Teaching Level</p>
                  <p className="text-muted-foreground">{request.teachingLevel}</p>
                </div>
                <div>
                  <p className="font-medium">Years of Experience</p>
                  <p className="text-muted-foreground">{request.yearsOfExperience}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Teacher's Reason for Transfer</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
              </div>
              <div className="border-t pt-3">
                <p className="font-medium">Headmaster Comment</p>
                <p className="text-muted-foreground">{request.headmasterComment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Final Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label className="font-medium block mb-2">Comments (required if rejecting)</label>
                <Textarea
                  placeholder="Provide a reason or additional comments..."
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Rejecting..." : "Reject Transfer"}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Approving..." : "Approve Transfer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRequestDetail;

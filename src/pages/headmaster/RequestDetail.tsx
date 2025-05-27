import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import type { TransferRequest, School, User } from '@/types';
import { mapTransferRequest, mapUser, mapSchool } from '@/lib/mappers';

const HeadmasterRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<TransferRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [targetSchool, setTargetSchool] = useState<School | null>(null);

  useEffect(() => {
    async function loadRequestDetails() {
      if (!id) return;

      try {
        // Get transfer request details
        const { data: requestData, error: requestError } = await supabase
          .from('transfer_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (requestError) throw requestError;
        if (!requestData) throw new Error('Request not found');

        const mappedRequest = mapTransferRequest(requestData);
        setRequest(mappedRequest);

        // Get teacher details
        const { data: teacherData, error: teacherError } = await supabase
          .from('users')
          .select('*')
          .eq('id', mappedRequest.teacherId)
          .single();

        if (teacherError) throw teacherError;
        setTeacher(mapUser(teacherData));

        // Get school details
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('*')
          .in('id', [mappedRequest.fromSchoolId, mappedRequest.toSchoolId].filter(Boolean));

        if (schoolsError) throw schoolsError;

        const currentSchool = schoolsData.find(s => s.id === mappedRequest.fromSchoolId);
        const targetSchool = schoolsData.find(s => s.id === mappedRequest.toSchoolId);

        setCurrentSchool(currentSchool ? mapSchool(currentSchool) : null);
        setTargetSchool(targetSchool ? mapSchool(targetSchool) : null);

      } catch (error) {
        console.error('Error loading request details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transfer request details.',
          variant: 'destructive',
        });
      }
    }

    loadRequestDetails();
  }, [id, toast]);

  const handleApprove = async () => {
    if (!request || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('transfer_requests')
        .update({
          status: 'forwarded_to_admin',
          headmaster_action_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
      if (updateError) throw updateError;

      // Create notification for teacher
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.teacherId,
          title: 'Transfer Request Approved',
          message: 'Your transfer request has been approved by the headmaster and forwarded to admin for final review.',
          type: 'success',
        });

      if (notificationError) throw notificationError;
      
      toast({
        title: "Request Approved",
        description: "The transfer request has been approved and forwarded to the admin.",
      });
      
      navigate('/headmaster/requests');
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
    if (!request || !user || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('transfer_requests')
        .update({
          status: 'rejected_by_headmaster',
          headmaster_comment: rejectionReason,
          headmaster_action_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
      if (updateError) throw updateError;

      // Create notification for teacher
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.teacherId,
          title: 'Transfer Request Rejected',
          message: `Your transfer request has been rejected. Reason: ${rejectionReason}`,
          type: 'error',
        });

      if (notificationError) throw notificationError;
      
      toast({
        title: "Request Rejected",
        description: "The transfer request has been rejected and the teacher has been notified.",
      });
      
      navigate('/headmaster/requests');
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

  if (!request || !teacher) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transfer Request Details</h1>
          <Button variant="outline" onClick={() => navigate('/headmaster/requests')}>
            Back to Requests
          </Button>
        </div>
        
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {teacher.name}
              </CardTitle>
              <StatusBadge status={request.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              EC Number: {teacher.ecNumber} | Submitted on {new Date(request.submittedAt).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Current School</p>
                  <p className="text-muted-foreground">
                    {currentSchool?.name}, {currentSchool?.district}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Requested Transfer To</p>
                  <p className="text-muted-foreground">
                    {request.toSchoolId ? 
                      `${targetSchool?.name}, ${targetSchool?.district}` : 
                      `Any School, ${request.toDistrict}`
                    }
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium">Reason for Transfer</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {request.status === 'pending_head_approval' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="font-medium block mb-2">Rejection Reason (required if rejecting)</label>
                  <Textarea
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectionReason.trim()}
                  >
                    Reject Request
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    Approve & Forward to Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeadmasterRequestDetail;

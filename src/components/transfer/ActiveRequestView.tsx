
import { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TransferRequest } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActiveRequestViewProps {
  activeRequest: TransferRequest;
  isSubmitting: boolean;
  getSchoolName: (id: string) => string;
  formatDate: (dateString: string) => string;
  onWithdraw: () => Promise<void>;
}

export const ActiveRequestView = ({ 
  activeRequest, 
  isSubmitting, 
  getSchoolName, 
  formatDate,
  onWithdraw 
}: ActiveRequestViewProps) => {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const handleWithdraw = async () => {
    setWithdrawDialogOpen(false);
    await onWithdraw();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Active Transfer Request</CardTitle>
            <CardDescription>
              Submitted on {formatDate(activeRequest.submittedAt)}
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
              {activeRequest.fromSchoolId ? getSchoolName(activeRequest.fromSchoolId) : 'Unknown School'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Preferred Location</h3>
            <p className="text-sm text-muted-foreground">
              <strong>District:</strong> {activeRequest.toDistrict || 'Unspecified'}
            </p>
            {activeRequest.toSchoolId && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>School:</strong> {getSchoolName(activeRequest.toSchoolId)}
              </p>
            )}
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
      {(activeRequest.status === 'submitted' || activeRequest.status === 'pending_head_approval') && (
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => setWithdrawDialogOpen(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Withdraw Request"}
          </Button>
          
          <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw Transfer Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to withdraw your transfer request? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWithdraw}>
                  Withdraw Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};

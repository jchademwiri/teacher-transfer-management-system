
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TeacherWithTransferStatus } from '@/hooks/use-headmaster-teachers';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Book, List } from 'lucide-react';

interface TeacherProfileProps {
  teacher: TeacherWithTransferStatus;
}

export function TeacherProfile({ teacher }: TeacherProfileProps) {
  // Function to get the latest transfer request status
  const getLatestRequestStatus = () => {
    if (teacher.transferStatus === 'None') {
      return null;
    }
    
    const statusMap: Record<string, { label: string, status: string }> = {
      'Pending': { label: 'Pending Approval', status: 'pending_head_approval' },
      'Rejected': { label: 'Rejected by Headmaster', status: 'rejected_by_headmaster' },
      'Forwarded': { label: 'Forwarded to Admin', status: 'forwarded_to_admin' },
      'Approved': { label: 'Approved by Admin', status: 'approved_by_admin' },
    };
    
    return statusMap[teacher.transferStatus];
  };
  
  const latestStatus = getLatestRequestStatus();
  
  return (
    <div className="space-y-6 py-6">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{teacher.name}</h3>
          </div>
          <Badge variant="outline" className="bg-purple-50">
            {teacher.level}
          </Badge>
        </div>
        <p className="mt-1 text-muted-foreground">EC Number: {teacher.ecNumber}</p>
        {teacher.email && <p className="text-muted-foreground">{teacher.email}</p>}
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Book className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Subjects</h4>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {teacher.subjectNames.length > 0 ? (
            teacher.subjectNames.map((subject, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {subject}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No subjects assigned</p>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Transfer Status</h4>
        </div>
        
        {teacher.transferStatus === 'None' ? (
          <p className="text-muted-foreground text-sm">No active transfer requests</p>
        ) : (
          <div className="mt-2">
            <Card className="p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Request:</span>
                {latestStatus && <StatusBadge status={latestStatus.status as any} />}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This teacher currently has an active transfer request that requires your attention.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

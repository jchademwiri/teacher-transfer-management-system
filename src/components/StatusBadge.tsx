
import React from 'react';
import { cn } from '@/lib/utils';
import { RequestStatus } from '@/types';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  submitted: { 
    label: 'Submitted', 
    className: 'status-submitted' 
  },
  pending_head_approval: { 
    label: 'Pending Head Approval', 
    className: 'status-pending' 
  },
  rejected_by_headmaster: { 
    label: 'Rejected by Headmaster', 
    className: 'status-rejected' 
  },
  forwarded_to_admin: { 
    label: 'Forwarded to Admin', 
    className: 'status-forwarded' 
  },
  rejected_by_admin: { 
    label: 'Rejected by Admin', 
    className: 'status-rejected' 
  },
  approved_by_admin: { 
    label: 'Approved', 
    className: 'status-approved' 
  },
  withdrawn_by_teacher: { 
    label: 'Withdrawn', 
    className: 'status-withdrawn' 
  },
  expired: { 
    label: 'Expired', 
    className: 'status-expired' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClass } = statusConfig[status];
  
  return (
    <span className={cn('status-badge', badgeClass, className)}>
      {label}
    </span>
  );
}


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
    className: 'bg-neutral-100 text-neutral-800' 
  },
  pending_head_approval: { 
    label: 'Pending Head Approval', 
    className: 'bg-amber-100 text-amber-800' 
  },
  rejected_by_headmaster: { 
    label: 'Rejected by Headmaster', 
    className: 'bg-red-100 text-red-800' 
  },
  forwarded_to_admin: { 
    label: 'Forwarded to Admin', 
    className: 'bg-amber-100 text-amber-800' 
  },
  rejected_by_admin: { 
    label: 'Rejected by Admin', 
    className: 'bg-red-100 text-red-800' 
  },
  approved_by_admin: { 
    label: 'Approved', 
    className: 'bg-green-100 text-green-800' 
  },
  withdrawn_by_teacher: { 
    label: 'Withdrawn', 
    className: 'bg-neutral-100 text-neutral-800' 
  },
  expired: { 
    label: 'Expired', 
    className: 'bg-neutral-100 text-neutral-800' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: badgeClass } = statusConfig[status];
  
  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', badgeClass, className)}>
      {label}
    </span>
  );
}

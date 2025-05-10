
import React from "react";
import { File, Users, ArrowRight } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";

interface StatCardsProps {
  pendingRequestsCount: number;
  forwardedRequestsCount: number;
  rejectedRequestsCount: number;
  teachersCount: number;
}

export function StatCards({
  pendingRequestsCount,
  forwardedRequestsCount,
  rejectedRequestsCount,
  teachersCount
}: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Pending Requests"
        icon={<File className="h-4 w-4 text-muted-foreground" />}
        value={pendingRequestsCount.toString()}
        description="Teachers waiting for your approval"
        linkText="Review Requests"
        linkHref="/headmaster/requests"
      />
      
      <DashboardCard
        title="Approved & Forwarded"
        icon={<ArrowRight className="h-4 w-4 text-muted-foreground" />}
        value={forwardedRequestsCount.toString()}
        description="Requests sent to Admin"
        linkText="View History"
        linkHref="/headmaster/history"
      />
      
      <DashboardCard
        title="Rejected Requests"
        icon={<File className="h-4 w-4 text-muted-foreground" />}
        value={rejectedRequestsCount.toString()}
        description="Transfer requests rejected"
        linkText="View History"
        linkHref="/headmaster/history"
      />
      
      <DashboardCard
        title="Teachers in My School"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        value={teachersCount.toString()}
        description="Teachers at your school"
        linkText="View All"
        linkHref="/headmaster/teachers"
      />
    </div>
  );
}

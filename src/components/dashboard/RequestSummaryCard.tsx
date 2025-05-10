
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TransferRequest } from "@/types";

interface RequestSummaryCardProps {
  activeRequest: TransferRequest | null;
  formatDate: (dateString: string) => string;
  getSchoolName: (schoolId: string) => string;
  userRole: "teacher" | "headmaster" | "admin";
}

export function RequestSummaryCard({ 
  activeRequest, 
  formatDate, 
  getSchoolName, 
  userRole 
}: RequestSummaryCardProps) {
  // Derive path based on user role
  const basePath = userRole === "teacher" ? "/dashboard" : 
                  userRole === "headmaster" ? "/headmaster" : "/admin";

  return (
    <DashboardCard
      title="Transfer Request Status"
      icon={<div className="h-4 w-4 text-muted-foreground" />}
    >
      {activeRequest ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={activeRequest.status} />
            <span className="text-xs text-muted-foreground">
              Submitted: {formatDate(activeRequest.submittedAt)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm">
            <strong>Reason:</strong> {activeRequest.reason}
          </p>
          <p className="text-sm">
            <strong>To:</strong> {
              activeRequest.toSchoolId 
                ? getSchoolName(activeRequest.toSchoolId)
                : activeRequest.toDistrict || 'Unspecified'
            }
          </p>
          {activeRequest.headmasterComment && (
            <p className="text-sm">
              <strong>Headmaster:</strong> {activeRequest.headmasterComment}
            </p>
          )}
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={`${basePath}/transfer`}>
                <span>View Details</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">You don't have any active transfer requests.</p>
          <Button asChild variant="default" size="sm" className="w-full">
            <Link to={`${basePath}/transfer`}>Submit Transfer Request</Link>
          </Button>
        </div>
      )}
    </DashboardCard>
  );
}

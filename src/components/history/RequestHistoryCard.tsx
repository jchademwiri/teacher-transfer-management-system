
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { RequestStatus } from "@/types";

interface RequestHistoryCardProps {
  id: string;
  teacherName: string;
  subject: string;
  currentSchool: string;
  targetSchool: string;
  status: RequestStatus;
  submittedAt: string;
  actionDate: string;
  headmasterComment?: string;
  adminStatus?: RequestStatus;
  adminActionDate?: string;
  adminComment?: string;
  formatDate: (date: string) => string;
}

export function RequestHistoryCard({
  id,
  teacherName,
  subject,
  currentSchool,
  targetSchool,
  status,
  submittedAt,
  actionDate,
  headmasterComment,
  adminStatus,
  adminActionDate,
  adminComment,
  formatDate
}: RequestHistoryCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {teacherName} - {subject}
          </CardTitle>
          <StatusBadge status={adminStatus || status} />
        </div>
        <div className="text-sm text-muted-foreground">
          Request Submitted: {formatDate(submittedAt)} | 
          Your Action: {formatDate(actionDate)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Current School</p>
              <p className="text-muted-foreground">{currentSchool}</p>
            </div>
            <div>
              <p className="font-medium">Target School</p>
              <p className="text-muted-foreground">{targetSchool}</p>
            </div>
          </div>
          <div>
            <p className="font-medium">Your Comment</p>
            <p className="text-muted-foreground">{headmasterComment || 'No comment provided'}</p>
          </div>
          
          {adminStatus && (
            <div className="border-t pt-3 mt-2">
              <p className="font-medium">Admin Decision</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={adminStatus} />
                <span className="text-sm text-muted-foreground">
                  on {formatDate(adminActionDate!)}
                </span>
              </div>
              {adminComment && (
                <p className="text-muted-foreground mt-2">{adminComment}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button 
              variant="outline"
              asChild
            >
              <Link to={`/headmaster/requests/${id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

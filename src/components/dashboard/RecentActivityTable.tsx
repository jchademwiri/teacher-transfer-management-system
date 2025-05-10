
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

interface RecentActivity {
  id: string;
  date: string;
  teacherName?: string;
  teacherId?: string;
  destination: string;
  status: any;
}

interface RecentActivityTableProps {
  activities: RecentActivity[];
  basePath: string;
  isTeacherView?: boolean;
  linkText?: string;
  linkPath?: string;
}

export function RecentActivityTable({ 
  activities, 
  basePath, 
  isTeacherView = false,
  linkText = "View All",
  linkPath = "/history"
}: RecentActivityTableProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isTeacherView ? "Past Transfer Requests" : "Recent Activity"}
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link to={`${basePath}${linkPath}`}>{linkText}</Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {!isTeacherView && <th className="px-4 py-3 text-left">Teacher</th>}
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Status</th>
                {!isTeacherView && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity.id} className="border-t">
                    {!isTeacherView && <td className="px-4 py-3">{activity.teacherName}</td>}
                    <td className="px-4 py-3">{activity.date}</td>
                    <td className="px-4 py-3">{activity.destination}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={activity.status} />
                    </td>
                    {!isTeacherView && (
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`${basePath}/requests/${activity.id}`}>
                            Details
                          </Link>
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isTeacherView ? 3 : 5} className="px-4 py-6 text-center text-muted-foreground">
                    {isTeacherView ? "No past transfer requests found" : "No recent activity found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

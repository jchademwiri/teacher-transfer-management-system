
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";

interface Notification {
  title: string;
  message: string;
  date: string;
  type: string;
}

interface NotificationsCardProps {
  notifications: Notification[];
}

export function NotificationsCard({ notifications }: NotificationsCardProps) {
  return (
    <DashboardCard
      title="Recent Notifications"
      icon={<Bell className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div 
              key={index} 
              className={`border-l-4 ${
                notification.type === 'success' ? 'border-green-500' : 
                notification.type === 'error' ? 'border-red-500' : 
                notification.type === 'warning' ? 'border-amber-500' : 
                'border-blue-500'
              } pl-3 py-1`}
            >
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent notifications</p>
        )}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/notifications">
            <span>View All Notifications</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </DashboardCard>
  );
}

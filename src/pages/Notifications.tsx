
import React, { useState } from 'react';
// import MainNavigation from "@/components/MainNavigation";
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { Notification } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Mock data for notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    userId: "1",
    title: "Transfer Request Update",
    message: "Your transfer request has been forwarded to the admin.",
    read: false,
    type: "info",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2", 
    userId: "1",
    title: "Request Approved",
    message: "Your transfer request has been approved by the admin.",
    read: true,
    type: "success",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    userId: "1",
    title: "Profile Updated",
    message: "Your profile information has been updated successfully.",
    read: true,
    type: "info",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "4", 
    userId: "1",
    title: "New Comment",
    message: "The headmaster has commented on your transfer request.",
    read: false,
    type: "info",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: "5",
    userId: "1",
    title: "Welcome!",
    message: "Welcome to the Teacher Transfer Management System.",
    read: true,
    type: "info",
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const { toast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read.`,
    });
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const notificationStyles = {
    info: "border-l-4 border-info",
    success: "border-l-4 border-success",
    warning: "border-l-4 border-warning",
    error: "border-l-4 border-destructive"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <MainNavigation /> */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on your transfer requests and other activities
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${notificationStyles[notification.type]} p-4 rounded-md shadow-sm ${!notification.read ? 'bg-accent' : 'bg-card'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

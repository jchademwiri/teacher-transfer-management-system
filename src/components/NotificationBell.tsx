
import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Notification } from '@/types';

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
  }
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 font-medium">
          <span>Notifications</span>
          <Link to="/notifications" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="max-h-96 overflow-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-4 text-sm ${!notification.read ? 'bg-accent' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center w-full">
                  <span className={`mr-2 h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-primary'}`} />
                  <span className="font-medium">{notification.title}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

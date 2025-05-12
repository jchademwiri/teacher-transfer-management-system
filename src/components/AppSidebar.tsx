
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  File, 
  FileCheck, 
  User, 
  Bell, 
  School, 
  Users,
  LogOut,
  Settings,
  BookOpen,
  Map,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { user, logout, role } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const teacherNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="size-4" /> },
    { label: 'Transfer', href: '/dashboard/transfer', icon: <File className="size-4" /> },
    { label: 'History', href: '/dashboard/history', icon: <FileCheck className="size-4" /> },
    { label: 'Profile', href: '/profile', icon: <User className="size-4" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="size-4" /> },
  ];

  const headmasterNavItems = [
    { label: 'Dashboard', href: '/headmaster', icon: <Home className="size-4" /> },
    { label: 'Requests', href: '/headmaster/requests', icon: <File className="size-4" /> },
    { label: 'Teachers', href: '/headmaster/teachers', icon: <Users className="size-4" /> },
    { label: 'History', href: '/headmaster/history', icon: <FileCheck className="size-4" /> },
    { label: 'Profile', href: '/profile', icon: <User className="size-4" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="size-4" /> },
  ];

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin', icon: <Home className="size-4" /> },
    { label: 'Requests', href: '/admin/requests', icon: <File className="size-4" /> },
    { label: 'Teachers', href: '/admin/teachers', icon: <Users className="size-4" /> },
    { label: 'Headmasters', href: '/admin/headmasters', icon: <UserCheck className="size-4" /> },
    { label: 'Schools', href: '/admin/schools', icon: <School className="size-4" /> },
    { label: 'Districts', href: '/admin/districts', icon: <Map className="size-4" /> },
    { label: 'Subjects', href: '/admin/subjects', icon: <BookOpen className="size-4" /> },
    { label: 'Profile', href: '/profile', icon: <User className="size-4" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="size-4" /> },
  ];

  const navItems = role === 'teacher' 
    ? teacherNavItems 
    : role === 'headmaster' 
      ? headmasterNavItems 
      : adminNavItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center">
          <School className="mr-2 h-6 w-6 text-sidebar-primary" />
          <h1 className="text-lg font-semibold">Teacher Transfer</h1>
        </div>
        <div className="mt-2 text-sm text-sidebar-foreground/70">
          {user.name} ({role})
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button 
          variant="outline" 
          onClick={() => logout()}
          className="w-full flex items-center justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';

const MainNavigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get all admin menu items
  const getAdminMenu = () => [
    { name: "Dashboard", path: "/admin" },
    { name: "Districts", path: "/admin/districts" },
    { name: "Schools", path: "/admin/schools" },
    { name: "Subjects", path: "/admin/subjects" },
    { name: "Users", path: "/admin/users" }, // New link for users management
    { name: "Headmasters", path: "/admin/headmasters" },
    { name: "Teachers", path: "/admin/teachers" },
    { name: "Transfer Requests", path: "/admin/requests" },
  ];

  // Get all teacher menu items
  const getTeacherMenu = () => [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transfer Request", path: "/transfer" },
    { name: "Request History", path: "/history" },
  ];

  // Get all headmaster menu items
  const getHeadmasterMenu = () => [
    { name: "Dashboard", path: "/headmaster" },
    { name: "Teachers", path: "/headmaster/teachers" },
    { name: "Transfer Requests", path: "/headmaster/requests" },
    { name: "Request History", path: "/headmaster/history" },
  ];

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return getAdminMenu();
      case 'teacher':
        return getTeacherMenu();
      case 'headmaster':
        return getHeadmasterMenu();
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-secondary border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-bold text-lg">
          Transfer System
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-64">
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through the app.
                  </SheetDescription>
                </SheetHeader>
                <nav className="grid gap-4 text-sm font-medium">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2.5 p-2 hover:bg-secondary rounded-md ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button variant="outline" onClick={handleLogout} className="justify-start">
                    Log out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/login"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default MainNavigation;

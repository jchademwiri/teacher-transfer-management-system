
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Menu,
  X,
  Map,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainNavigation() {
  const { user, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = {
    teacher: [
      { label: 'Dashboard', href: '/dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
      { label: 'Transfer', href: '/dashboard/transfer', icon: <File className="mr-2 h-4 w-4" /> },
      { label: 'History', href: '/dashboard/history', icon: <FileCheck className="mr-2 h-4 w-4" /> },
    ],
    headmaster: [
      { label: 'Dashboard', href: '/headmaster', icon: <Home className="mr-2 h-4 w-4" /> },
      { label: 'Requests', href: '/headmaster/requests', icon: <File className="mr-2 h-4 w-4" /> },
      { label: 'Teachers', href: '/headmaster/teachers', icon: <Users className="mr-2 h-4 w-4" /> },
      { label: 'History', href: '/headmaster/history', icon: <FileCheck className="mr-2 h-4 w-4" /> },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: <Home className="mr-2 h-4 w-4" /> },
      { label: 'Requests', href: '/admin/requests', icon: <File className="mr-2 h-4 w-4" /> },
      { label: 'Teachers', href: '/admin/teachers', icon: <Users className="mr-2 h-4 w-4" /> },
      { label: 'Schools', href: '/admin/schools', icon: <School className="mr-2 h-4 w-4" /> },
      { label: 'Districts', href: '/admin/districts', icon: <Map className="mr-2 h-4 w-4" /> },
      { label: 'Headmasters', href: '/admin/headmasters', icon: <User className="mr-2 h-4 w-4" /> },
      { label: 'Subjects', href: '/admin/subjects', icon: <BookOpen className="mr-2 h-4 w-4" /> },
    ],
  };

  const currentNavItems = role ? navItems[role] : [];

  return (
    <nav className="bg-primary text-primary-foreground shadow">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link to="/" className="font-bold text-lg">Teacher Transfer</Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {currentNavItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right-side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/notifications" className="p-2 rounded-full hover:bg-primary-foreground/10">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/profile" className="p-2 rounded-full hover:bg-primary-foreground/10">
              <User className="h-5 w-5" />
            </Link>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-primary-foreground/10"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} pb-3`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentNavItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
                onClick={toggleMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-primary-foreground/20" />
            <Link
              to="/notifications"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10"
              onClick={toggleMenu}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10"
              onClick={toggleMenu}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
            <Button
              onClick={() => {
                logout();
                toggleMenu();
              }}
              variant="ghost"
              size="sm"
              className="flex items-center w-full justify-start px-3 py-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

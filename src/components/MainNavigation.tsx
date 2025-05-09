
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
  X
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
      { label: 'History', href: '/headmaster/history', icon: <FileCheck className="mr-2 h-4 w-4" /> },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: <Home className="mr-2 h-4 w-4" /> },
      { label: 'Requests', href: '/admin/requests', icon: <File className="mr-2 h-4 w-4" /> },
      { label: 'Teachers', href: '/admin/teachers', icon: <Users className="mr-2 h-4 w-4" /> },
      { label: 'Schools', href: '/admin/schools', icon: <School className="mr-2 h-4 w-4" /> },
      { label: 'Subjects', href: '/admin/subjects', icon: <FileCheck className="mr-2 h-4 w-4" /> },
    ],
  };

  const currentNavItems = role ? navItems[role] : [];

  return (
    <nav className="bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-xl font-bold">
              Teacher Transfer
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {currentNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/notifications"
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
              <Button
                variant="ghost" 
                onClick={() => logout()}
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-1 rounded-md hover:bg-primary-foreground/10 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link
              to="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Link>
            <Button
              variant="ghost" 
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

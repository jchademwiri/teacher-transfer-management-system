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
      {/* Component content kept for reference but no longer used */}
      {/* ... */}
    </nav>
  );
}

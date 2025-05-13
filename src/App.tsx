
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

// Pages
import LoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFound';
import ProfilePage from '@/pages/Profile';
import NotificationsPage from '@/pages/Notifications';
import IndexPage from './pages/Index';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminSchools from '@/pages/admin/Schools';
import AdminDistricts from '@/pages/admin/Districts';
import AdminHeadmasters from '@/pages/admin/Headmasters';
import AdminTeachers from '@/pages/admin/Teachers';
import AdminRequests from '@/pages/admin/Requests';
import AdminRequestDetail from '@/pages/admin/RequestDetail';
import AdminSubjects from '@/pages/admin/Subjects';
import AdminUsers from '@/pages/admin/Users';

// Teacher pages
import TeacherDashboard from '@/pages/dashboard/Dashboard';
import TransferPage from '@/pages/dashboard/Transfer';
import TransferHistoryPage from '@/pages/dashboard/History';

// Headmaster pages
import HeadmasterDashboard from '@/pages/headmaster/Dashboard';
import HeadmasterTeachers from '@/pages/headmaster/Teachers';
import HeadmasterRequests from '@/pages/headmaster/Requests';
import HeadmasterRequestDetail from '@/pages/headmaster/RequestDetail';
import HeadmasterHistory from '@/pages/headmaster/History';
import MainNavigation from '@/components/MainNavigation';

// Route Guard Component
interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'teacher') {
      return <Navigate to="/dashboard" />;
    } else if (user.role === 'headmaster') {
      return <Navigate to="/headmaster" />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    }
    // Fallback
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container py-6">
        {children}
      </div>
    </div>
  );
};

// App Component with Routes
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={
          <RouteGuard>
            <ProfilePage />
          </RouteGuard>
        } />
        
        <Route path="/notifications" element={
          <RouteGuard>
            <NotificationsPage />
          </RouteGuard>
        } />
        
        {/* Teacher Routes */}
        <Route path="/dashboard" element={
          <RouteGuard allowedRoles={['teacher']}>
            <TeacherDashboard />
          </RouteGuard>
        } />
        
        <Route path="/transfer" element={
          <RouteGuard allowedRoles={['teacher']}>
            <TransferPage />
          </RouteGuard>
        } />
        
        <Route path="/history" element={
          <RouteGuard allowedRoles={['teacher']}>
            <TransferHistoryPage />
          </RouteGuard>
        } />
        
        {/* Headmaster Routes */}
        <Route path="/headmaster" element={
          <RouteGuard allowedRoles={['headmaster']}>
            <HeadmasterDashboard />
          </RouteGuard>
        } />
        
        <Route path="/headmaster/teachers" element={
          <RouteGuard allowedRoles={['headmaster']}>
            <HeadmasterTeachers />
          </RouteGuard>
        } />
        
        <Route path="/headmaster/requests" element={
          <RouteGuard allowedRoles={['headmaster']}>
            <HeadmasterRequests />
          </RouteGuard>
        } />
        
        <Route path="/headmaster/requests/:id" element={
          <RouteGuard allowedRoles={['headmaster']}>
            <HeadmasterRequestDetail />
          </RouteGuard>
        } />
        
        <Route path="/headmaster/history" element={
          <RouteGuard allowedRoles={['headmaster']}>
            <HeadmasterHistory />
          </RouteGuard>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RouteGuard>
        } />
        
        <Route path="/admin/schools" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminSchools />
          </RouteGuard>
        } />
        
        <Route path="/admin/districts" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminDistricts />
          </RouteGuard>
        } />
        
        <Route path="/admin/headmasters" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminHeadmasters />
          </RouteGuard>
        } />
        
        <Route path="/admin/teachers" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminTeachers />
          </RouteGuard>
        } />

        <Route path="/admin/users" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminUsers />
          </RouteGuard>
        } />
        
        <Route path="/admin/requests" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminRequests />
          </RouteGuard>
        } />
        
        <Route path="/admin/requests/:id" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminRequestDetail />
          </RouteGuard>
        } />
        
        <Route path="/admin/subjects" element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminSubjects />
          </RouteGuard>
        } />
        
        {/* Fallback for unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

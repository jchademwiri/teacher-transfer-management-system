
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";

// Pages
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import Dashboard from "@/pages/dashboard/Dashboard";
import Transfer from "@/pages/dashboard/Transfer";
import TeacherHistory from "@/pages/dashboard/History";
import HeadmasterDashboard from "@/pages/headmaster/Dashboard";
import HeadmasterRequests from "@/pages/headmaster/Requests";
import HeadmasterRequestDetail from "@/pages/headmaster/RequestDetail";
import HeadmasterHistory from "@/pages/headmaster/History";
import HeadmasterTeachers from "@/pages/headmaster/Teachers";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRequests from "@/pages/admin/Requests";
import AdminRequestDetail from "@/pages/admin/RequestDetail";
import AdminTeachers from "@/pages/admin/Teachers";
import AdminSchools from "@/pages/admin/Schools";
import AdminSubjects from "@/pages/admin/Subjects";
import AdminDistricts from "@/pages/admin/Districts";
import AdminHeadmasters from "@/pages/admin/Headmasters";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ element, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  
  // If still loading auth state, render nothing (or a spinner)
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles specified but user's role not included, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    if (role === 'teacher') return <Navigate to="/dashboard" />;
    if (role === 'headmaster') return <Navigate to="/headmaster" />;
    if (role === 'admin') return <Navigate to="/admin" />;
  }
  
  // Otherwise render the protected content in the layout
  return <AppLayout>{element}</AppLayout>;
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Root redirect based on role */}
              <Route path="/" element={<Index />} />
              
              {/* Teacher routes */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute element={<Dashboard />} allowedRoles={['teacher']} />} 
              />
              <Route 
                path="/dashboard/transfer" 
                element={<ProtectedRoute element={<Transfer />} allowedRoles={['teacher']} />} 
              />
              <Route 
                path="/dashboard/history" 
                element={<ProtectedRoute element={<TeacherHistory />} allowedRoles={['teacher']} />} 
              />
              
              {/* Headmaster routes */}
              <Route 
                path="/headmaster" 
                element={<ProtectedRoute element={<HeadmasterDashboard />} allowedRoles={['headmaster']} />} 
              />
              <Route 
                path="/headmaster/requests" 
                element={<ProtectedRoute element={<HeadmasterRequests />} allowedRoles={['headmaster']} />} 
              />
              <Route 
                path="/headmaster/requests/:id" 
                element={<ProtectedRoute element={<HeadmasterRequestDetail />} allowedRoles={['headmaster']} />} 
              />
              <Route 
                path="/headmaster/history" 
                element={<ProtectedRoute element={<HeadmasterHistory />} allowedRoles={['headmaster']} />} 
              />
              {/* Add new route for teachers management */}
              <Route 
                path="/headmaster/teachers" 
                element={<ProtectedRoute element={<HeadmasterTeachers />} allowedRoles={['headmaster']} />} 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/requests" 
                element={<ProtectedRoute element={<AdminRequests />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/requests/:id" 
                element={<ProtectedRoute element={<AdminRequestDetail />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/teachers" 
                element={<ProtectedRoute element={<AdminTeachers />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/schools" 
                element={<ProtectedRoute element={<AdminSchools />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/districts" 
                element={<ProtectedRoute element={<AdminDistricts />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/headmasters" 
                element={<ProtectedRoute element={<AdminHeadmasters />} allowedRoles={['admin']} />} 
              />
              <Route 
                path="/admin/subjects" 
                element={<ProtectedRoute element={<AdminSubjects />} allowedRoles={['admin']} />} 
              />
              
              {/* Common routes for all authenticated users */}
              <Route 
                path="/profile" 
                element={<ProtectedRoute element={<Profile />} />} 
              />
              <Route 
                path="/notifications" 
                element={<ProtectedRoute element={<Notifications />} />} 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth and base pages
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';

// Teacher (Dashboard) pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Transfer from '@/pages/dashboard/Transfer';
import History from '@/pages/dashboard/History';

// Headmaster pages
import HeadmasterDashboard from '@/pages/headmaster/Dashboard';
import HeadmasterRequests from '@/pages/headmaster/Requests';
import HeadmasterRequestDetail from '@/pages/headmaster/RequestDetail';
import HeadmasterTeachers from '@/pages/headmaster/Teachers';
import HeadmasterHistory from '@/pages/headmaster/History';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminRequests from '@/pages/admin/Requests';
import AdminRequestDetail from '@/pages/admin/RequestDetail';
import AdminTeachers from '@/pages/admin/Teachers';
import AdminSchools from '@/pages/admin/Schools';
import AdminDistricts from '@/pages/admin/Districts';
import AdminHeadmasters from '@/pages/admin/Headmasters';
import AdminSubjects from '@/pages/admin/Subjects';

// Context providers
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Common routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Teacher routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/transfer" element={<Transfer />} />
          <Route path="/dashboard/history" element={<History />} />
          
          {/* Headmaster routes */}
          <Route path="/headmaster" element={<HeadmasterDashboard />} />
          <Route path="/headmaster/requests" element={<HeadmasterRequests />} />
          <Route path="/headmaster/requests/:id" element={<HeadmasterRequestDetail />} />
          <Route path="/headmaster/teachers" element={<HeadmasterTeachers />} />
          <Route path="/headmaster/history" element={<HeadmasterHistory />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/requests/:id" element={<AdminRequestDetail />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/schools" element={<AdminSchools />} />
          <Route path="/admin/districts" element={<AdminDistricts />} />
          <Route path="/admin/headmasters" element={<AdminHeadmasters />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

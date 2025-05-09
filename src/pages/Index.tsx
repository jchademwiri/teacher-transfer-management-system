
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    console.log('User role:', role); // Debug log to verify role is being detected

    // Redirect based on user role
    if (role === 'teacher') {
      navigate('/dashboard');
    } else if (role === 'headmaster') {
      navigate('/headmaster');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      console.log('Unknown role:', role); // Debug log for unknown roles
      navigate('/login'); // Fallback if role is unknown
    }
  }, [isAuthenticated, role, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center">
        <h2 className="text-xl">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
};

export default Index;

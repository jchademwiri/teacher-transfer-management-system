
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { role } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Determine where to direct the user based on their role
  const getHomeLink = () => {
    if (role === 'teacher') return '/dashboard';
    if (role === 'headmaster') return '/headmaster';
    if (role === 'admin') return '/admin';
    return '/login'; // Default fallback
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl font-medium mb-6">Page not found</p>
        <p className="text-muted-foreground mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to={getHomeLink()} className="inline-flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

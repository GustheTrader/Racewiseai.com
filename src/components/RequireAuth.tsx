
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/components/ui/sonner';

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("No user found, should redirect to auth");
      } else if (requireAdmin && !isAdmin) {
        console.log("User is not admin, should redirect to home", { isAdmin });
        toast.error("You don't have permission to access the admin area");
        navigate('/');
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, navigate]);

  if (isLoading) {
    // Loading spinner with updated color scheme to match the gradient
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page if not logged in
    console.log("Redirecting to auth page, no user found");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if admin access is required but user is not an admin
    console.log("Redirecting to home, user is not admin");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated (and is admin if required)
  return <>{children}</>;
};

export default RequireAuth;


import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { token, user } = useContext(AuthContext)!; // Non-null assertion

  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Check for admin role
  if (user?.role !== 'admin') {
    // Optional: Redirect to a "Not Authorized" page or just signin
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;


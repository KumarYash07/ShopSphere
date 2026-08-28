import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 1. Not authenticated -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  // 2. Host user -> Redirect to Host / Seller Dashboard
  if (user?.role === 'host') {
    return <Navigate to="/seller" replace />;
  }

  // 3. Customer user (or non-admin role) -> Redirect to Customer Dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Admin user -> Render Admin Control Panel
  return children;
}


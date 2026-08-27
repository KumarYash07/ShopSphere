import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';

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

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className="container py-5 my-5 text-center">
          <div className="alert alert-danger p-4 d-inline-block shadow-sm rounded-3">
            <h4 className="alert-heading fw-bold">Admin Privileges Required</h4>
            <p className="mb-0">You do not have permission to access the ShopSphere Admin Control Panel.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return children;
}

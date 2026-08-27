import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';

export default function HostRoute({ children }) {
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
    return <Navigate to="/login?redirect=/seller" replace />;
  }

  if (user?.role !== 'host') {
    return (
      <>
        <Navbar />
        <div className="container py-5 my-5 text-center">
          <div className="alert alert-danger p-4 d-inline-block shadow-sm rounded-3">
            <h4 className="alert-heading fw-bold">Access Denied</h4>
            <p className="mb-0">You need a <strong>Host / Seller</strong> account to view this page.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (user?.status === 'pending') {
    return (
      <>
        <Navbar />
        <div className="container py-5 my-5">
          <div className="card border-warning shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-body text-center p-5">
              <div className="display-4 text-warning mb-3">⏳</div>
              <h3 className="fw-bold text-dark mb-3">Host Account Pending Approval</h3>
              <p className="text-secondary mb-4">
                Thank you for registering as a seller on ShopSphere! Your account is currently under review by our Admin team.
              </p>
              <div className="alert alert-warning py-2 px-3 small">
                You will be able to set up your store and publish products once your status is updated to <strong>active</strong>.
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (user?.status === 'blocked') {
    return (
      <>
        <Navbar />
        <div className="container py-5 my-5">
          <div className="card border-danger shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-body text-center p-5">
              <div className="display-4 text-danger mb-3">🚫</div>
              <h3 className="fw-bold text-dark mb-3">Host Account Blocked</h3>
              <p className="text-secondary mb-4">
                Your seller account has been blocked by the ShopSphere Administration.
              </p>
              <div className="alert alert-danger py-2 px-3 small">
                Access to the seller dashboard and store management is currently suspended. If you believe this is an error, please contact support.
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return children;
}

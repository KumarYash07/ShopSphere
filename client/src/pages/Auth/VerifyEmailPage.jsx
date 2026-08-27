import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !otp.trim()) {
      setError('Please provide both email and the OTP code sent to your inbox.');
      return;
    }

    setLoading(true);
    const res = await verifyEmail(email.trim(), otp.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
      }, 2000);
    } else {
      setError(res.error || 'Failed to verify OTP. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-light py-5 min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-primary text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
                  <div className="display-5 mb-2"><FiMail /></div>
                  <h3 className="fw-bold mb-1">Verify Your Email</h3>
                  <p className="small mb-0 opacity-75">
                    We sent a 6-digit OTP to your registered email address.
                  </p>
                </div>

                <div className="card-body p-4 p-md-5">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                      <FiAlertCircle className="flex-shrink-0" />
                      <div>{error}</div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                      <FiCheckCircle className="flex-shrink-0" />
                      <div>{successMsg}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Email Address</label>
                      <input
                        type="email"
                        className="form-control py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium small">OTP Code</label>
                      <input
                        type="text"
                        className="form-control py-2 text-center letter-spacing-2 fw-bold fs-4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                      />
                      <div className="form-text text-muted text-center mt-2">
                        Enter the 6-digit verification code. Code expires in 5 minutes.
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email <FiArrowRight />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-4 border-top pt-3">
                    <span className="small text-muted">Already verified? </span>
                    <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: '#4F46E5' }}>
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

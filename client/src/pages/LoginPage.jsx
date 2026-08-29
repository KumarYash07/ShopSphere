import { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { triggerGoogleAuth } from '../utils/googleAuth';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const redirectUrl = searchParams.get('redirect') || null;
  const initialMsg = location.state?.message || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState(initialMsg);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setError('');
    setInfoMsg(null);
    triggerGoogleAuth({
      onStart: () => setGoogleLoading(true),
      onSuccess: async (credential) => {
        setGoogleLoading(true);
        const res = await googleLogin(credential);
        setGoogleLoading(false);
        if (res.success) {
          const userRole = res.user?.role;
          if (redirectUrl) {
            navigate(redirectUrl);
          } else if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'host') {
            navigate('/seller');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(res.error || 'Google sign-in failed. Please try again.');
        }
      },
      onError: (err) => {
        setGoogleLoading(false);
        setError(err.message || 'Google sign-in failed. Please try again.');
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      const userRole = res.user?.role;
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'host') {
        navigate('/seller');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Decorative Glow Elements */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 440,
          background: 'white',
          borderRadius: 20,
          padding: '32px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              S
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#0f172a' }}>
              Shop<span style={{ color: '#4F46E5' }}>Sphere</span>
            </span>
          </Link>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              padding: '6px 12px',
              borderRadius: 8,
              background: '#f1f5f9',
              textDecoration: 'none',
            }}
          >
            <FiArrowLeft size={14} /> Back Home
          </Link>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 99, padding: 3, marginBottom: 20 }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 99,
              border: 'none',
              background: 'white',
              color: '#4F46E5',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 99,
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px',
            border: '1.5px solid #cbd5e1',
            borderRadius: 10,
            background: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: googleLoading ? 'wait' : 'pointer',
            marginBottom: 16,
            color: '#334155',
            opacity: googleLoading ? 0.7 : 1,
          }}
        >
          <FcGoogle size={20} /> {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>OR SIGN IN WITH EMAIL</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Info Message */}
        {infoMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
            <FiCheckCircle size={16} className="flex-shrink-0" />
            <div>{infoMsg}</div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
            <FiAlertCircle size={16} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <FiMail size={16} />
              </div>
              <input
                type="email"
                className="form-control ps-5 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: 14 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password</label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link feature coming soon!');
                }}
                style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <FiLock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control ps-5 pe-5 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: 14 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="form-check-input mt-0"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 rounded-3 fw-bold"
            disabled={loading}
            style={{ background: '#4F46E5', borderColor: '#4F46E5', fontSize: 15 }}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Signing in...
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
          Need a ShopSphere account?{' '}
          <Link to="/register" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
            Register Now →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

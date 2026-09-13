import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone, FiArrowLeft, FiAlertCircle, FiShield, FiEye, FiEyeOff
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { triggerGoogleAuth } from '../utils/googleAuth';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('type') === 'seller' || searchParams.get('role') === 'host' ? 'host' : 'user';
  const [role, setRole] = useState(initialRole); // 'user' or 'host'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setError('');
    triggerGoogleAuth({
      onStart: () => setGoogleLoading(true),
      onSuccess: async (credential) => {
        setGoogleLoading(true);
        const res = await googleLogin(credential);
        setGoogleLoading(false);
        if (res.success) {
          const userRole = res.user?.role;
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'host') {
            navigate('/seller');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(res.error || 'Google registration failed. Please try again.');
        }
      },
      onError: (err) => {
        setGoogleLoading(false);
        setError(err.message || 'Google registration failed. Please try again.');
      },
    });
  };

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role,
    });
    setLoading(false);

    if (res.success) {
      navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
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
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '20%',
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
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
          maxWidth: 480,
          background: 'white',
          borderRadius: 20,
          padding: '32px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
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
            onClick={() => navigate('/login')}
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
            Sign In
          </button>
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
            Register
          </button>
        </div>

        {/* Role Toggle: User vs Host */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Role
          </label>
          <div className="row g-2">
            <div className="col-6">
              <div
                onClick={() => setRole('user')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: role === 'user' ? '2px solid #4F46E5' : '1.5px solid #cbd5e1',
                  background: role === 'user' ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 18 }}>🛒</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: role === 'user' ? '#4F46E5' : '#334155' }}>Customer</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Buy products</div>
              </div>
            </div>
            <div className="col-6">
              <div
                onClick={() => setRole('host')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: role === 'host' ? '2px solid #4F46E5' : '1.5px solid #cbd5e1',
                  background: role === 'host' ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 18 }}>🏪</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: role === 'host' ? '#4F46E5' : '#334155' }}>Host / Seller</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Sell & manage store</div>
              </div>
            </div>
          </div>

          {/* Seller Notice */}
          {role === 'host' && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiShield size={16} className="flex-shrink-0" />
              <div>
                <strong>Seller Notice:</strong> Seller accounts require admin approval before selling products.
              </div>
            </div>
          )}
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
            padding: '9px',
            border: '1.5px solid #cbd5e1',
            borderRadius: 10,
            background: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: googleLoading ? 'wait' : 'pointer',
            marginBottom: 14,
            color: '#334155',
            opacity: googleLoading ? 0.7 : 1,
          }}
        >
          <FcGoogle size={18} /> {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        {/* Error Alert */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 13, color: '#991b1b' }}>
            <FiAlertCircle size={16} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>First Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control ps-4 py-2"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  style={{ fontSize: 13 }}
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Last Name</label>
              <input
                type="text"
                className="form-control py-2"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                style={{ fontSize: 13 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-control ps-4 py-2"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                style={{ fontSize: 13 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <FiPhone size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="tel"
                className="form-control ps-4 py-2"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                style={{ fontSize: 13 }}
                required
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control ps-4 py-2"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  style={{ fontSize: 13 }}
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Confirm Pass</label>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control ps-4 py-2"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  style={{ fontSize: 13 }}
                  required
                />
              </div>
            </div>
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
                Creating Account...
              </span>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 18, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
            Sign In →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = login(email, password);
    setLoading(false);
    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'seller') navigate('/seller');
      else navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const demoLogin = (role) => {
    const creds = {
      customer: { email: 'customer@demo.com', password: 'demo123' },
      seller: { email: 'seller@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'demo123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
    setError('');
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '16px',
        overflow: 'hidden',
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
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Centered Login Card */}
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
          borderRadius: 'var(--radius-2xl)',
          padding: '28px 32px 28px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              S
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--secondary-900)' }}>
              Shop<span style={{ color: 'var(--primary)' }}>Sphere</span>
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
              color: 'var(--text-muted)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--secondary-100)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <FiArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--secondary-100)', borderRadius: 'var(--radius-full)', padding: 3, marginBottom: 16 }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'white',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: 'var(--shadow-sm)',
              cursor: 'default',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div style={{ background: 'var(--primary-10)', border: '1px solid var(--primary-20)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            🚀 Quick 1-Click Demo Login:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { role: 'customer', label: 'Customer' },
              { role: 'seller', label: 'Seller' },
              { role: 'admin', label: 'Admin' },
            ].map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => demoLogin(item.role)}
                style={{
                  flex: 1,
                  padding: '5px 4px',
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'white',
                  border: '1.5px solid var(--primary-20)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Google Button */}
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '9px',
            border: '2px solid var(--secondary-200)',
            borderRadius: 'var(--radius-md)',
            background: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 14,
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--secondary-400)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--secondary-200)')}
        >
          <FcGoogle size={18} /> Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--danger-10)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              marginBottom: 12,
              fontSize: 12,
              color: 'var(--danger)',
              fontWeight: 500,
            }}
          >
            <FiAlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </motion.div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiMail size={15} />
              </div>
              <input
                type="email"
                className="input-custom"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo reset password: Enter demo credentials to log in!');
                }}
                style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiLock size={15} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-custom"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38, paddingRight: 38, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 14,
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Signing in...
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16, paddingTop: 10, borderTop: '1px solid var(--secondary-100)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Create Account →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

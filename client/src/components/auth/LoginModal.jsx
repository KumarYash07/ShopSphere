import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiMaximize2 } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const { showLogin, closeAuth, login, openRegister } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showLogin) { setEmail(''); setPassword(''); setError(''); }
  }, [showLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) { closeAuth(); }
    else { setError(result.error); }
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

  const openFullPage = () => {
    closeAuth();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {showLogin && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay"
            onClick={closeAuth}
          />

          {/* Modal Container */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 'calc(var(--z-modal) + 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                width: '100%', maxWidth: 440,
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--secondary-900) 0%, #1a1040 100%)',
                padding: '24px 28px 18px',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
                  <button
                    onClick={openFullPage}
                    title="Open Full Page View"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FiMaximize2 size={13} />
                  </button>
                  <button
                    onClick={closeAuth}
                    title="Close"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FiX size={15} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>S</div>
                  <span style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>Shop<span style={{ color: '#93C5FD' }}>Sphere</span></span>
                </div>
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>Welcome back 👋</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Sign in to access your account</p>
              </div>

              {/* Form Body */}
              <div style={{ padding: '20px 28px 24px' }}>
                {/* Google Button */}
                <button
                  type="button"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '10px', border: '2px solid var(--secondary-200)',
                    borderRadius: 'var(--radius-md)', background: 'white',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s', marginBottom: 14, color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--secondary-200)'}
                >
                  <FcGoogle size={18} /> Continue with Google
                </button>

                {/* Quick Demo Login Buttons */}
                <div style={{ background: 'var(--primary-10)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>🚀 1-Click Quick Demo Login</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['customer', 'seller', 'admin'].map(role => (
                      <button key={role} type="button" onClick={() => demoLogin(role)} style={{ flex: 1, padding: '5px 4px', fontSize: 11, fontWeight: 700, background: 'white', border: '1px solid var(--primary-20)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--primary)', textTransform: 'capitalize' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                      >{role}</button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><FiMail size={15} /></div>
                      <input
                        type="email"
                        className="input-custom"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ paddingLeft: 38, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                      <button type="button" style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot?</button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><FiLock size={15} /></div>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-custom"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ paddingLeft: 38, paddingRight: 38, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--danger-10)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}
                    >
                      <FiAlertCircle size={14} /> {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary-custom"
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '10px', borderRadius: 'var(--radius-md)', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Signing in...' : 'Sign In →'}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--secondary-100)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>New to ShopSphere?</span>
                  <button onClick={openRegister} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                    Create Account →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

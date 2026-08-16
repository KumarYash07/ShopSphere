import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone, FiShoppingBag,
  FiArrowLeft
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Personal Details', 'Account Type', 'Verify OTP'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    storeName: '',
    storeDesc: '',
    gst: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full Name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = '10-digit mobile required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1) {
      if (role === 'seller' && !form.storeName.trim()) {
        setErrors({ storeName: 'Store Name required for sellers' });
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
    }
    setStep((s) => s + 1);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleRegister = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = register({ ...form, role });
    setLoading(false);
    if (res.success) {
      if (role === 'seller') navigate('/seller');
      else navigate('/dashboard');
    }
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
      {/* Decorative Glow */}
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

      {/* Centered Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 450,
          background: 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px 32px 28px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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
        <div style={{ display: 'flex', background: 'var(--secondary-100)', borderRadius: 'var(--radius-full)', padding: 3, marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
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
            Sign In
          </button>
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
            Create Account
          </button>
        </div>

        {/* Step Progress Line */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Step {step + 1}: {STEPS[step]}</span>
            <span style={{ color: 'var(--text-muted)' }}>{step + 1}/3</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? 'var(--primary)' : 'var(--secondary-200)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Details */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '8px',
                  border: '2px solid var(--secondary-200)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 10,
                  color: 'var(--text-primary)',
                }}
              >
                <FcGoogle size={16} /> Sign up with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or details</span>
                <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div>
                  <div style={{ position: 'relative' }}>
                    <FiUser size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-custom"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      style={{ paddingLeft: 36, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
                    />
                  </div>
                  {errors.name && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0 }}>{errors.name}</p>}
                </div>

                <div>
                  <div style={{ position: 'relative' }}>
                    <FiMail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="input-custom"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      style={{ paddingLeft: 36, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
                    />
                  </div>
                  {errors.email && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0 }}>{errors.email}</p>}
                </div>

                <div>
                  <div style={{ position: 'relative' }}>
                    <FiPhone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="input-custom"
                      placeholder="Mobile Number"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      style={{ paddingLeft: 36, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
                    />
                  </div>
                  {errors.phone && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0 }}>{errors.phone}</p>}
                </div>

                <div>
                  <div style={{ position: 'relative' }}>
                    <FiLock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="input-custom"
                      placeholder="Password (min 6 chars)"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      style={{ paddingLeft: 36, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
                    />
                  </div>
                  {errors.password && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0 }}>{errors.password}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Role Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Select account type:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {[
                  { type: 'customer', icon: '🛒', title: 'Customer', subtitle: 'Browse & shop items' },
                  { type: 'seller', icon: '🏪', title: 'Seller / Merchant', subtitle: 'List products & grow business' },
                ].map((opt) => (
                  <div
                    key={opt.type}
                    onClick={() => setRole(opt.type)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: role === opt.type ? '2px solid var(--primary)' : '2px solid var(--secondary-200)',
                      background: role === opt.type ? 'var(--primary-10)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: role === opt.type ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.subtitle}</div>
                    </div>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${role === opt.type ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {role === opt.type && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                    </div>
                  </div>
                ))}
              </div>

              {role === 'seller' && (
                <div style={{ padding: 10, background: 'var(--secondary-100)', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <FiShoppingBag size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-custom"
                      placeholder="Store Name *"
                      value={form.storeName}
                      onChange={(e) => setField('storeName', e.target.value)}
                      style={{ paddingLeft: 32, paddingTop: 6, paddingBottom: 6, fontSize: 12 }}
                    />
                  </div>
                  {errors.storeName && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0 }}>{errors.storeName}</p>}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 4 }}>📱</div>
              <h4 style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Verify OTP</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
                Code sent to <strong>{form.phone || '9876543210'}</strong>
              </p>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className="otp-input"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    style={{ width: 42, height: 46, fontSize: 18 }}
                  />
                ))}
              </div>

              <div style={{ background: 'var(--primary-10)', borderRadius: 'var(--radius-md)', padding: '6px 10px', marginBottom: 10, fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                💡 Demo: Enter any 4 digits
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost"
              style={{ padding: '8px 14px', fontSize: 12 }}
            >
              Back
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary-custom"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '10px', borderRadius: 'var(--radius-md)' }}
            >
              {loading ? 'Processing...' : 'Continue →'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRegister}
              className="btn-primary-custom"
              disabled={loading || otp.some((d) => !d)}
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: 13,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                opacity: (loading || otp.some((d) => !d)) ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating...' : '🎉 Create Account'}
            </button>
          )}
        </div>

        {/* Footer Nav */}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--secondary-100)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

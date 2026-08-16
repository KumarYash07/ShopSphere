import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock, FiPhone, FiShoppingBag, FiCheck, FiArrowLeft, FiMaximize2 } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

const InputField = ({ icon: Icon, label, type = 'text', placeholder, value, onChange, error }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Icon size={14} /></div>}
      <input
        type={type}
        className="input-custom"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingLeft: Icon ? 36 : 14, paddingTop: 7, paddingBottom: 7, fontSize: 13, borderColor: error ? 'var(--danger)' : undefined }}
      />
    </div>
    {error && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 2, marginBottom: 0, fontWeight: 500 }}>{error}</p>}
  </div>
);

const STEPS = ['Personal Details', 'Account Type', 'Verify OTP'];

export default function RegisterModal() {
  const { showRegister, closeAuth, register, openLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', storeName: '', storeDesc: '', gst: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!showRegister) { setStep(0); setRole('customer'); setForm({ name: '', email: '', phone: '', password: '', storeName: '', storeDesc: '', gst: '' }); setOtp(['', '', '', '']); setErrors({}); }
  }, [showRegister]);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid 10-digit mobile required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setLoading(false);
    }
    setStep(s => s + 1);
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
    await new Promise(r => setTimeout(r, 600));
    register({ ...form, role });
    setLoading(false);
    closeAuth();
  };

  const openFullPage = () => {
    closeAuth();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {showRegister && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay" onClick={closeAuth} />

          <div style={{ position: 'fixed', inset: 0, zIndex: 'calc(var(--z-modal) + 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                width: '100%', maxWidth: 460,
                background: 'white', borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)', padding: '22px 24px 16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                  <button
                    onClick={openFullPage}
                    title="Open Full Page View"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FiMaximize2 size={13} />
                  </button>
                  <button
                    onClick={closeAuth}
                    title="Close"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FiX size={15} />
                  </button>
                </div>

                <div style={{ fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 2 }}>
                  Shop<span style={{ color: '#BAE6FD' }}>Sphere</span>
                </div>
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 19, margin: 0 }}>Create Your Account</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, marginBottom: 12 }}>
                  Step {step + 1} of {STEPS.length}: {STEPS[step]}
                </p>

                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {STEPS.map((label, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px 24px 22px' }}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {step === 0 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <button
                        type="button"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 9, border: '2px solid var(--secondary-200)', borderRadius: 'var(--radius-md)', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, color: 'var(--text-primary)' }}
                      >
                        <FcGoogle size={18} /> Continue with Google
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or enter details</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--secondary-200)' }} />
                      </div>
                      
                      <InputField icon={FiUser} label="Full Name" placeholder="John Doe" value={form.name} onChange={e => setField('name', e.target.value)} error={errors.name} />
                      <InputField icon={FiMail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setField('email', e.target.value)} error={errors.email} />
                      <InputField icon={FiPhone} label="Mobile Number" placeholder="9876543210" value={form.phone} onChange={e => setField('phone', e.target.value)} error={errors.phone} />
                      <InputField icon={FiLock} label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setField('password', e.target.value)} error={errors.password} />
                    </motion.div>
                  )}

                  {/* Step 2: Account Type */}
                  {step === 1 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                        Choose account type:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                        {[
                          { type: 'customer', icon: '🛒', title: 'Customer', subtitle: 'Shop products & earn coins' },
                          { type: 'seller', icon: '🏪', title: 'Seller / Merchant', subtitle: 'List products & sell nationwide' },
                        ].map(opt => (
                          <div
                            key={opt.type}
                            onClick={() => setRole(opt.type)}
                            style={{
                              padding: '12px 14px', borderRadius: 'var(--radius-md)',
                              border: role === opt.type ? '2px solid var(--primary)' : '2px solid var(--secondary-200)',
                              background: role === opt.type ? 'var(--primary-10)' : 'white',
                              cursor: 'pointer', transition: 'all 0.2s',
                              display: 'flex', alignItems: 'center', gap: 10,
                            }}
                          >
                            <div style={{ fontSize: 24 }}>{opt.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: role === opt.type ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.subtitle}</div>
                            </div>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${role === opt.type ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {role === opt.type && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                            </div>
                          </div>
                        ))}
                      </div>

                      {role === 'seller' && (
                        <div style={{ padding: 12, background: 'var(--secondary-100)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                          <InputField icon={FiShoppingBag} label="Store Name" placeholder="My Awesome Store" value={form.storeName} onChange={e => setField('storeName', e.target.value)} error={errors.storeName} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: OTP */}
                  {step === 2 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 44, marginBottom: 8 }}>📱</div>
                      <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Verify Number</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
                        OTP sent to <strong>{form.phone}</strong>
                      </p>

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            className="otp-input"
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKey(i, e)}
                            style={{ width: 44, height: 48, fontSize: 20 }}
                          />
                        ))}
                      </div>

                      <div style={{ background: 'var(--primary-10)', borderRadius: 'var(--radius-md)', padding: '6px 12px', marginBottom: 12, fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                        💡 Demo: Enter any 4 digits
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="btn-ghost"
                      style={{ padding: '9px 14px', fontSize: 13 }}
                    >
                      Back
                    </button>
                  )}
                  {step < 2 ? (
                    <button
                      onClick={handleNext}
                      className="btn-primary-custom"
                      disabled={loading}
                      style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: 10, borderRadius: 'var(--radius-md)' }}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="btn-primary-custom"
                      disabled={loading || otp.some(d => !d)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: 10, borderRadius: 'var(--radius-md)', opacity: (loading || otp.some(d => !d)) ? 0.7 : 1 }}
                    >
                      {loading ? 'Creating...' : '🎉 Create Account'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--secondary-100)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
                  <button onClick={openLogin} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                    Sign In →
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

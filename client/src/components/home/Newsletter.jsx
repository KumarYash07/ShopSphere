import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section style={{ padding: '60px 24px', maxWidth: 1440, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="newsletter-section"
      >
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-6">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', marginBottom: 16 }}>
                <span style={{ fontSize: 14 }}>📧</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Stay in the loop</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
                Get the Best Deals <br />
                <span style={{ color: 'var(--accent-light)' }}>First in Your Inbox</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7, maxWidth: 420 }}>
                Join 500,000+ smart shoppers who get early access to flash sales, exclusive coupons, and new arrivals every week.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                {['No spam ever', 'Exclusive deals', 'Unsubscribe anytime'].map(text => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div style={{ position: 'relative', zIndex: 1 }}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 32,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>You're in!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Welcome to the ShopSphere insider club. Check your inbox for a 10% welcome discount!</p>
                </motion.div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 32,
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>Your email address</div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
                        <FiMail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%', height: 52,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1.5px solid rgba(255,255,255,0.15)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0 16px 0 48px',
                          color: 'white', fontSize: 15,
                          outline: 'none', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="btn-accent-custom"
                    style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', borderRadius: 'var(--radius-md)' }}
                  >
                    Subscribe & Save 10% <FiArrowRight size={16} />
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12, marginBottom: 0 }}>
                    By subscribing you agree to our Privacy Policy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

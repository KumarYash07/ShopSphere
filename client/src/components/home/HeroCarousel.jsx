import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { heroBanners } from '../../data/dummy';

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % heroBanners.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + heroBanners.length) % heroBanners.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const banner = heroBanners[current];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div style={{ padding: '24px 24px 0', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', position: 'relative', minHeight: 480 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={banner.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'absolute', inset: 0,
              background: banner.gradient,
              display: 'flex', alignItems: 'center',
            }}
          >
            {/* Background Image */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <img
                src={banner.image}
                alt={banner.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, transform: 'scale(1.05)' }}
              />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '48px 60px', maxWidth: 600 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white', borderRadius: 'var(--radius-full)',
                  padding: '4px 14px', fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.3)',
                  marginBottom: 16,
                }}>
                  ✦ {banner.badge}
                </span>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
                  {banner.title}
                </h1>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>
                  {banner.subtitle}
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.6, maxWidth: 440 }}>
                  {banner.description}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link
                    to="/products"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'white', color: 'var(--secondary-900)',
                      borderRadius: 'var(--radius-full)',
                      padding: '12px 28px', fontWeight: 700, fontSize: 15,
                      textDecoration: 'none',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; }}
                  >
                    {banner.cta} →
                  </Link>
                  <Link
                    to="/offers"
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      color: 'white', borderRadius: 'var(--radius-full)',
                      padding: '12px 24px', fontWeight: 600, fontSize: 15,
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    View Deals
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Decorative Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="d-none d-lg-flex"
            >
              <div style={{ width: 320, height: 320, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', border: '4px solid rgba(255,255,255,0.15)' }}>
                <img src={banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <button
          onClick={() => { clearInterval(timerRef.current); prev(); }}
          style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        ><FiChevronLeft size={20} /></button>
        <button
          onClick={() => { clearInterval(timerRef.current); next(); }}
          style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        ><FiChevronRight size={20} /></button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              style={{
                width: i === current ? 24 : 8, height: 8,
                borderRadius: 'var(--radius-full)',
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.2)', zIndex: 10 }}>
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            style={{ height: '100%', background: 'white', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>
    </div>
  );
}

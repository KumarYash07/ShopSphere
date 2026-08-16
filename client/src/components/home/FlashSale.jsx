import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import ProductCard from '../product/ProductCard';
import { flashSaleProducts } from '../../data/dummy';
import { formatPrice } from '../../utils/helpers';

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(target.h, target.m, 0, 0);
      if (end < now) end.setDate(end.getDate() + 1);
      const diff = Math.max(0, end - now);
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target.h, target.m]);
  return timeLeft;
}

export default function FlashSale() {
  const timeLeft = useCountdown({ h: 23, m: 59 });
  const pad = n => String(n).padStart(2, '0');

  return (
    <section style={{ padding: '60px 24px 0', maxWidth: 1440, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1e1040 50%, #0F172A 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 100, width: 150, height: 150, background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
            <FiZap size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>⚡ Flash Sale</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Unbeatable prices — limited time only</div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>Ends in</span>
          {[
            { value: pad(timeLeft.h), label: 'HRS' },
            { value: pad(timeLeft.m), label: 'MIN' },
            { value: pad(timeLeft.s), label: 'SEC' },
          ].map(({ value, label }, i, arr) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  key={value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="timer-box"
                  style={{ display: 'inline-block', minWidth: 52, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {value}
                </motion.div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
              </div>
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>:</span>}
            </div>
          ))}
        </div>

        <Link to="/offers" className="btn-accent-custom" style={{ fontSize: 13, padding: '10px 24px', position: 'relative' }}>
          View All Deals →
        </Link>
      </div>

      {/* Products */}
      <div className="scroll-row">
        {flashSaleProducts.map((product, i) => (
          <div key={product.id} style={{ width: 240, flexShrink: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} showFlashPrice />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

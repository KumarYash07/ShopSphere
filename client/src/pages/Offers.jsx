import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/product/ProductCard';
import { products } from '../data/dummy';
import { formatPrice } from '../utils/helpers';

const OFFER_BANNERS = [
  { id: 1, title: 'Electronics Mega Sale', desc: 'Up to 40% off on phones, laptops & more', badge: '40% OFF', emoji: '💻', color: '#2563EB', bg: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' },
  { id: 2, title: 'Fashion Week', desc: 'Flat 50% off on top brands', badge: '50% OFF', emoji: '👗', color: '#8B5CF6', bg: 'linear-gradient(135deg, #1a0040 0%, #3b1080 100%)' },
  { id: 3, title: 'Home Makeover', desc: 'Furniture & décor at unbeatable prices', badge: '30% OFF', emoji: '🏠', color: '#10B981', bg: 'linear-gradient(135deg, #002718 0%, #014029 100%)' },
];

export default function Offers() {
  const saleProducts = products.filter(p => p.discount >= 20).sort((a, b) => b.discount - a.discount);

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1440, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-flex', marginBottom: 12 }}>⚡ Limited Time</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Best <span className="gradient-text-accent">Offers</span> Today
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Save big on top brands. Deals refreshed every 24 hours.</p>
        </div>

        {/* Offer Banners */}
        <div className="row g-3 mb-5">
          {OFFER_BANNERS.map((banner, i) => (
            <div key={banner.id} className="col-12 col-md-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/products" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    background: banner.bg,
                    borderRadius: 'var(--radius-xl)',
                    padding: '28px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.15 }}>{banner.emoji}</div>
                    <div style={{ background: banner.color, color: 'white', borderRadius: 'var(--radius-full)', padding: '3px 12px', fontSize: 12, fontWeight: 800, display: 'inline-block', marginBottom: 12 }}>{banner.badge}</div>
                    <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{banner.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 }}>{banner.desc}</p>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Shop Now →</div>
                  </div>
                </Link>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Products with discount */}
        <div className="section-header">
          <div className="section-tag">🔥 Best Discounts</div>
          <h2 className="section-title">Sorted by Highest Discount</h2>
        </div>
        <div className="product-grid">
          {saleProducts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

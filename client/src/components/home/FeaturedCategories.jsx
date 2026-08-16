import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '../../data/dummy';

export default function FeaturedCategories() {
  return (
    <section style={{ padding: '60px 24px 0', maxWidth: 1440, margin: '0 auto' }}>
      <div className="section-header d-flex align-items-end justify-content-between">
        <div>
          <div className="section-tag">🛒 Shop by Category</div>
          <h2 className="section-title">Explore Our World</h2>
          <p className="section-subtitle">Discover thousands of products across every category</p>
        </div>
        <Link to="/categories" className="btn-outline-custom d-none d-md-inline-flex" style={{ fontSize: 13, marginBottom: 16, padding: '8px 20px' }}>
          All Categories →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="categories-grid">
        {categories.slice(0, 8).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link
              to={`/products?category=${cat.name}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="category-card"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}08 100%)`,
                  border: `1px solid ${cat.color}25`,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 64, height: 64,
                  background: `linear-gradient(135deg, ${cat.color}25 0%, ${cat.color}10 100%)`,
                  borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                  boxShadow: `0 4px 16px ${cat.color}20`,
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.productCount.toLocaleString()} items</div>
                </div>
                <div style={{
                  width: '100%', height: 3,
                  background: `linear-gradient(90deg, ${cat.color} 0%, transparent 100%)`,
                  borderRadius: 'var(--radius-full)',
                  opacity: 0.4,
                }} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <style>{`
        .categories-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 992px) {
          .categories-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .categories-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}

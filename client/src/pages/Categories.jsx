import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { categories } from '../data/dummy';

export default function Categories() {
  return (
    <MainLayout>
      <div style={{ padding: '40px 24px', maxWidth: 1440, margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-flex', marginBottom: 12 }}>🗂️ Browse All</div>
          <h1 className="section-title">All Categories</h1>
          <p className="section-subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>Explore our full range of product categories</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <Link to={`/products?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                <div className="category-card card-premium" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '2/1', position: 'relative', overflow: 'hidden' }}>
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${cat.color}90 0%, ${cat.color}30 100%)` }} />
                    <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                      <div style={{ fontSize: 36, marginBottom: 4 }}>{cat.icon}</div>
                      <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{cat.name}</h3>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.productCount.toLocaleString()} products</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>Browse →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

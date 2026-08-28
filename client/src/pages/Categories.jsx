import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getCategoriesApi } from '../api/categoryApi';

const DEFAULT_COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7', '#DB2777', '#475569'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategoriesApi();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <MainLayout>
      <div style={{ padding: '40px 24px', maxWidth: 1440, margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-flex', marginBottom: 12 }}>🗂️ Browse All</div>
          <h1 className="section-title">All Categories</h1>
          <p className="section-subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>Explore our full range of product categories</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted small mt-2">Loading marketplace categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4 my-4">
            <p className="text-muted mb-0">No active categories found in the marketplace.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
            {categories.map((cat, i) => {
              const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
              const categoryImg = cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
              return (
                <motion.div key={cat._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/products?category=${cat._id}`} style={{ textDecoration: 'none' }}>
                    <div className="category-card card-premium" style={{ overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '2/1', position: 'relative', overflow: 'hidden' }}>
                        <img src={categoryImg} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}90 0%, ${color}30 100%)` }} />
                        <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: 'white', background: color, width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{cat.name}</h3>
                        </div>
                      </div>
                      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.description || 'Explore collection'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: color }}>Browse →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


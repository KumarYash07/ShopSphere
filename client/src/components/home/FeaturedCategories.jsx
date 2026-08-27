import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getCategoriesApi } from '../../api/categoryApi';

const DEFAULT_COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7', '#DB2777', '#475569'];

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategoriesApi();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load featured categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="container py-4 my-2">
      <div className="d-flex align-items-end justify-content-between mb-4">
        <div>
          <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold text-uppercase mb-2" style={{ background: '#eef2ff', color: '#4F46E5', fontSize: 11 }}>
            🛒 Shop by Category
          </div>
          <h2 className="fw-bold text-dark mb-1">Explore Marketplace</h2>
          <p className="text-muted mb-0 small">Browse products curated across top active categories</p>
        </div>
        <Link to="/categories" className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-semibold d-none d-md-inline-flex">
          All Categories →
        </Link>
      </div>

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <div className="bg-secondary-subtle rounded-circle mx-auto mb-3 animate-pulse" style={{ width: 60, height: 60 }} />
                <div className="bg-secondary-subtle rounded w-50 mx-auto h-4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-4">
          <p className="text-muted mb-0">No categories found in store.</p>
        </div>
      ) : (
        <div className="row g-3">
          {categories.slice(0, 8).map((cat, i) => {
            const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <div key={cat._id} className="col-6 col-md-4 col-lg-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={`/products?category=${cat._id}`}
                    className="text-decoration-none"
                  >
                    <div
                      className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 position-relative overflow-hidden hover-lift"
                      style={{
                        background: `linear-gradient(135deg, ${color}12 0%, ${color}04 100%)`,
                        border: `1px solid ${color}20`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div
                        className="rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                        style={{
                          width: 60,
                          height: 60,
                          background: color,
                          color: 'white',
                          fontSize: 24,
                          fontWeight: 'bold',
                        }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                      <span className="small text-muted text-truncate d-block">{cat.description || 'Explore collection'}</span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

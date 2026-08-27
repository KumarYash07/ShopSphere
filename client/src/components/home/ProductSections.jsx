import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { getProductsApi } from '../../api/productApi';

function ProductSection({ tag, title, subtitle, sortParam, cta, ctaPath, icon }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsApi({ sort: sortParam });
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(`Failed to load ${tag} products:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchSectionProducts();
  }, [sortParam, tag]);

  return (
    <section className="container py-4 my-2">
      <div className="d-flex align-items-end justify-content-between mb-4">
        <div>
          <div className="badge bg-indigo-subtle text-indigo px-3 py-2 rounded-pill fw-bold text-uppercase mb-2" style={{ background: '#eef2ff', color: '#4F46E5', fontSize: 11 }}>
            {icon} {tag}
          </div>
          <h2 className="fw-bold text-dark mb-1">{title}</h2>
          {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
        </div>
        <Link to={ctaPath} className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-semibold d-none d-md-inline-flex">
          {cta} →
        </Link>
      </div>

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="col-6 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-3" style={{ height: 280 }}>
                <div className="bg-secondary-subtle rounded-3 h-50 mb-3 animate-pulse" />
                <div className="bg-secondary-subtle rounded w-75 h-4 mb-2 animate-pulse" />
                <div className="bg-secondary-subtle rounded w-50 h-4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <p className="text-muted mb-0">No products found in this section yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {products.slice(0, 8).map((p, i) => (
            <div key={p._id || p.id} className="col-6 col-md-4 col-lg-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="h-100"
              >
                <ProductCard product={p} />
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TrendingProducts() {
  return <ProductSection tag="Trending Now" title="What's Hot" subtitle="Discover the most popular picks" sortParam="rating" cta="See All Trending" ctaPath="/products?sort=rating" icon="🔥" />;
}

export function BestSellers() {
  return <ProductSection tag="Best Sellers" title="Customer Favorites" subtitle="Top-rated products loved by everyone" sortParam="rating" cta="See All Best Sellers" ctaPath="/products?sort=rating" icon="⭐" />;
}

export function NewArrivals() {
  return <ProductSection tag="New Arrivals" title="Just Dropped" subtitle="Fresh picks added recently" sortParam="newest" cta="See All New" ctaPath="/products?sort=newest" icon="✨" />;
}

export function TodayDeals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await getProductsApi();
        if (data.success && data.products) {
          // Filter products that have discount > 0
          const discounted = data.products.filter(p => (p.discount || 0) > 0);
          setDeals(discounted.length > 0 ? discounted : data.products);
        }
      } catch (err) {
        console.error('Failed to load deals:', err);
      }
    };
    fetchDeals();
  }, []);

  return (
    <section className="container py-4 my-2">
      <div className="d-flex align-items-end justify-content-between mb-4">
        <div>
          <div className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold text-uppercase mb-2" style={{ background: '#fef2f2', color: '#ef4444', fontSize: 11 }}>
            💸 Today's Deals
          </div>
          <h2 className="fw-bold text-dark mb-1">Best Discounted Deals</h2>
          <p className="text-muted mb-0 small">Handpicked offers with maximum savings</p>
        </div>
        <Link to="/products?sort=price_low" className="btn btn-outline-danger rounded-pill px-4 btn-sm fw-semibold d-none d-md-inline-flex">
          View All Deals →
        </Link>
      </div>

      <div className="row g-3">
        {deals.slice(0, 4).map((p, i) => (
          <div key={p._id || p.id} className="col-6 col-md-4 col-lg-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="h-100"
            >
              <ProductCard product={p} />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

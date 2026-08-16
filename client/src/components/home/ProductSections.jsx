import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { trendingProducts, bestSellers, newArrivals } from '../../data/dummy';

function ProductSection({ tag, title, subtitle, products, cta, ctaPath, icon }) {
  return (
    <section style={{ padding: '60px 24px 0', maxWidth: 1440, margin: '0 auto' }}>
      <div className="section-header d-flex align-items-end justify-content-between">
        <div>
          <div className="section-tag">{icon} {tag}</div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <Link to={ctaPath} className="btn-outline-custom d-none d-md-inline-flex" style={{ fontSize: 13, marginBottom: 16, padding: '8px 20px' }}>
          {cta} →
        </Link>
      </div>
      <div className="product-grid">
        {products.slice(0, 8).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function TrendingProducts() {
  return <ProductSection tag="Trending Now" title="What's Hot" subtitle="Discover the most popular picks of the week" products={trendingProducts} cta="See All Trending" ctaPath="/products?filter=trending" icon="🔥" />;
}

export function BestSellers() {
  return <ProductSection tag="Best Sellers" title="Customer Favorites" subtitle="Top-rated products loved by thousands" products={bestSellers} cta="See All Best Sellers" ctaPath="/products?filter=bestsellers" icon="⭐" />;
}

export function NewArrivals() {
  return <ProductSection tag="New Arrivals" title="Just Dropped" subtitle="Fresh picks added this week" products={newArrivals} cta="See All New" ctaPath="/products?filter=new" icon="✨" />;
}

export function TodayDeals() {
  return (
    <section style={{ padding: '60px 24px 0', maxWidth: 1440, margin: '0 auto' }}>
      <div className="section-header d-flex align-items-end justify-content-between">
        <div>
          <div className="section-tag">💸 Today's Deals</div>
          <h2 className="section-title">Best Deals Today</h2>
          <p className="section-subtitle">Handpicked deals refreshed daily — don't miss out</p>
        </div>
        <Link to="/offers" className="btn-outline-custom d-none d-md-inline-flex" style={{ fontSize: 13, marginBottom: 16, padding: '8px 20px' }}>View All →</Link>
      </div>
      <div className="scroll-row">
        {trendingProducts.slice(0, 6).map((p, i) => (
          <div key={p.id} style={{ width: 240, flexShrink: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard product={p} />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

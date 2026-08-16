import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function MegaMenu({ categories }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        left: 0,
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--secondary-200)',
        padding: 24,
        minWidth: 480,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        zIndex: 1000,
      }}
    >
      <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>All Categories</p>
      </div>
      {categories.map(cat => (
        <Link
          key={cat.id}
          to={`/products?category=${cat.name}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', transition: 'all 0.15s',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 36, height: 36,
            background: cat.color + '15',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {cat.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{cat.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.productCount.toLocaleString()} Products</div>
          </div>
        </Link>
      ))}
      <div style={{ gridColumn: '1 / -1', paddingTop: 12, borderTop: '1px solid var(--secondary-100)', marginTop: 8 }}>
        <Link
          to="/categories"
          className="btn-outline-custom"
          style={{ fontSize: 13, padding: '8px 20px', display: 'inline-flex', borderRadius: 'var(--radius-full)' }}
        >
          View All Categories →
        </Link>
      </div>
    </motion.div>
  );
}

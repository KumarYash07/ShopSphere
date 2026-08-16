import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';

export default function NotFound() {
  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', minHeight: '70vh' }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Animated 404 */}
          <div className="error-code" style={{ marginBottom: 16 }}>404</div>

          {/* Floating Icon */}
          <div className="animate-float" style={{ fontSize: 64, marginBottom: 24 }}>🛸</div>

          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 16, color: 'var(--text-primary)' }}>
            Oops! Page Not Found
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.7 }}>
            The page you're looking for seems to have drifted into the cosmos. Let's get you back to shopping!
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-primary-custom" style={{ fontSize: 15, padding: '13px 32px' }}>
              🏠 Go Home
            </Link>
            <Link to="/products" className="btn-outline-custom" style={{ fontSize: 15, padding: '13px 32px' }}>
              🛒 Browse Products
            </Link>
          </div>

          {/* Quick Links */}
          <div style={{ marginTop: 48 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Popular pages:</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Electronics', path: '/products?category=Electronics' },
                { label: 'Fashion', path: '/products?category=Fashion' },
                { label: 'Offers', path: '/offers' },
                { label: 'New Arrivals', path: '/products?filter=new' },
              ].map(({ label, path }) => (
                <Link key={label} to={path} className="tag">{label}</Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

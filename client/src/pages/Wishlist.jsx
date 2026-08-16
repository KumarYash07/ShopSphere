import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, openLogin } = useAuth();

  if (!user) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">❤️</span>
          <h3 className="empty-state-title">Login to View Wishlist</h3>
          <p className="empty-state-text">Save your favorite products and never miss a deal.</p>
          <button className="btn-primary-custom" onClick={openLogin}>Login Now</button>
        </div>
      </MainLayout>
    );
  }

  if (wishlist.length === 0) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">❤️</span>
          <h3 className="empty-state-title">Your wishlist is empty</h3>
          <p className="empty-state-text">Save products you love and shop them later.</p>
          <Link to="/products" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Explore Products →</Link>
        </div>
      </MainLayout>
    );
  }

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <FiHeart size={24} style={{ color: 'var(--danger)' }} />
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>My Wishlist</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="product-grid">
          <AnimatePresence>
            {wishlist.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                layout
              >
                <div className="card-premium" style={{ overflow: 'hidden' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--secondary-100)' }}>
                    <Link to={`/products/${product.id}`}>
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    </Link>
                    {product.discount > 0 && <span className="discount-badge" style={{ position: 'absolute', top: 10, left: 10 }}>-{product.discount}%</span>}
                    <button onClick={() => removeFromWishlist(product.id)} className="wishlist-btn active" title="Remove from wishlist">
                      <FiTrash2 size={15} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</div>
                    <Link to={`/products/${product.id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10, textDecoration: 'none' }}>
                      {product.name}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      <span className="price-current">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && <span className="price-original">{formatPrice(product.originalPrice)}</span>}
                    </div>
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="btn-primary-custom"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }}
                    >
                      <FiShoppingCart size={14} /> Move to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

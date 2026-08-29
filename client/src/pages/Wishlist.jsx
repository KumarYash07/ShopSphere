import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user, openLogin } = useAuth();

  if (!user) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
          <span className="empty-state-icon" style={{ fontSize: 48 }}>❤️</span>
          <h3 className="empty-state-title mt-3 fw-bold">Login to View Wishlist</h3>
          <p className="empty-state-text text-muted mb-4">Save your favorite products and never miss a deal.</p>
          <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold" style={{ background: '#4F46E5' }} onClick={openLogin}>
            Login Now
          </button>
        </div>
      </MainLayout>
    );
  }

  if (loading && wishlist.length === 0) {
    return (
      <MainLayout>
        <div className="container py-5 text-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Loading your wishlist...</p>
        </div>
      </MainLayout>
    );
  }

  if (wishlist.length === 0) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
          <span className="empty-state-icon" style={{ fontSize: 48 }}>❤️</span>
          <h3 className="empty-state-title mt-3 fw-bold">Your wishlist is empty</h3>
          <p className="empty-state-text text-muted mb-4">Save products you love and shop them later.</p>
          <Link to="/products" className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2" style={{ background: '#4F46E5' }}>
            Explore Products <FiArrowRight />
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleMoveToCart = (product) => {
    const pId = product._id || product.id;
    addToCart(product);
    removeFromWishlist(pId);
  };

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', minHeight: '70vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div className="p-2 rounded-circle bg-danger-subtle d-flex align-items-center justify-content-center">
            <FiHeart size={24} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>My Wishlist</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="product-grid">
          <AnimatePresence>
            {wishlist.map((product, i) => {
              const pId = product._id || product.id;
              const pImg = Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
              const origPrice = Number(product.price) || 0;
              const curPrice = product.finalPrice !== undefined ? Number(product.finalPrice) : origPrice;

              return (
                <motion.div
                  key={pId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  layout
                >
                  <div className="card-premium h-100 d-flex flex-column justify-content-between" style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: 16 }}>
                    {/* Image */}
                    <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#f8fafc' }}>
                      <Link to={`/products/${pId}`}>
                        <img
                          src={pImg}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      </Link>
                      {product.discount > 0 && (
                        <span className="badge bg-danger position-absolute top-0 start-0 m-2 rounded-2 fw-bold">
                          -{product.discount}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(pId)}
                        className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2 shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, background: 'white' }}
                        title="Remove from wishlist"
                      >
                        <FiTrash2 size={15} style={{ color: '#ef4444' }} />
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                      <div>
                        {product.brand && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', marginBottom: 4 }}>
                            {product.brand}
                          </div>
                        )}
                        <Link
                          to={`/products/${pId}`}
                          style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10, textDecoration: 'none' }}
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                          <span className="fw-bold text-dark fs-5">{formatPrice(curPrice)}</span>
                          {product.discount > 0 && origPrice > curPrice && (
                            <span className="text-muted text-decoration-line-through small">{formatPrice(origPrice)}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(product)}
                          className="btn btn-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                          style={{ background: '#4F46E5', borderColor: '#4F46E5', fontSize: 13, padding: '10px' }}
                        >
                          <FiShoppingCart size={14} /> Move to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

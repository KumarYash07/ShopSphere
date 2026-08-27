import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/helpers';

export default function ProductCard({ product }) {
  const { isAuthenticated, openLogin } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const navigate = useNavigate();

  if (!product) return null;

  const productId = product._id || product.id;
  const wishlisted = isWishlisted(productId);

  const originalPrice = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = product.finalPrice !== undefined
    ? Number(product.finalPrice)
    : Number((originalPrice - (originalPrice * discount) / 100).toFixed(2));

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const rating = Number(product.rating) || 4.5;
  const reviewsCount = Number(product.totalReviews ?? product.reviews ?? 12);
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';

  const handleCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    const res = addToCart(product);
    if (res.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    toggleWishlist(product);
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

  return (
    <div
      role="article"
      onClick={() => navigate(`/products/${productId}`)}
      style={{ textDecoration: 'none', display: 'block', cursor: 'pointer', height: '100%' }}
    >
      <div
        className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative"
        style={{
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Product Image Box */}
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#f8fafc' }}>
          {!imgLoaded && (
            <div className="position-absolute inset-0 bg-secondary-subtle animate-pulse" />
          )}
          <motion.img
            src={images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Badges */}
          <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
            {discount > 0 && (
              <span className="badge bg-danger rounded-2 fw-bold" style={{ fontSize: 11 }}>
                {discount}% OFF
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-dark rounded-2 fw-bold" style={{ fontSize: 10 }}>
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlist}
            className="btn btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm d-flex align-items-center justify-content-center"
            style={{
              width: 34,
              height: 34,
              background: wishlisted ? '#fef2f2' : 'white',
              border: wishlisted ? '1px solid #fecaca' : 'none',
            }}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart
              size={16}
              style={{ fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#64748b' }}
            />
          </button>

          {/* Hover Actions Bar */}
          <AnimatePresence>
            {hovered && !isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="position-absolute bottom-0 start-0 end-0 p-2 d-flex gap-2"
                style={{
                  background: 'linear-gradient(0deg, rgba(15,23,42,0.8) 0%, transparent 100%)',
                }}
              >
                <button
                  type="button"
                  onClick={handleCart}
                  className={`btn btn-sm flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 ${
                    addedToCart ? 'btn-success' : 'btn-light'
                  }`}
                  style={{ fontSize: 12 }}
                >
                  <FiShoppingCart size={14} />
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${productId}`);
                  }}
                  className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                  title="View Details"
                >
                  <FiEye size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Details Body */}
        <div className="card-body p-3 d-flex flex-column justify-content-between">
          <div>
            {/* Brand */}
            {product.brand && (
              <div className="text-uppercase fw-bold text-primary mb-1" style={{ fontSize: 10, letterSpacing: '0.05em' }}>
                {product.brand}
              </div>
            )}

            {/* Title */}
            <h6 className="card-title text-dark fw-semibold mb-2 text-truncate-2" style={{ fontSize: 14, minHeight: '38px', lineHeight: 1.3 }}>
              {product.name}
            </h6>

            {/* Rating */}
            <div className="d-flex align-items-center gap-1 mb-2">
              <div className="d-flex text-warning">
                {stars.map((filled, i) => (
                  <FiStar key={i} size={12} style={{ fill: filled ? '#f59e0b' : 'none', color: filled ? '#f59e0b' : '#cbd5e1' }} />
                ))}
              </div>
              <span className="small fw-semibold text-secondary">{rating}</span>
              <span className="small text-muted">({reviewsCount})</span>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fw-bold text-dark fs-5">{formatPrice(finalPrice)}</span>
              {discount > 0 && originalPrice > finalPrice && (
                <span className="text-muted text-decoration-line-through small">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* Stock indicator */}
            {isOutOfStock ? (
              <div className="text-danger fw-semibold mt-1" style={{ fontSize: 11 }}>
                Currently Unavailable
              </div>
            ) : product.stock > 0 && product.stock <= 5 ? (
              <div className="text-warning-dark fw-semibold mt-1" style={{ fontSize: 11 }}>
                Only {product.stock} left in stock!
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

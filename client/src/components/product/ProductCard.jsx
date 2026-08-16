import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/helpers';

export default function ProductCard({ product, showFlashPrice = false }) {
  const { user, openLogin } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);

  const price = showFlashPrice && product.flashSalePrice ? product.flashSalePrice : product.price;
  const originalPrice = product.originalPrice;
  const discount = Math.round((1 - price / originalPrice) * 100);

  const handleCart = (e) => {
    e.preventDefault();
    if (!user) { openLogin(); return; }
    addToCart({ ...product, price });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { openLogin(); return; }
    toggleWishlist(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) { openLogin(); return; }
    addToCart({ ...product, price });
    navigate('/checkout');
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(product.rating));

  return (
    <div
      role="article"
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
    >
      <div
        className="card-premium"
        style={{ overflow: 'hidden', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--secondary-100)' }}>
          {/* Skeleton */}
          {!imgLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
          <motion.img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {discount > 0 && (
              <span className="discount-badge">-{discount}%</span>
            )}
            {product.isNew && (
              <span style={{ background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>NEW</span>
            )}
            {showFlashPrice && product.flashSalePrice && (
              <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <FiZap size={9} /> FLASH
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart
              size={16}
              style={{ fill: wishlisted ? 'var(--danger)' : 'none', color: wishlisted ? 'var(--danger)' : 'var(--text-secondary)', transition: 'all 0.2s' }}
            />
          </button>

          {/* Hover Actions */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: 10,
                  display: 'flex', gap: 6,
                  background: 'linear-gradient(0deg, rgba(15,23,42,0.8) 0%, transparent 100%)',
                }}
              >
                <button
                  onClick={handleCart}
                  style={{
                    flex: 1,
                    background: addedToCart ? 'var(--success)' : 'white',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    padding: '8px 4px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 5,
                    color: addedToCart ? 'white' : 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <FiShoppingCart size={13} />
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <FiEye size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 16px' }}>
          {/* Brand */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {product.brand}
          </div>

          {/* Name */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {stars.map((filled, i) => (
                <FiStar key={i} size={12} style={{ fill: filled ? '#F59E0B' : 'none', color: filled ? '#F59E0B' : 'var(--secondary-300)', flexShrink: 0 }} />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{product.rating}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({product.reviews.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="price-current">{formatPrice(price)}</span>
            {originalPrice > price && (
              <span className="price-original">{formatPrice(originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="price-discount">{discount}% off</span>
            )}
          </div>

          {/* Stock Warning */}
          {product.stock < 20 && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>
              Only {product.stock} left!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

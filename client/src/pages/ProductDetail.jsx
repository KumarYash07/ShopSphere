import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShoppingCart, FiZap, FiStar, FiPackage, FiShield,
  FiTruck, FiRotateCcw, FiChevronRight, FiShare2, FiMinus, FiPlus, FiCheck
} from 'react-icons/fi';
import { HiBadgeCheck } from 'react-icons/hi';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/product/ProductCard';
import { products, reviews } from '../data/dummy';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const product = products.find(p => p.id === Number(id));
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const wishlisted = product ? isWishlisted(product.id) : false;

  if (!product) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <span className="empty-state-icon">📦</span>
          <h3 className="empty-state-title">Product not found</h3>
          <p className="empty-state-text">This product doesn't exist or has been removed.</p>
          <Link to="/products" className="btn-primary-custom">Browse Products</Link>
        </div>
      </MainLayout>
    );
  }

  const productReviews = reviews.filter(r => r.productId === product.id);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(product.rating));

  const handleCart = () => {
    if (!user) { openLogin(); return; }
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) { openLogin(); return; }
    addToCart(product, qty);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!user) { openLogin(); return; }
    toggleWishlist(product);
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: productReviews.filter(rv => Math.round(rv.rating) === r).length,
    pct: Math.round((productReviews.filter(rv => Math.round(rv.rating) === r).length / Math.max(productReviews.length, 1)) * 100),
  }));

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1440, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <FiChevronRight size={12} />
          <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Products</Link>
          <FiChevronRight size={12} />
          <Link to={`/products?category=${product.category}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{product.category}</Link>
          <FiChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name.substring(0, 30)}...</span>
        </nav>

        <div className="row g-5">
          {/* ── Left: Image Gallery ── */}
          <div className="col-12 col-lg-5">
            <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
              {/* Main Image */}
              <div style={{
                borderRadius: 'var(--radius-2xl)',
                overflow: 'hidden',
                background: 'var(--secondary-100)',
                aspectRatio: '1/1',
                position: 'relative',
                marginBottom: 12,
              }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImg}
                    src={product.images[selectedImg]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </AnimatePresence>

                {/* Badges */}
                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
                  {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
                  {product.isNew && <span style={{ background: 'var(--success)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>NEW</span>}
                </div>

                {/* Wishlist */}
                <button
                  className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={handleWishlist}
                  style={{ top: 14, right: 14 }}
                >
                  <FiHeart size={17} style={{ fill: wishlisted ? 'var(--danger)' : 'none', color: wishlisted ? 'var(--danger)' : 'var(--text-secondary)' }} />
                </button>

                {/* Share */}
                <button style={{ position: 'absolute', top: 56, right: 14, width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiShare2 size={15} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      style={{
                        width: 68, height: 68, flexShrink: 0,
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: selectedImg === i ? '2px solid var(--primary)' : '2px solid var(--secondary-200)',
                        cursor: 'pointer', padding: 0, background: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Center: Product Info ── */}
          <div className="col-12 col-lg-4">
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{product.brand}</span>
              {product.seller.verified && <HiBadgeCheck size={16} style={{ color: 'var(--primary)' }} />}
            </div>

            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: 16, color: 'var(--text-primary)' }}>
              {product.name}
            </h1>

            {/* Rating Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF3C7', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                <FiStar size={13} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>{product.rating}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.reviews.toLocaleString()} Reviews</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.sold.toLocaleString()} Sold</span>
            </div>

            {/* Price */}
            <div style={{ padding: '20px 0', borderTop: '1px solid var(--secondary-100)', borderBottom: '1px solid var(--secondary-100)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="price-original" style={{ fontSize: 18 }}>{formatPrice(product.originalPrice)}</span>
                    <span className="discount-badge" style={{ fontSize: 13, padding: '3px 10px' }}>{product.discount}% OFF</span>
                  </>
                )}
              </div>
              {product.originalPrice > product.price && (
                <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                  You save {formatPrice(product.originalPrice - product.price)}!
                </p>
              )}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {product.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            {/* Qty Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--secondary-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 18, fontWeight: 700 }}><FiMinus /></button>
                <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 18, fontWeight: 700 }}><FiPlus /></button>
              </div>
              <span style={{ fontSize: 12, color: product.stock < 20 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                {product.stock < 20 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
              </span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 10, flexDirection: 'column', marginBottom: 20 }}>
              <button
                onClick={handleCart}
                className="btn-outline-custom"
                style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', borderRadius: 'var(--radius-md)' }}
              >
                {addedToCart ? <><FiCheck size={16} /> Added to Cart!</> : <><FiShoppingCart size={16} /> Add to Cart</>}
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-primary-custom"
                style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', borderRadius: 'var(--radius-md)' }}
              >
                <FiZap size={16} /> Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <FiTruck />, text: 'Free Delivery', sub: 'Orders over ₹499' },
                { icon: <FiRotateCcw />, text: 'Easy Returns', sub: '7-day return policy' },
                { icon: <FiShield />, text: 'Secure Payment', sub: '100% Protected' },
                { icon: <FiPackage />, text: 'Genuine Product', sub: 'Seller Verified' },
              ].map(({ icon, text, sub }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'var(--secondary-100)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--primary)', fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Sticky Purchase Card ── */}
          <div className="col-12 col-lg-3 d-none d-lg-block">
            <div className="sticky-purchase-card">
              {/* Seller Info */}
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--secondary-100)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Sold by</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {product.seller.name}
                      {product.seller.verified && <HiBadgeCheck size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <FiStar size={11} style={{ color: '#F59E0B', fill: '#F59E0B', marginRight: 3 }} />
                      {product.seller.rating} Rating
                    </div>
                  </div>
                  <button style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View Store</button>
                </div>
              </div>

              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>{formatPrice(product.price)}</div>
              {product.originalPrice > product.price && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span className="price-original">{formatPrice(product.originalPrice)}</span>
                  <span className="discount-badge">{product.discount}% off</span>
                </div>
              )}

              {/* Delivery */}
              <div style={{ padding: 12, background: 'var(--success-10)', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiTruck size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>FREE Delivery</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estimated 2-3 business days</div>
                </div>
              </div>

              <button onClick={handleCart} className="btn-outline-custom" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                {addedToCart ? <><FiCheck /> Added!</> : <><FiShoppingCart size={15} /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow} className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center' }}>
                <FiZap size={15} /> Buy Now
              </button>

              <button onClick={handleWishlist} style={{ width: '100%', marginTop: 10, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: wishlisted ? 'var(--danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <FiHeart size={14} style={{ fill: wishlisted ? 'var(--danger)' : 'none' }} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs / Reviews */}
        <div style={{ marginTop: 60, borderBottom: '2px solid var(--secondary-200)' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 24px', background: 'none', border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                  marginBottom: -2, textTransform: 'capitalize', transition: 'all 0.2s',
                }}
              >
                {tab} {tab === 'reviews' && `(${productReviews.length})`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '32px 0' }}>
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: 720 }}>{product.description}</p>
            </motion.div>
          )}

          {activeTab === 'specifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ maxWidth: 600 }}>
                {Object.entries(product.specifications).map(([key, val], i) => (
                  <div key={key} style={{ display: 'flex', padding: '14px 0', borderBottom: i < Object.entries(product.specifications).length - 1 ? '1px solid var(--secondary-100)' : 'none' }}>
                    <div style={{ width: 160, fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Summary */}
              <div className="row g-4 mb-5">
                <div className="col-12 col-md-3">
                  <div style={{ textAlign: 'center', padding: 32, background: 'var(--secondary-100)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{product.rating}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0' }}>
                      {stars.map((f, i) => <FiStar key={i} size={16} style={{ fill: f ? '#F59E0B' : 'none', color: f ? '#F59E0B' : 'var(--secondary-300)' }} />)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.reviews.toLocaleString()} reviews</div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  {ratingBreakdown.map(({ rating: r, count, pct }) => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 12 }}>{r}</span>
                      <FiStar size={12} style={{ fill: '#F59E0B', color: '#F59E0B', flexShrink: 0 }} />
                      <div className="progress-custom" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 20 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {productReviews.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-icon">⭐</span>
                    <h3 className="empty-state-title">No reviews yet</h3>
                    <p className="empty-state-text">Be the first to review this product</p>
                  </div>
                )}
                {productReviews.map(review => (
                  <div key={review.id} style={{ padding: 24, background: 'var(--secondary-100)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <img src={review.avatar} alt={review.user} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{review.user}</span>
                          {review.verified && <span className="badge-success" style={{ fontSize: 10 }}>✓ Verified Purchase</span>}
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{review.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <FiStar key={i} size={13} style={{ fill: i < review.rating ? '#F59E0B' : 'none', color: i < review.rating ? '#F59E0B' : 'var(--secondary-300)' }} />
                          ))}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{review.title}</div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                          {review.helpful} people found this helpful
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div className="section-header">
              <div className="section-tag">🔗 You May Also Like</div>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="bottom-cart-bar">
        <button onClick={handleCart} className="btn-outline-custom flex-grow-1" style={{ justifyContent: 'center' }}>
          <FiShoppingCart size={15} /> {addedToCart ? 'Added!' : 'Add to Cart'}
        </button>
        <button onClick={handleBuyNow} className="btn-primary-custom flex-grow-1" style={{ justifyContent: 'center' }}>
          <FiZap size={15} /> Buy Now
        </button>
      </div>
    </MainLayout>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();

  const subtotal = cartTotal;
  const shipping = subtotal > 499 ? 0 : 49;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shipping - discount;

  if (!user) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🛒</span>
          <h3 className="empty-state-title">Please Login to View Cart</h3>
          <p className="empty-state-text">Login to manage your cart and checkout</p>
          <button className="btn-primary-custom" onClick={openLogin}>Login Now</button>
        </div>
      </MainLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🛒</span>
          <h3 className="empty-state-title">Your cart is empty</h3>
          <p className="empty-state-text">Looks like you haven't added anything yet. Explore our products!</p>
          <Link to="/products" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Start Shopping →</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Shopping Cart</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button onClick={clearCart} style={{ fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear Cart</button>
        </div>

        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-12 col-lg-8">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="card-premium"
                    style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}
                  >
                    <Link to={`/products/${item.id}`}>
                      <img src={item.images[0]} alt={item.name} style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{item.brand}</div>
                      <Link to={`/products/${item.id}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8, lineHeight: 1.4 }}>
                        {item.name}
                      </Link>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{formatPrice(item.price)}</div>
                      {item.originalPrice > item.price && (
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                          You save {formatPrice(item.originalPrice - item.price)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                        <FiTrash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--secondary-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}><FiMinus size={12} /></button>
                        <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}><FiPlus size={12} /></button>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{formatPrice(item.price * item.qty)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Coupon */}
            <div className="card-premium" style={{ padding: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiTag size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Apply Coupon</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="input-custom"
                  placeholder="Enter coupon code (e.g. SAVE20)"
                  style={{ flex: 1 }}
                />
                <button className="btn-accent-custom" style={{ padding: '10px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>Apply</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {['SAVE20', 'FLAT500', 'FIRST100'].map(code => (
                  <span key={code} style={{ fontSize: 11, fontWeight: 700, background: 'var(--accent-10)', color: 'var(--accent-dark)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px dashed var(--accent)', cursor: 'pointer' }}>{code}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-12 col-lg-4">
            <div className="card-premium" style={{ padding: 24, position: 'sticky', top: 'calc(var(--navbar-height) + 16px)' }}>
              <h5 style={{ fontWeight: 800, marginBottom: 20 }}>Order Summary</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Subtotal', value: formatPrice(subtotal) },
                  { label: `Shipping ${shipping === 0 ? '(FREE)' : ''}`, value: shipping === 0 ? 'FREE' : formatPrice(shipping) },
                  { label: 'Discount (5%)', value: `-${formatPrice(discount)}`, color: 'var(--success)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--secondary-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <div style={{ background: 'var(--success-10)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎉 You're saving {formatPrice(discount)} on this order!
              </div>

              <button className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 14, borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight size={16} />
              </button>

              <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
                <FiShoppingBag size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

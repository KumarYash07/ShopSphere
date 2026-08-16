import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiMapPin, FiCreditCard, FiPackage, FiTag, FiChevronRight } from 'react-icons/fi';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { BsCash, BsCreditCard2Front } from 'react-icons/bs';
import MainLayout from '../components/layout/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addresses as dummyAddresses, coupons } from '../data/dummy';
import { formatPrice } from '../utils/helpers';

const STEPS = ['Address', 'Payment', 'Review'];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: <SiPhonepe size={20} />, desc: 'Pay via PhonePe, GPay, Paytm' },
  { id: 'credit', label: 'Credit Card', icon: <BsCreditCard2Front size={20} />, desc: 'Visa, Mastercard, Amex' },
  { id: 'debit', label: 'Debit Card', icon: <FiCreditCard size={20} />, desc: 'All Indian bank debit cards' },
  { id: 'cod', label: 'Cash on Delivery', icon: <BsCash size={20} />, desc: 'Pay when you receive' },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  if (!user) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🔐</span>
          <h3 className="empty-state-title">Login to Checkout</h3>
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
          <Link to="/products" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Shop Now →</Link>
        </div>
      </MainLayout>
    );
  }

  const applyCoupon = () => {
    const found = coupons.find(c => c.code === couponCode.trim().toUpperCase());
    if (!found) { setCouponError('Invalid coupon code'); setAppliedCoupon(null); return; }
    if (cartTotal < found.minOrder) { setCouponError(`Min order of ${formatPrice(found.minOrder)} required`); setAppliedCoupon(null); return; }
    setAppliedCoupon(found);
    setCouponError('');
  };

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.min(Math.round(cartTotal * appliedCoupon.discount / 100), appliedCoupon.maxDiscount)
      : appliedCoupon.discount
    : 0;

  const shipping = cartTotal > 499 ? 0 : 49;
  const total = cartTotal + shipping - couponDiscount;

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1800));
    clearCart();
    navigate('/orders');
  };

  const OrderSummary = ({ compact = false }) => (
    <div className="card-premium" style={{ padding: 24 }}>
      {!compact && <h6 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Order Summary</h6>}
      <div style={{ maxHeight: compact ? 'none' : 200, overflowY: 'auto', marginBottom: 16 }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <img src={item.images[0]} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{formatPrice(item.price * item.qty)}</div>
          </div>
        ))}
      </div>

      {step >= 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input-custom"
              placeholder="Coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              style={{ flex: 1, height: 40, fontSize: 13 }}
            />
            <button className="btn-accent-custom" style={{ padding: '0 16px', fontSize: 12, height: 40 }} onClick={applyCoupon}>Apply</button>
          </div>
          {couponError && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{couponError}</p>}
          {appliedCoupon && <p style={{ color: 'var(--success)', fontSize: 12, marginTop: 4 }}>✓ {appliedCoupon.code} applied! Saving {formatPrice(couponDiscount)}</p>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{formatPrice(cartTotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Shipping</span><span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : undefined }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
        {couponDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Coupon Discount</span><span style={{ fontWeight: 600, color: 'var(--success)' }}>-{formatPrice(couponDiscount)}</span></div>}
        <div style={{ borderTop: '2px solid var(--secondary-200)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 32 }}>Checkout</h1>

        {/* Step Indicator */}
        <div className="step-indicator" style={{ maxWidth: 480, marginBottom: 40 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`step-dot ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
                  {i < step ? <FiCheck size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? 'var(--primary)' : 'var(--text-muted)', marginTop: 6, whiteSpace: 'nowrap', fontWeight: i === step ? 700 : 400 }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'completed' : ''}`} style={{ marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <AnimatePresence mode="wait">
              {/* Step 0: Address */}
              {step === 0 && (
                <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Delivery Address</h5>
                    <button className="btn-ghost" style={{ fontSize: 13 }}>+ Add New Address</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {dummyAddresses.map((addr, i) => (
                      <div key={addr.id} className="address-card" onClick={() => setSelectedAddress(i)} style={{ borderColor: selectedAddress === i ? 'var(--primary)' : 'var(--secondary-200)', background: selectedAddress === i ? 'var(--primary-10)' : 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedAddress === i ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            {selectedAddress === i && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.name}</span>
                              <span className={`badge-${addr.type === 'Home' ? 'primary' : 'accent'}`} style={{ fontSize: 10 }}>{addr.type}</span>
                              {addr.isDefault && <span className="badge-success" style={{ fontSize: 10 }}>Default</span>}
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                              {addr.line1}, {addr.city}, {addr.state} - {addr.pin}
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>📞 {addr.phone}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Use Current Location */}
                  <button style={{ width: '100%', marginTop: 14, padding: 14, border: '2px dashed var(--secondary-300)', borderRadius: 'var(--radius-lg)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--secondary-300)'; e.currentTarget.style.background = 'none'; }}
                  >
                    <FiMapPin size={16} /> Use Current Location
                  </button>

                  <button className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', marginTop: 24, fontSize: 15, padding: 14 }} onClick={() => setStep(1)}>
                    Continue to Payment <FiChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Payment Method</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {PAYMENT_METHODS.map(pm => (
                      <div key={pm.id} className="payment-option" onClick={() => setSelectedPayment(pm.id)} style={{ borderColor: selectedPayment === pm.id ? 'var(--primary)' : 'var(--secondary-200)', background: selectedPayment === pm.id ? 'var(--primary-10)' : 'white' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPayment === pm.id ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {selectedPayment === pm.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                        </div>
                        <div style={{ color: selectedPayment === pm.id ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>{pm.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{pm.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pm.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* UPI Input */}
                  {selectedPayment === 'upi' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 16, background: 'var(--secondary-100)', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Enter UPI ID</label>
                      <input className="input-custom" placeholder="yourupiid@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        {[<SiPhonepe size={24} />, <SiGooglepay size={24} />, <SiPaytm size={24} />].map((icon, i) => (
                          <div key={i} style={{ padding: '8px 16px', background: 'white', borderRadius: 8, border: '1px solid var(--secondary-200)', cursor: 'pointer' }}>{icon}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {(selectedPayment === 'credit' || selectedPayment === 'debit') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 16, background: 'var(--secondary-100)', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Card Number</label>
                        <input className="input-custom" placeholder="0000 0000 0000 0000" value={cardNum} onChange={e => setCardNum(e.target.value)} maxLength={19} />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Expiry</label>
                          <input className="input-custom" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>CVV</label>
                          <input className="input-custom" placeholder="•••" type="password" value={cardCVV} onChange={e => setCardCVV(e.target.value)} maxLength={3} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-ghost" style={{ padding: '12px 20px' }} onClick={() => setStep(0)}>← Back</button>
                    <button className="btn-primary-custom" style={{ flex: 1, justifyContent: 'center', fontSize: 15, padding: 13 }} onClick={() => setStep(2)}>
                      Review Order <FiChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review & Place */}
              {step === 2 && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Review Your Order</h5>

                  {/* Address Summary */}
                  <div className="card-premium" style={{ padding: 16, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                        <FiMapPin size={15} style={{ color: 'var(--primary)' }} /> Delivering to
                      </div>
                      <button onClick={() => setStep(0)} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>{dummyAddresses[selectedAddress].name}</strong> · {dummyAddresses[selectedAddress].line1}, {dummyAddresses[selectedAddress].city} - {dummyAddresses[selectedAddress].pin}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="card-premium" style={{ padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                        <FiCreditCard size={15} style={{ color: 'var(--primary)' }} /> Payment
                      </div>
                      <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {PAYMENT_METHODS.find(pm => pm.id === selectedPayment)?.label}
                      {selectedPayment === 'upi' && upiId && ` · ${upiId}`}
                    </div>
                  </div>

                  <OrderSummary compact />

                  <button
                    className="btn-primary-custom"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 20, fontSize: 15, padding: '16px', borderRadius: 'var(--radius-md)', opacity: placing ? 0.8 : 1 }}
                    onClick={placeOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        Placing Order...
                      </span>
                    ) : `🎉 Place Order · ${formatPrice(total)}`}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    By placing this order, you agree to our Terms of Service & Privacy Policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary (desktop) */}
          <div className="col-12 col-lg-5 d-none d-lg-block">
            <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 16px)' }}>
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

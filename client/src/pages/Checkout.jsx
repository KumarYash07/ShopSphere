import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiCheck, FiMapPin, FiCreditCard, FiPackage, FiChevronRight,
  FiPlus, FiCheckCircle, FiXCircle, FiShoppingBag, FiShield, FiAlertTriangle
} from 'react-icons/fi';
import { BsCash } from 'react-icons/bs';
import MainLayout from '../components/layout/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { coupons } from '../data/dummy';
import { formatPrice } from '../utils/helpers';
import { getAddressesApi, addAddressApi } from '../api/addressApi';
import { createOrderApi } from '../api/orderApi';
import { createDemoPaymentApi, verifyDemoPaymentApi } from '../api/paymentApi';

const STEPS = ['Address', 'Payment', 'Review'];

const PAYMENT_METHODS = [
  {
    id: 'demo',
    label: 'Demo Payment',
    icon: <FiCreditCard size={20} />,
    desc: 'Test payment — No real money will be charged',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: <BsCash size={20} />,
    desc: 'Pay when you receive',
  },
];

/**
 * Safely extract exact backend error message from API response
 */
const extractErrorMessage = (err) => {
  if (err.response && err.response.data) {
    if (typeof err.response.data.message === 'string' && err.response.data.message.trim() !== '') {
      return err.response.data.message;
    }
    if (typeof err.response.data.error === 'string' && err.response.data.error.trim() !== '') {
      return err.response.data.error;
    }
    if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
      return err.response.data;
    }
  }
  return err.message || 'An error occurred while processing your order.';
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('demo');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [orderError, setOrderError] = useState('');

  // Successful Order Confirmation State
  const [completedOrder, setCompletedOrder] = useState(null);

  // Add Address Modal state in Checkout
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
    isDefault: true,
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await getAddressesApi();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
        const defaultIdx = data.addresses.findIndex(a => a.isDefault);
        if (defaultIdx !== -1) {
          setSelectedAddress(defaultIdx);
        }
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
      setAddressForm(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const data = await addAddressApi(addressForm);
      if (data.success && data.address) {
        setShowAddModal(false);
        const updatedRes = await getAddressesApi();
        if (updatedRes.success && Array.isArray(updatedRes.addresses)) {
          setAddresses(updatedRes.addresses);
          const newIdx = updatedRes.addresses.findIndex(a => a._id === data.address._id);
          if (newIdx !== -1) setSelectedAddress(newIdx);
        }
      }
    } catch (err) {
      console.error('Add address error:', err);
    } finally {
      setSavingAddress(false);
    }
  };

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

  // If order is completed, show the Order Successful Screen
  if (completedOrder) {
    return (
      <MainLayout>
        <div style={{ padding: '48px 24px', maxWidth: 640, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium text-center"
            style={{ padding: 40, borderTop: '6px solid var(--success)' }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <FiCheckCircle size={40} />
            </div>

            <h2 style={{ fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 8 }}>
              {completedOrder.paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment & Order Successful!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
              Thank you for shopping with ShopSphere. Your order has been confirmed.
            </p>

            {/* Order Confirmation Details Box */}
            <div
              style={{
                background: 'var(--secondary-100)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                textAlign: 'left',
                marginBottom: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Order Number:</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{completedOrder.orderNumber}</strong>
              </div>

              {completedOrder.paymentMethod === 'demo' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Transaction ID:</span>
                  <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{completedOrder.transactionId}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Payment Method:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {completedOrder.paymentMethod === 'demo' ? 'Demo Payment (Paid)' : 'Cash on Delivery (Pending)'}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed var(--secondary-300)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ fontWeight: 700 }}>Total Amount:</span>
                <strong style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18 }}>
                  {formatPrice(completedOrder.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Navigation Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-primary-custom"
                style={{ padding: '12px 24px', fontSize: 14 }}
                onClick={() => navigate('/orders')}
              >
                <FiPackage size={16} /> View My Orders
              </button>
              <button
                className="btn-ghost"
                style={{ padding: '12px 24px', fontSize: 14, border: '1px solid var(--secondary-300)' }}
                onClick={() => navigate('/products')}
              >
                <FiShoppingBag size={16} /> Continue Shopping
              </button>
            </div>
          </motion.div>
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

  const currentAddressObj = addresses[selectedAddress];

  const placeOrder = async () => {
    if (!currentAddressObj || !currentAddressObj._id) {
      setOrderError('Please select or add a delivery address first.');
      setStep(0);
      return;
    }

    const token = localStorage.getItem('ss_token');
    if (!token) {
      setOrderError('Your authentication session has expired. Please login again.');
      openLogin();
      return;
    }

    setPlacing(true);
    setOrderError('');
    setPaymentStatusText('');

    try {
      const addressId = String(currentAddressObj._id);
      const backendPaymentMethod = selectedPayment === 'cod' ? 'cod' : 'demo';

      // 1. POST /api/orders
      setPaymentStatusText('Creating order...');
      const orderRes = await createOrderApi({
        addressId,
        paymentMethod: backendPaymentMethod,
      });

      if (!orderRes.success || !orderRes.order || !orderRes.order._id) {
        setOrderError(orderRes.message || 'Failed to create order.');
        setPlacing(false);
        return;
      }

      const createdOrder = orderRes.order;

      // 2. Handle Demo Payment if selected
      if (backendPaymentMethod === 'demo') {
        // POST /api/payments/demo/create
        setPaymentStatusText('Creating demo payment session...');
        const demoPaymentRes = await createDemoPaymentApi(createdOrder._id);

        if (!demoPaymentRes.success || !demoPaymentRes.payment || !demoPaymentRes.payment.transactionId) {
          setOrderError(demoPaymentRes.message || 'Failed to create demo payment session.');
          setPlacing(false);
          return;
        }

        const transactionId = demoPaymentRes.payment.transactionId;

        // POST /api/payments/demo/verify
        setPaymentStatusText(`Verifying demo payment transaction (${transactionId})...`);
        const verifyRes = await verifyDemoPaymentApi({
          orderId: createdOrder._id,
          transactionId,
          paymentResult: 'success',
        });

        if (!verifyRes.success) {
          setOrderError(verifyRes.message || 'Demo payment verification failed. Please try again.');
          setPlacing(false);
          return;
        }

        // Clear local cart and show order completion UI
        await clearCart();
        setCompletedOrder({
          orderNumber: createdOrder.orderNumber,
          transactionId: transactionId,
          totalAmount: createdOrder.totalAmount,
          paymentMethod: 'demo',
          orderId: createdOrder._id,
        });
      } else {
        // COD Flow
        await clearCart();
        setCompletedOrder({
          orderNumber: createdOrder.orderNumber,
          transactionId: 'N/A',
          totalAmount: createdOrder.totalAmount,
          paymentMethod: 'cod',
          orderId: createdOrder._id,
        });
      }
    } catch (err) {
      console.error('Order placement error:', err);
      const backendErrMsg = extractErrorMessage(err);
      setOrderError(backendErrMsg);
    } finally {
      setPlacing(false);
      setPaymentStatusText('');
    }
  };

  const OrderSummary = ({ compact = false }) => (
    <div className="card-premium" style={{ padding: 24 }}>
      {!compact && <h6 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Order Summary</h6>}
      <div style={{ maxHeight: compact ? 'none' : 200, overflowY: 'auto', marginBottom: 16 }}>
        {cart.map(item => (
          <div key={item._id || item.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <img src={item.images[0]} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{formatPrice((item.finalPrice ?? item.price) * item.qty)}</div>
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
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Select Delivery Address</h5>
                    <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowAddModal(true)}>
                      <FiPlus size={14} /> Add New Address
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="card-premium text-center p-4 mb-3">
                      <p className="text-muted small mb-3">No saved addresses found in your account.</p>
                      <button className="btn-primary-custom" onClick={() => setShowAddModal(true)}>
                        + Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {addresses.map((addr, i) => (
                        <div
                          key={addr._id}
                          className="address-card cursor-pointer"
                          onClick={() => setSelectedAddress(i)}
                          style={{
                            borderColor: selectedAddress === i ? 'var(--primary)' : 'var(--secondary-200)',
                            background: selectedAddress === i ? 'var(--primary-10)' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedAddress === i ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                              {selectedAddress === i && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.fullName}</span>
                                <span className="badge bg-secondary text-capitalize" style={{ fontSize: 10 }}>{addr.addressType || 'Home'}</span>
                                {addr.isDefault && <span className="badge-success" style={{ fontSize: 10 }}>Default</span>}
                              </div>
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>📞 {addr.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="btn-primary-custom"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 24, fontSize: 15, padding: 14 }}
                    onClick={() => setStep(1)}
                    disabled={addresses.length === 0}
                  >
                    Continue to Payment <FiChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Payment Selection */}
              {step === 1 && (
                <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Select Payment Method</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {PAYMENT_METHODS.map(pm => (
                      <div
                        key={pm.id}
                        className="payment-option cursor-pointer"
                        onClick={() => setSelectedPayment(pm.id)}
                        style={{
                          padding: 16,
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${selectedPayment === pm.id ? 'var(--primary)' : 'var(--secondary-200)'}`,
                          background: selectedPayment === pm.id ? 'var(--primary-10)' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPayment === pm.id ? 'var(--primary)' : 'var(--secondary-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {selectedPayment === pm.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                        </div>
                        <div style={{ color: selectedPayment === pm.id ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>{pm.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{pm.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pm.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Demo Payment Panel Details when selected */}
                  {selectedPayment === 'demo' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 20,
                        background: '#eef2ff',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid #c7d2fe',
                        marginBottom: 24,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>🧪</span>
                        <h6 style={{ margin: 0, fontWeight: 700, color: '#3730a3' }}>Demo Payment Panel</h6>
                      </div>
                      <p style={{ fontSize: 13, color: '#4338ca', marginBottom: 12, lineHeight: 1.4 }}>
                        Test payment — No real money will be charged. Clicking "Review Order" will proceed to confirm your test transaction.
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #c7d2fe', paddingTop: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#3730a3' }}>Amount Payable:</span>
                        <strong style={{ fontSize: 18, color: '#312e81', fontWeight: 800 }}>{formatPrice(total)}</strong>
                      </div>
                    </motion.div>
                  )}

                  {selectedPayment === 'cod' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 16,
                        background: 'var(--secondary-100)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 24,
                      }}
                    >
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        💵 Pay <strong>{formatPrice(total)}</strong> using Cash on Delivery upon receiving your package.
                      </p>
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
                    {currentAddressObj ? (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <strong>{currentAddressObj.fullName}</strong> · {currentAddressObj.addressLine1}, {currentAddressObj.city} - {currentAddressObj.pincode} (📞 {currentAddressObj.phone})
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--danger)' }}>No address selected</div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="card-premium" style={{ padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                        <FiCreditCard size={15} style={{ color: 'var(--primary)' }} /> Payment Method
                      </div>
                      <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {PAYMENT_METHODS.find(pm => pm.id === selectedPayment)?.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {PAYMENT_METHODS.find(pm => pm.id === selectedPayment)?.desc}
                    </div>
                  </div>

                  {/* Render compact OrderSummary ONLY on mobile screens to prevent duplication on desktop */}
                  <div className="d-block d-lg-none mb-3">
                    <OrderSummary compact />
                  </div>

                  {orderError && (
                    <div className="alert alert-danger small my-3 d-flex align-items-center gap-2" role="alert">
                      <FiAlertTriangle className="flex-shrink-0" size={18} />
                      <div>{orderError}</div>
                    </div>
                  )}

                  {paymentStatusText && (
                    <div className="alert alert-info small my-3 d-flex align-items-center gap-2" role="alert">
                      <div className="spinner-border spinner-border-sm text-info" role="status" />
                      <span>{paymentStatusText}</span>
                    </div>
                  )}

                  <button
                    className="btn-primary-custom"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 20, fontSize: 15, padding: '16px', borderRadius: 'var(--radius-md)', opacity: placing ? 0.8 : 1 }}
                    onClick={placeOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        Processing...
                      </span>
                    ) : selectedPayment === 'demo' ? (
                      `🧪 Pay ${formatPrice(total)} (Demo)`
                    ) : (
                      `🎉 Place Order · ${formatPrice(total)}`
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    <FiShield size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    By placing this order, you agree to our Terms of Service & Privacy Policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary (desktop sidebar - rendered ONCE) */}
          <div className="col-12 col-lg-5 d-none d-lg-block">
            <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 16px)' }}>
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal on Checkout */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Add Delivery Address</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleAddAddress}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Full Name"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Address Line 1 *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="House no., Street, Area"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Pincode *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" style={{ background: '#4F46E5' }} disabled={savingAddress}>
                    {savingAddress ? 'Saving...' : 'Save & Select'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

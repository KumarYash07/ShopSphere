import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiMapPin, FiCreditCard, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { getMyOrdersApi, isOrderCancellable } from '../api/orderApi';
import CancelOrderModal from '../components/order/CancelOrderModal';

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅',
  processing: '📦',
  shipped: '🚚',
  delivered: '🎉',
  cancelled: '❌',
};

export default function Orders() {
  const { user, openLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancelSuccess = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
    );
    showToast('success', 'Order cancelled successfully.');
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await getMyOrdersApi();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">📦</span>
          <h3 className="empty-state-title">Login to View Orders</h3>
          <button className="btn-primary-custom" onClick={openLogin}>Login Now</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <FiPackage size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>
        </div>

        {feedback.message && (
          <div className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm`} role="alert">
            <div>{feedback.message}</div>
            <button type="button" className="btn-close ms-auto" onClick={() => setFeedback({ type: '', message: '' })} />
          </div>
        )}

        {loadingOrders ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted small mt-2">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <span className="empty-state-icon">🛍️</span>
            <h3 className="empty-state-title">No Orders Placed Yet</h3>
            <p className="empty-state-text">Explore our marketplace and place your first order!</p>
            <Link to="/products" className="btn-primary-custom" style={{ display: 'inline-flex' }}>
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map((order, oi) => {
              const isCancellable = isOrderCancellable(order.orderStatus);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: oi * 0.05 }}
                  className="card-premium"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Order Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--secondary-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'var(--secondary-100)' }}>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Number</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{order.orderNumber}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Placed On</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Amount</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(order.totalAmount)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${order.orderStatus === 'confirmed' || order.orderStatus === 'delivered' ? 'bg-success' : order.orderStatus === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'} px-2 py-1 text-capitalize`} style={{ fontSize: 12 }}>
                        {STATUS_ICONS[order.orderStatus] || '📦'} {order.orderStatus}
                      </span>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-dark'} px-2 py-1 text-uppercase`} style={{ fontSize: 10 }}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Cancelled Banner if cancelled */}
                  {order.orderStatus === 'cancelled' && (
                    <div style={{ margin: '16px 20px 0', padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <FiAlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: 13, color: '#991B1B' }}>
                        <div style={{ fontWeight: 700 }}>Order Cancelled</div>
                        <div>Reason: {order.cancellationReason || 'Cancelled by customer'}</div>
                        {order.cancelledAt && (
                          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 2 }}>
                            Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ padding: '16px 20px' }}>
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                        <img
                          src={item.productImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={item.productName}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.productName}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Qty: {item.quantity} · {formatPrice(item.price)}
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatPrice(item.total)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer / Address info & Actions */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid var(--secondary-100)', display: 'flex', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', background: '#fafafa' }}>
                    {order.shippingAddress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        <FiMapPin size={14} />
                        <strong>{order.shippingAddress.fullName}</strong> · {order.shippingAddress.addressLine1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        <FiCreditCard size={14} />
                        {order.paymentMethod} ({order.paymentStatus})
                      </div>
                      {isCancellable && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                          onClick={() => handleOpenCancelModal(order)}
                        >
                          <FiXCircle size={14} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        <CancelOrderModal
          show={showCancelModal}
          order={selectedOrderToCancel}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrderToCancel(null);
          }}
          onSuccess={handleCancelSuccess}
        />
      </div>
    </MainLayout>
  );
}

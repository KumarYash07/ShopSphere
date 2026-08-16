import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiMapPin, FiCreditCard, FiDownload } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { orders } from '../data/dummy';
import { formatPrice, getStatusColor } from '../utils/helpers';

const STATUS_ICONS = { placed: '📝', confirmed: '✅', packed: '📦', shipped: '🚚', delivered: '🎉' };

export default function Orders() {
  const { user, openLogin } = useAuth();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <FiPackage size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{orders.length} orders placed</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order, oi) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: oi * 0.1 }}
              className="card-premium"
              style={{ overflow: 'hidden' }}
            >
              {/* Order Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--secondary-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'var(--secondary-100)' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order ID</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{order.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Placed On</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{order.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(order.total)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge-${getStatusColor(order.status)}`} style={{ textTransform: 'capitalize', fontSize: 12 }}>
                    {STATUS_ICONS[order.status]} {order.status}
                  </span>
                  <button style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiDownload size={13} /> Invoice
                  </button>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '16px 20px' }}>
                {order.items.map(item => (
                  <div key={item.productId} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                    <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Qty: {item.qty} · {formatPrice(item.price)}</div>
                    </div>
                    {order.status === 'delivered' && (
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>Rate Product</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tracking Timeline */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--secondary-100)', background: 'var(--bg)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Tracking</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Line */}
                  <div style={{ position: 'absolute', top: 14, left: '10%', right: '10%', height: 2, background: 'var(--secondary-200)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 14, left: '10%', height: 2, background: 'var(--success)', zIndex: 0, width: `${(order.timeline.filter(t => t.done).length - 1) / (order.timeline.length - 1) * 80}%` }} />

                  {order.timeline.map((step, i) => (
                    <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step.done ? 'var(--success)' : 'white',
                        border: `3px solid ${step.current ? 'var(--primary)' : step.done ? 'var(--success)' : 'var(--secondary-300)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 8, fontSize: 11, color: step.done ? 'white' : 'var(--text-muted)',
                        boxShadow: step.current ? 'var(--shadow-primary)' : 'none',
                      }}>
                        {step.done ? '✓' : STATUS_ICONS[step.status]}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: step.done ? 700 : 500, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'none' }} className="d-none d-md-block">{step.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--secondary-100)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginRight: 'auto' }}>
                  <FiMapPin size={13} />
                  {order.address.name} · {order.address.city}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <FiCreditCard size={13} />
                  {order.payment}
                </div>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button style={{ fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel Order</button>
                )}
                {order.status === 'delivered' && (
                  <button className="btn-ghost" style={{ fontSize: 12 }}>Return / Exchange</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

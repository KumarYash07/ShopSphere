import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiPackage, FiHeart, FiMapPin, FiBell, FiUser,
  FiSettings, FiLogOut, FiEdit2, FiCamera, FiPhone, FiMail
} from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { orders, addresses } from '../data/dummy';
import { formatPrice, getStatusColor } from '../utils/helpers';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'orders', label: 'Orders', icon: FiPackage },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');

  if (!user || user.role !== 'customer') {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🔐</span>
          <h3 className="empty-state-title">Access Denied</h3>
          <Link to="/" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Go Home</Link>
        </div>
      </MainLayout>
    );
  }

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: '📦', color: 'var(--primary)', bg: 'var(--primary-10)' },
    { label: 'Wishlisted', value: wishlist.length, icon: '❤️', color: 'var(--danger)', bg: 'var(--danger-10)' },
    { label: 'Addresses', value: addresses.length, icon: '📍', color: 'var(--success)', bg: 'var(--success-10)' },
    { label: 'Reviews Given', value: 3, icon: '⭐', color: '#F59E0B', bg: 'var(--warning-10)' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardOverview stats={stats} />;
      case 'orders': return <OrdersTab />;
      case 'wishlist': return <WishlistTab wishlist={wishlist} />;
      case 'addresses': return <AddressesTab />;
      case 'profile': return <ProfileTab user={user} />;
      default: return <ComingSoon tab={active} />;
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-12 col-lg-3">
            <div className="card-premium" style={{ padding: 24, position: 'sticky', top: 'calc(var(--navbar-height) + 16px)' }}>
              {/* Profile Card */}
              <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--secondary-200)' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                  <img src={user.avatar} alt={user.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                  <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCamera size={11} style={{ color: 'white' }} />
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{user.email}</div>
                <span className="badge-primary" style={{ fontSize: 11 }}>Customer</span>
              </div>

              {/* Nav */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`sidebar-link ${active === id ? 'active' : ''}`}
                    onClick={() => setActive(id)}
                  >
                    <Icon className="icon" /> {label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--secondary-100)', marginTop: 8, paddingTop: 8 }}>
                  <button className="sidebar-link" style={{ color: 'var(--danger)' }} onClick={() => { logout(); navigate('/'); }}>
                    <FiLogOut className="icon" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="col-12 col-lg-9">
            <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function DashboardOverview({ stats }) {
  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>My Dashboard</h2>
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={s.label} className="col-6 col-md-3">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
            </motion.div>
          </div>
        ))}
      </div>
      <div>
        <h5 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h5>
        <OrdersTab compact />
      </div>
    </div>
  );
}

function OrdersTab({ compact = false }) {
  return (
    <div>
      {!compact && <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>My Orders</h2>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => (
          <div key={order.id} className="card-premium" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <img src={order.items[0].image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{order.id}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.items[0].name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{formatPrice(order.total)}</div>
              <span className={`badge-${getStatusColor(order.status)}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>{order.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistTab({ wishlist }) {
  if (!wishlist.length) return (
    <div className="empty-state">
      <span className="empty-state-icon">❤️</span>
      <h3 className="empty-state-title">No wishlisted items</h3>
      <Link to="/products" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Browse Products</Link>
    </div>
  );
  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>My Wishlist</h2>
      <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {wishlist.map(p => (
          <Link key={p.id} to={`/products/${p.id}`} className="card-premium" style={{ overflow: 'hidden', textDecoration: 'none' }}>
            <img src={p.images[0]} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(p.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AddressesTab() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>My Addresses</h2>
        <button className="btn-primary-custom" style={{ fontSize: 13, padding: '8px 20px' }}>+ Add New</button>
      </div>
      <div className="row g-3">
        {addresses.map(addr => (
          <div key={addr.id} className="col-12 col-md-6">
            <div className="address-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge-${addr.type === 'Home' ? 'primary' : 'accent'}`}>{addr.type}</span>
                  {addr.isDefault && <span className="badge-success">Default</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  {!addr.isDefault && <button style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{addr.name}</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>{addr.line1}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{addr.city}, {addr.state} - {addr.pin}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>📞 {addr.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>My Profile</h2>
      <div className="card-premium" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img src={user.avatar} alt={user.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-20)' }} />
            <button style={{ position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCamera size={12} style={{ color: 'white' }} />
            </button>
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>{user.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 12px' }}>Customer Account</p>
            <button className="btn-outline-custom" style={{ fontSize: 12, padding: '7px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiEdit2 size={12} /> Edit Photo
            </button>
          </div>
        </div>
        <div className="row g-3">
          {[
            { label: 'Full Name', value: user.name, icon: FiUser },
            { label: 'Email', value: user.email, icon: FiMail },
            { label: 'Phone', value: user.phone || '9876543210', icon: FiPhone },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="col-12 col-md-6">
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Icon size={15} /></div>
                <input className="input-custom" defaultValue={value} style={{ paddingLeft: 42 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button className="btn-primary-custom" style={{ padding: '11px 24px', fontSize: 14 }}>Save Changes</button>
          <button className="btn-ghost" style={{ padding: '11px 24px', fontSize: 14 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ tab }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">🚧</span>
      <h3 className="empty-state-title" style={{ textTransform: 'capitalize' }}>{tab}</h3>
      <p className="empty-state-text">This section is coming soon.</p>
    </div>
  );
}

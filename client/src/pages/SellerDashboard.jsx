import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiPackage, FiPlusCircle, FiBarChart2, FiUsers, FiStar,
  FiDollarSign, FiShoppingBag, FiPercent, FiTag, FiSettings, FiLogOut,
  FiTrendingUp, FiArrowUp, FiAlertCircle, FiCheck, FiX
} from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { sellerDashboardStats, products } from '../data/dummy';
import { formatPrice, formatCompact, getStatusColor } from '../utils/helpers';

const SIDEBAR = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'add-product', label: 'Add Product', icon: FiPlusCircle },
  { id: 'orders', label: 'Orders', icon: FiShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'discounts', label: 'Discounts', icon: FiPercent },
  { id: 'coupons', label: 'Coupons', icon: FiTag },
  { id: 'customers', label: 'Customers', icon: FiUsers },
  { id: 'reviews', label: 'Reviews', icon: FiStar },
  { id: 'wallet', label: 'Wallet', icon: FiDollarSign },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const STATUS_COLORS = { pending: 'warning', confirmed: 'primary', shipped: 'info', delivered: 'success' };

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const stats = sellerDashboardStats;

  if (!user || user.role !== 'seller') {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🔐</span>
          <h3 className="empty-state-title">Seller Access Required</h3>
          <p className="empty-state-text">Login with a seller account. Demo: seller@demo.com / demo123</p>
          <Link to="/" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Go Home</Link>
        </div>
      </MainLayout>
    );
  }

  const STAT_CARDS = [
    { label: "Today's Sales", value: formatPrice(stats.todaySales), sub: '+12% vs yesterday', icon: '💰', color: 'var(--success)', trend: 'up' },
    { label: 'Monthly Revenue', value: formatPrice(stats.monthlySales), sub: '+8.4% vs last month', icon: '📈', color: 'var(--primary)', trend: 'up' },
    { label: 'Total Orders', value: stats.orders.toLocaleString(), sub: `${stats.pendingOrders} pending`, icon: '📦', color: 'var(--accent)', trend: 'up' },
    { label: 'Active Products', value: stats.products, sub: '12 out of stock', icon: '🏷️', color: 'var(--purple)', trend: 'neutral' },
    { label: 'Total Revenue', value: `₹${formatCompact(stats.revenue)}`, sub: 'All time earnings', icon: '🏦', color: 'var(--info)', trend: 'up' },
    { label: 'Avg Rating', value: stats.avgRating, sub: 'Based on 4,200+ reviews', icon: '⭐', color: '#F59E0B', trend: 'up' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardHome stats={STAT_CARDS} orders={stats.recentOrders} salesData={stats.salesData} />;
      case 'products': return <ProductsTab />;
      case 'add-product': return <AddProductTab />;
      case 'orders': return <OrdersTab orders={stats.recentOrders} />;
      case 'analytics': return <AnalyticsTab data={stats.salesData} />;
      default: return <ComingSoon tab={active} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: 'var(--secondary-900)', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>S</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'white', lineHeight: 1 }}>ShopSphere</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Seller Central</div>
            </div>
          </Link>
        </div>

        {/* Profile */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={user.avatar} alt={user.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Active Seller</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {SIDEBAR.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active === id ? 700 : 500,
                background: active === id ? 'rgba(37,99,235,0.3)' : 'transparent',
                color: active === id ? '#93C5FD' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
              }}
              onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowX: 'hidden', minHeight: '100vh' }}>
        {/* Top Bar */}
        <div style={{ background: 'white', padding: '16px 32px', borderBottom: '1px solid var(--secondary-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>{active.replace('-', ' ')}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Welcome back, {user.name.split(' ')[0]}!</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-primary-custom" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => setActive('add-product')}>
              <FiPlusCircle size={14} /> Add Product
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px' }}>
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ stats, orders, salesData }) {
  const maxSales = Math.max(...salesData.map(d => d.sales));
  return (
    <div>
      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="col-12 col-sm-6 col-xl-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 32 }}>{stat.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: stat.trend === 'up' ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {stat.trend === 'up' && <FiArrowUp size={11} />} {stat.sub}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Sales Chart */}
        <div className="col-12 col-lg-7">
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h6 style={{ fontWeight: 700, margin: 0 }}>Monthly Sales</h6>
              <span className="badge-success">+23% this month</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
              {salesData.map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>₹{formatCompact(d.sales)}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.sales / maxSales) * 140}px` }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: i === salesData.length - 1
                        ? 'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)'
                        : 'linear-gradient(180deg, var(--secondary-300) 0%, var(--secondary-200) 100%)',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-12 col-lg-5">
          <div className="chart-container" style={{ height: '100%' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 20 }}>Recent Orders</h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(order => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--secondary-100)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.product} · {order.date}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatPrice(order.amount)}</div>
                    <span className={`badge-${STATUS_COLORS[order.status] || 'secondary'}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h5 style={{ fontWeight: 700, margin: 0 }}>My Products ({products.slice(0, 5).length})</h5>
        <button className="btn-primary-custom" style={{ fontSize: 12, padding: '8px 16px' }}>+ Add Product</button>
      </div>
      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--secondary-100)' }}>
              {['Product', 'Price', 'Stock', 'Sales', 'Rating', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 6).map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--secondary-100)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{formatPrice(p.price)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 13, color: p.stock < 20 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{p.stock}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.sold.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: '#F59E0B' }}>★</span> {p.rating}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddProductTab() {
  return (
    <div>
      <h5 style={{ fontWeight: 700, marginBottom: 24 }}>Add New Product</h5>
      <div className="card-premium" style={{ padding: 32 }}>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Product Name *</label>
            <input className="input-custom" placeholder="e.g. Apple iPhone 15 Pro" />
          </div>
          <div className="col-12 col-md-6">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Brand</label>
            <input className="input-custom" placeholder="e.g. Apple" />
          </div>
          <div className="col-12 col-md-4">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Price *</label>
            <input className="input-custom" placeholder="₹0.00" type="number" />
          </div>
          <div className="col-12 col-md-4">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Original Price</label>
            <input className="input-custom" placeholder="₹0.00" type="number" />
          </div>
          <div className="col-12 col-md-4">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Stock *</label>
            <input className="input-custom" placeholder="0" type="number" />
          </div>
          <div className="col-12 col-md-6">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Category</label>
            <select className="input-custom">
              {['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Tags (comma separated)</label>
            <input className="input-custom" placeholder="5G, OLED, 48MP..." />
          </div>
          <div className="col-12">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Description *</label>
            <textarea className="input-custom" rows={4} placeholder="Describe your product in detail..." style={{ resize: 'vertical' }} />
          </div>
          <div className="col-12">
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>Product Images</label>
            <div style={{ border: '2px dashed var(--secondary-300)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', cursor: 'pointer', background: 'var(--secondary-100)', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Drop images here or click to upload</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>PNG, JPG, WEBP up to 10MB</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="btn-primary-custom" style={{ padding: '12px 28px', fontSize: 14 }}>Publish Product</button>
          <button className="btn-ghost" style={{ padding: '12px 24px', fontSize: 14 }}>Save Draft</button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders }) {
  return (
    <div>
      <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Recent Orders</h5>
      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--secondary-100)' }}>
              {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--secondary-100)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{order.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{order.customer}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 150 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product}</div></td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{formatPrice(order.amount)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge-${STATUS_COLORS[order.status] || 'secondary'}`} style={{ fontSize: 11, textTransform: 'capitalize' }}>{order.status}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{order.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>View</button>
                    {order.status === 'pending' && (
                      <button style={{ fontSize: 11, color: 'var(--success)', background: 'var(--success-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab({ data }) {
  const maxSales = Math.max(...data.map(d => d.sales));
  return (
    <div>
      <h5 style={{ fontWeight: 700, marginBottom: 24 }}>Sales Analytics</h5>
      <div className="chart-container" style={{ marginBottom: 24 }}>
        <h6 style={{ fontWeight: 700, marginBottom: 24 }}>Revenue (Last 6 Months)</h6>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 220 }}>
          {data.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>₹{formatCompact(d.sales)}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.sales / maxSales) * 160}px` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: i === data.length - 1
                    ? 'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)'
                    : `linear-gradient(180deg, var(--primary)60 0%, var(--primary)30 100%)`,
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.month}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="row g-3">
        {[
          { title: 'Conversion Rate', value: '3.2%', trend: '+0.4%', color: 'var(--success)' },
          { title: 'Avg Order Value', value: '₹4,820', trend: '+₹340', color: 'var(--primary)' },
          { title: 'Return Rate', value: '1.8%', trend: '-0.2%', color: 'var(--accent)' },
        ].map(m => (
          <div key={m.title} className="col-12 col-md-4">
            <div className="stat-card">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{m.title}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{m.trend} vs last month</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ tab }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">🚧</span>
      <h3 className="empty-state-title" style={{ textTransform: 'capitalize' }}>{tab.replace('-', ' ')}</h3>
      <p className="empty-state-text">This section is under development.</p>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiShoppingBag, FiPackage, FiTag, FiDollarSign,
  FiBarChart2, FiSettings, FiLogOut, FiSliders, FiBell, FiImage,
  FiZap, FiCreditCard, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { adminDashboardStats, products, sellers } from '../data/dummy';
import { formatPrice, formatCompact } from '../utils/helpers';

const SIDEBAR = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'hosts', label: 'Hosts / Sellers', icon: FiShoppingBag },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'categories', label: 'Categories', icon: FiTag },
  { id: 'orders', label: 'Orders', icon: FiPackage },
  { id: 'payments', label: 'Payments', icon: FiCreditCard },
  { id: 'wallet', label: 'Wallet', icon: FiDollarSign },
  { id: 'coupons', label: 'Coupons', icon: FiTag },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'homepage', label: 'Homepage Manager', icon: FiSliders },
  { id: 'banners', label: 'Banner Manager', icon: FiImage },
  { id: 'flash-sales', label: 'Flash Sales', icon: FiZap },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const stats = adminDashboardStats;

  if (!user || user.role !== 'admin') {
    return (
      <MainLayout>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🔐</span>
          <h3 className="empty-state-title">Admin Access Required</h3>
          <p className="empty-state-text">Login with admin@demo.com / demo123</p>
          <Link to="/" className="btn-primary-custom" style={{ display: 'inline-flex' }}>Go Home</Link>
        </div>
      </MainLayout>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Users', value: formatCompact(stats.totalUsers), sub: `${formatCompact(stats.activeUsers)} active`, icon: '👥', color: 'var(--primary)' },
    { label: 'Total Sellers', value: stats.totalHosts.toLocaleString(), sub: '98 new this month', icon: '🏪', color: 'var(--purple)' },
    { label: 'Total Products', value: formatCompact(stats.totalProducts), sub: '1,240 added today', icon: '🏷️', color: 'var(--accent)' },
    { label: 'Total Orders', value: formatCompact(stats.totalOrders), sub: '+2,847 today', icon: '📦', color: 'var(--info)' },
    { label: 'Total Revenue', value: `₹${formatCompact(stats.revenue)}`, sub: '+18% this month', icon: '💰', color: 'var(--success)' },
    { label: 'Platform Earnings', value: `₹${formatCompact(stats.platformEarnings)}`, sub: '10% commission', icon: '🏦', color: '#F59E0B' },
    { label: 'Pending Settlements', value: stats.pendingSettlements.toLocaleString(), sub: '₹4.2Cr pending', icon: '⏳', color: 'var(--danger)' },
    { label: 'Active Users Today', value: formatCompact(stats.activeUsers), sub: '+12% vs yesterday', icon: '📊', color: 'var(--secondary)' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <AdminDashboardHome stats={STAT_CARDS} salesData={stats.salesData} />;
      case 'users': return <UsersTab />;
      case 'hosts': return <HostsTab />;
      case 'products': return <ProductsTab />;
      case 'analytics': return <AnalyticsTab data={stats.salesData} />;
      case 'banners': return <BannersTab />;
      default: return <ComingSoon tab={active} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ width: 248, background: '#0A0F1E', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--accent) 0%, #DC2626 100%)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>A</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'white', lineHeight: 1 }}>Admin Panel</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>ShopSphere</div>
            </div>
          </Link>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={user.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(239,68,68,0.4)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {SIDEBAR.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: active === id ? 700 : 400,
                background: active === id ? 'rgba(249,115,22,0.2)' : 'transparent',
                color: active === id ? '#FED7AA' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
                borderLeft: active === id ? '3px solid var(--accent)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (active !== id) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (active !== id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: 'transparent', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          ><FiLogOut size={14} /> Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <div style={{ background: 'white', padding: '16px 32px', borderBottom: '1px solid var(--secondary-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>{active.replace(/-/g, ' ')}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Platform Admin Control Panel</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--secondary-100)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              🕐 Last updated: just now
            </div>
          </div>
        </div>
        <div style={{ padding: '28px 32px' }}>
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardHome({ stats, salesData }) {
  const maxSales = Math.max(...salesData.map(d => d.sales));
  return (
    <div>
      <div className="row g-3 mb-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="col-6 col-xl-3">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>{stat.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiArrowUp size={10} /> {stat.sub}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h6 style={{ fontWeight: 700, margin: 0 }}>Platform Revenue (Last 6 Months)</h6>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Revenue', 'Earnings'].map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l === 'Revenue' ? 'var(--primary)' : 'var(--accent)' }} /> {l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200 }}>
              {salesData.map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>₹{formatCompact(d.sales)}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.sales / maxSales) * 160}px` }}
                    transition={{ delay: i * 0.1, duration: 0.7 }}
                    style={{ width: '100%', borderRadius: '6px 6px 0 0', background: i === salesData.length - 1 ? 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)' : 'linear-gradient(180deg, var(--primary)50 0%, var(--primary)25 100%)' }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="chart-container" style={{ height: '100%' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 20 }}>Platform Health</h6>
            {[
              { label: 'Server Uptime', value: 99.98, color: 'var(--success)' },
              { label: 'Order Fulfillment', value: 94.2, color: 'var(--primary)' },
              { label: 'Seller Satisfaction', value: 88.7, color: 'var(--accent)' },
              { label: 'Buyer Retention', value: 72.4, color: 'var(--purple)' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.value}%</span>
                </div>
                <div className="progress-custom">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ duration: 1, delay: 0.3 }} style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const demoUsers = [
    { id: 'u1', name: 'Yash Kumar', email: 'customer@demo.com', role: 'customer', status: 'active', joined: '2024-01-01', orders: 12 },
    { id: 'u2', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'customer', status: 'active', joined: '2024-01-05', orders: 8 },
    { id: 'u3', name: 'Priya Patel', email: 'priya@example.com', role: 'customer', status: 'inactive', joined: '2023-12-10', orders: 3 },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h5 style={{ fontWeight: 700, margin: 0 }}>All Users</h5>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input-custom" placeholder="Search users..." style={{ width: 220, height: 38, fontSize: 13 }} />
          <button className="btn-ghost" style={{ fontSize: 12 }}>Export CSV</button>
        </div>
      </div>
      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--secondary-100)', background: 'var(--secondary-100)' }}>{['User', 'Email', 'Role', 'Status', 'Joined', 'Orders', 'Actions'].map(h => <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
          <tbody>
            {demoUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--secondary-100)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><span className="badge-primary" style={{ textTransform: 'capitalize', fontSize: 11 }}>{u.role}</span></td>
                <td style={{ padding: '12px 16px' }}><span className={`badge-${u.status === 'active' ? 'success' : 'danger'}`} style={{ fontSize: 11 }}>{u.status}</span></td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{u.joined}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{u.orders}</td>
                <td style={{ padding: '12px 16px' }}><button style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Suspend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HostsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h5 style={{ fontWeight: 700, margin: 0 }}>All Sellers / Hosts</h5>
        <button className="btn-ghost" style={{ fontSize: 12 }}>Export CSV</button>
      </div>
      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--secondary-100)', background: 'var(--secondary-100)' }}>{['Seller', 'Rating', 'Products', 'Sales', 'Revenue', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--secondary-100)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={s.logo} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /><div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div></div></td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}><span style={{ color: '#F59E0B' }}>★</span> {s.rating}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{s.products}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{s.sales.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{formatPrice(s.revenue)}</td>
                <td style={{ padding: '12px 16px' }}><span className={`badge-${s.verified ? 'success' : 'warning'}`} style={{ fontSize: 11 }}>{s.verified ? '✓ Verified' : 'Pending'}</span></td>
                <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', gap: 6 }}><button style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>View</button><button style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Suspend</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h5 style={{ fontWeight: 700, margin: 0 }}>All Products ({products.length})</h5>
        <input className="input-custom" placeholder="Search products..." style={{ width: 240, height: 38, fontSize: 13 }} />
      </div>
      <div className="card-premium" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--secondary-100)', background: 'var(--secondary-100)' }}>{['Product', 'Category', 'Price', 'Stock', 'Seller', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}</tr></thead>
          <tbody>
            {products.slice(0, 8).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--secondary-100)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /><div style={{ fontWeight: 600, fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div></div></td>
                <td style={{ padding: '12px 16px' }}><span className="tag" style={{ fontSize: 11 }}>{p.category}</span></td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{formatPrice(p.price)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: p.stock < 20 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{p.stock}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{p.seller.name}</td>
                <td style={{ padding: '12px 16px' }}><span className="badge-success" style={{ fontSize: 10 }}>Active</span></td>
                <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', gap: 6 }}><button style={{ fontSize: 11, color: 'var(--primary)', background: 'var(--primary-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Edit</button><button style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-10)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Remove</button></div></td>
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
      <h5 style={{ fontWeight: 700, marginBottom: 24 }}>Platform Analytics</h5>
      <div className="chart-container mb-4">
        <h6 style={{ fontWeight: 700, marginBottom: 20 }}>Revenue Overview</h6>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
          {data.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>₹{formatCompact(d.sales)}</div>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.sales / maxSales) * 160}px` }} transition={{ delay: i * 0.1, duration: 0.7 }} style={{ width: '100%', borderRadius: '6px 6px 0 0', background: `linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)`, opacity: i === data.length - 1 ? 1 : 0.5 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannersTab() {
  const bannerTypes = [
    { type: 'Hero Banner', count: 3, status: 'Active', preview: '🖼️' },
    { type: 'Flash Sale', count: 1, status: 'Scheduled', preview: '⚡' },
    { type: 'Festival', count: 2, status: 'Draft', preview: '🎉' },
    { type: 'Coupon', count: 4, status: 'Active', preview: '🎟️' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h5 style={{ fontWeight: 700, margin: 0 }}>Banner Manager</h5>
        <button className="btn-primary-custom" style={{ fontSize: 13, padding: '8px 20px' }}>+ Create Banner</button>
      </div>
      <div className="row g-3">
        {bannerTypes.map(b => (
          <div key={b.type} className="col-12 col-md-6">
            <div className="card-premium" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 48 }}>{b.preview}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.type}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{b.count} banners</div>
                <span className={`badge-${b.status === 'Active' ? 'success' : b.status === 'Scheduled' ? 'primary' : 'warning'}`} style={{ fontSize: 11 }}>{b.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button style={{ fontSize: 12, color: 'var(--primary)', background: 'var(--primary-10)', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>Manage</button>
                <button style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--secondary-100)', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>Preview</button>
              </div>
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
      <h3 className="empty-state-title" style={{ textTransform: 'capitalize' }}>{tab.replace(/-/g, ' ')}</h3>
      <p className="empty-state-text">Under development. Check back soon.</p>
    </div>
  );
}

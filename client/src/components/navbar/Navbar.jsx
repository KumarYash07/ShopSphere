import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiBell, FiUser,
  FiChevronDown, FiMenu, FiX, FiLogOut, FiPackage,
  FiSettings, FiGrid, FiTrendingUp, FiTag
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { categories, notifications } from '../../data/dummy';
import NotificationDropdown from './NotificationDropdown';
import MegaMenu from './MegaMenu';

const NAV_LINKS = [
  { label: 'Offers', path: '/offers', icon: <FiTag /> },
  { label: 'New Arrivals', path: '/products?filter=new', icon: <HiOutlineSparkles /> },
  { label: 'Trending', path: '/products?filter=trending', icon: <FiTrendingUp /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [unread] = useState(notifications.filter(n => !n.read).length);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowMobile(false);
    setShowNotif(false);
    setShowProfile(false);
    setShowMega(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'seller') return '/seller';
    return '/dashboard';
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>🎉 Independence Day Sale — Up to 70% Off! &nbsp;
          <Link to="/offers">Shop Now →</Link>
        </span>
      </div>

      {/* Main Navbar */}
      <nav
        className={`navbar-main ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid var(--secondary-200)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center" style={{ height: 'var(--navbar-height)', gap: 16 }}>
            
            {/* ── Logo ── */}
            <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0" style={{ gap: 8 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: 18,
                boxShadow: 'var(--shadow-primary)',
              }}>S</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--secondary-900)', lineHeight: 1 }}>
                  Shop<span style={{ color: 'var(--primary)' }}>Sphere</span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
                  Multi-Vendor
                </div>
              </div>
            </Link>

            {/* ── Categories Dropdown (desktop) ── */}
            <div className="d-none d-lg-flex position-relative" style={{ flexShrink: 0 }}>
              <button
                className="btn-ghost d-flex align-items-center"
                style={{ gap: 6, fontSize: 14, fontWeight: 600 }}
                onMouseEnter={() => setShowMega(true)}
                onMouseLeave={() => setShowMega(false)}
                onClick={() => setShowMega(v => !v)}
              >
                <FiGrid size={16} /> Categories <FiChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showMega ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <AnimatePresence>
                {showMega && (
                  <div onMouseEnter={() => setShowMega(true)} onMouseLeave={() => setShowMega(false)}>
                    <MegaMenu categories={categories} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Search Bar ── */}
            <form onSubmit={handleSearch} className="d-none d-md-flex flex-grow-1" style={{ maxWidth: 600 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  ref={searchRef}
                  className="input-custom"
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    paddingLeft: 20,
                    paddingRight: 52,
                    borderRadius: 'var(--radius-full)',
                    height: 44,
                    fontSize: 14,
                    border: '2px solid var(--secondary-200)',
                    boxShadow: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute', right: 4, top: 4,
                    width: 36, height: 36,
                    background: 'var(--primary)',
                    border: 'none', borderRadius: 'var(--radius-full)',
                    color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <FiSearch size={16} />
                </button>
              </div>
            </form>

            {/* ── Nav Links (desktop) ── */}
            <div className="d-none d-xl-flex align-items-center" style={{ gap: 4, flexShrink: 0 }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="d-flex align-items-center"
                  style={{
                    gap: 5, padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 13, fontWeight: 600,
                    color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)',
                    background: location.pathname === link.path ? 'var(--primary-10)' : 'transparent',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>

            {/* ── Right Icons ── */}
            <div className="d-flex align-items-center ms-auto" style={{ gap: 4, flexShrink: 0 }}>
              
              {/* Wishlist */}
              <Link to="/wishlist" style={{ position: 'relative', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiHeart size={22} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} />
                {wishlistCount > 0 && (
                  <span className="notif-dot" style={{ top: 2, right: 2 }}>{wishlistCount}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" style={{ position: 'relative', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiShoppingCart size={22} style={{ color: 'var(--text-secondary)' }} />
                {cartCount > 0 && (
                  <span className="notif-dot" style={{ top: 2, right: 2 }}>{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>

              {/* Notifications (only when logged in) */}
              {user && (
                <div style={{ position: 'relative' }}>
                  <button
                    style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                    onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
                  >
                    <FiBell size={22} style={{ color: 'var(--text-secondary)' }} />
                    {unread > 0 && <span className="notif-dot" style={{ top: 2, right: 2 }}>{unread}</span>}
                  </button>
                  <AnimatePresence>
                    {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
                  </AnimatePresence>
                </div>
              )}

              {/* Profile / Login */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'var(--secondary-100)',
                      border: '2px solid var(--secondary-200)',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 12px 4px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <FiChevronDown size={12} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                          background: 'white', borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-xl)', border: '1px solid var(--secondary-200)',
                          minWidth: 220, padding: 8, zIndex: 1000,
                        }}
                      >
                        <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--secondary-100)', marginBottom: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                          <span className={`badge-${user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'accent' : 'primary'}`} style={{ marginTop: 6, display: 'inline-block', textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                        <Link to={getDashboardPath()} className="sidebar-link" style={{ borderRadius: 8 }} onClick={() => setShowProfile(false)}>
                          <FiGrid className="icon" /> Dashboard
                        </Link>
                        <Link to="/orders" className="sidebar-link" style={{ borderRadius: 8 }} onClick={() => setShowProfile(false)}>
                          <FiPackage className="icon" /> My Orders
                        </Link>
                        <Link to="/dashboard?tab=settings" className="sidebar-link" style={{ borderRadius: 8 }} onClick={() => setShowProfile(false)}>
                          <FiSettings className="icon" /> Settings
                        </Link>
                        <div style={{ borderTop: '1px solid var(--secondary-100)', marginTop: 8, paddingTop: 8 }}>
                          <button className="sidebar-link" style={{ borderRadius: 8, color: 'var(--danger)', width: '100%' }} onClick={() => { logout(); setShowProfile(false); }}>
                            <FiLogOut className="icon" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="d-flex" style={{ gap: 8 }}>
                  <Link to="/login" className="btn-ghost d-none d-sm-flex text-decoration-none" style={{ fontSize: 13, padding: '8px 16px' }}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary-custom d-none d-sm-flex text-decoration-none" style={{ fontSize: 13, padding: '8px 20px' }}>
                    Sign Up
                  </Link>
                  <Link to="/login" className="d-sm-none" style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser size={22} style={{ color: 'var(--text-secondary)' }} />
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="d-md-none"
                style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
                onClick={() => setShowMobile(v => !v)}
              >
                {showMobile ? <FiX size={24} style={{ color: 'var(--text-primary)' }} /> : <FiMenu size={24} style={{ color: 'var(--text-primary)' }} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="d-md-none pb-2">
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                className="input-custom"
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 16, paddingRight: 48, borderRadius: 'var(--radius-full)', height: 40, fontSize: 14 }}
              />
              <button type="submit" style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32, background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-full)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSearch size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'white', borderTop: '1px solid var(--secondary-200)', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_LINKS.map(link => (
                  <Link key={link.path} to={link.path} className="sidebar-link" style={{ borderRadius: 8 }}>
                    {link.icon} {link.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--secondary-100)', marginTop: 8, paddingTop: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 16px 8px', margin: 0 }}>Categories</p>
                  {categories.slice(0, 6).map(cat => (
                    <Link key={cat.id} to={`/products?category=${cat.name}`} className="sidebar-link" style={{ borderRadius: 8 }}>
                      <span>{cat.icon}</span> {cat.name}
                    </Link>
                  ))}
                </div>
                {!user && (
                  <div style={{ display: 'flex', gap: 8, padding: '12px 0 0' }}>
                    <Link to="/login" className="btn-outline-custom flex-grow-1 justify-content-center text-decoration-none" style={{ fontSize: 14 }} onClick={() => setShowMobile(false)}>Login</Link>
                    <Link to="/register" className="btn-primary-custom flex-grow-1 justify-content-center text-decoration-none" style={{ fontSize: 14 }} onClick={() => setShowMobile(false)}>Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

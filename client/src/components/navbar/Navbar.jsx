import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiChevronDown, FiMenu, FiX, FiLogOut, FiPackage,
  FiSettings, FiGrid, FiTrendingUp, FiTag
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getCategoriesApi } from '../../api/categoryApi';

const NAV_LINKS = [
  { label: 'Offers', path: '/offers', icon: <FiTag /> },
  { label: 'New Arrivals', path: '/products?sort=newest', icon: <HiOutlineSparkles /> },
  { label: 'Top Rated', path: '/products?sort=rating', icon: <FiTrendingUp /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [categories, setCategories] = useState([]);

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
    setShowProfile(false);
    setShowMega(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories for nav:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'host') return '/seller';
    return '/dashboard';
  };

  const userName = user ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || user.email) : '';
  const userRole = user?.role || 'user';
  const userAvatar = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4F46E5&color=fff`;

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar bg-dark text-white text-center py-2 px-3 small fw-medium" style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)' }}>
        <span>🎉 Festival Shopping Season — Save Up to 70% Off on Top Categories! &nbsp;
          <Link to="/offers" className="text-warning fw-bold text-decoration-none">Shop Sale →</Link>
        </span>
      </div>

      {/* Main Navbar */}
      <nav
        className={`navbar-main ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'white',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center" style={{ height: '70px', gap: 16 }}>
            
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0" style={{ gap: 8 }}>
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: 20,
                boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
              }}>S</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                  Shop<span style={{ color: '#4F46E5' }}>Sphere</span>
                </div>
                <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1, marginTop: 2 }}>
                  Marketplace
                </div>
              </div>
            </Link>

            {/* Categories Dropdown (desktop) */}
            <div className="d-none d-lg-flex position-relative" style={{ flexShrink: 0 }}>
              <button
                className="btn btn-light d-flex align-items-center border-0 px-3 py-2 rounded-3"
                style={{ gap: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}
                onMouseEnter={() => setShowMega(true)}
                onMouseLeave={() => setShowMega(false)}
                onClick={() => setShowMega(v => !v)}
              >
                <FiGrid size={16} /> Categories <FiChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showMega ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              
              <AnimatePresence>
                {showMega && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setShowMega(true)}
                    onMouseLeave={() => setShowMega(false)}
                    style={{
                      position: 'absolute', top: '100%', left: 0,
                      background: 'white', border: '1px solid #e2e8f0',
                      borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      padding: 16, minWidth: 260, zIndex: 1050,
                    }}
                  >
                    <div className="fw-bold text-uppercase small text-muted mb-2 px-2">Browse Categories</div>
                    {categories.length === 0 ? (
                      <div className="text-muted small px-2">No categories available</div>
                    ) : (
                      categories.map(cat => (
                        <Link
                          key={cat._id}
                          to={`/products?category=${cat._id}`}
                          className="d-flex align-items-center justify-content-between text-decoration-none text-dark py-2 px-3 rounded-2 dropdown-item-custom"
                          style={{ transition: 'background 0.2s' }}
                        >
                          <span className="fw-medium" style={{ fontSize: 14 }}>{cat.name}</span>
                          <span className="badge bg-light text-muted rounded-pill" style={{ fontSize: 10 }}>View</span>
                        </Link>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="d-none d-md-flex flex-grow-1" style={{ maxWidth: 580 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  ref={searchRef}
                  className="form-control rounded-pill pe-5 ps-4 py-2"
                  type="text"
                  placeholder="Search products, brands and categories..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    height: 44,
                    fontSize: 14,
                    borderColor: '#cbd5e1',
                    boxShadow: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute', right: 4, top: 4,
                    width: 36, height: 36,
                    background: '#4F46E5',
                    border: 'none', borderRadius: '50%',
                    color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <FiSearch size={16} />
                </button>
              </div>
            </form>

            {/* Nav Links (desktop) */}
            <div className="d-none d-xl-flex align-items-center" style={{ gap: 4, flexShrink: 0 }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="d-flex align-items-center text-decoration-none px-3 py-2 rounded-3"
                  style={{
                    gap: 6,
                    fontSize: 14, fontWeight: 600,
                    color: location.pathname === link.path ? '#4F46E5' : '#475569',
                    background: location.pathname === link.path ? '#eef2ff' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>

            {/* Right Action Icons */}
            <div className="d-flex align-items-center ms-auto" style={{ gap: 8, flexShrink: 0 }}>
              
              {/* Wishlist */}
              <Link to="/wishlist" className="position-relative p-2 text-decoration-none text-secondary">
                <FiHeart size={22} />
                {wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="position-relative p-2 text-decoration-none text-secondary">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: 10 }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile / Auth */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowProfile(v => !v)}
                    className="btn btn-light d-flex align-items-center gap-2 rounded-pill px-3 py-1 border"
                    style={{ background: '#f8fafc' }}
                  >
                    <img src={userAvatar} alt={userName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    <span className="fw-semibold text-dark text-truncate" style={{ fontSize: 13, maxWidth: 100 }}>
                      {userName.split(' ')[0]}
                    </span>
                    <FiChevronDown size={12} className="text-muted" style={{ transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0)' }} />
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
                          background: 'white', borderRadius: 12,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
                          minWidth: 220, padding: 8, zIndex: 1050,
                        }}
                      >
                        <div className="p-3 border-bottom mb-2">
                          <div className="fw-bold text-dark text-truncate">{userName}</div>
                          <div className="small text-muted text-truncate">{user.email}</div>
                          <span className={`badge ${userRole === 'admin' ? 'bg-danger' : userRole === 'host' ? 'bg-warning text-dark' : 'bg-indigo'} mt-2 text-capitalize`}>
                            {userRole === 'host' ? 'Seller / Host' : userRole}
                          </span>
                        </div>

                        <Link to={getDashboardPath()} className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark rounded-2 hover-bg-light" onClick={() => setShowProfile(false)}>
                          <FiGrid className="text-primary" /> Dashboard
                        </Link>
                        <Link to="/dashboard?tab=orders" className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark rounded-2 hover-bg-light" onClick={() => setShowProfile(false)}>
                          <FiPackage className="text-primary" /> My Orders
                        </Link>
                        <Link to="/dashboard?tab=profile" className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark rounded-2 hover-bg-light" onClick={() => setShowProfile(false)}>
                          <FiSettings className="text-primary" /> Profile Settings
                        </Link>

                        <div className="border-top mt-2 pt-2">
                          <button className="w-100 d-flex align-items-center gap-2 p-2 btn btn-link text-danger text-decoration-none border-0" onClick={() => { logout(); setShowProfile(false); }}>
                            <FiLogOut /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-semibold">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold" style={{ background: '#4F46E5', borderColor: '#4F46E5' }}>
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="btn btn-link d-md-none text-dark p-1 ms-1"
                onClick={() => setShowMobile(v => !v)}
              >
                {showMobile ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="d-md-none pb-2">
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                className="form-control rounded-pill pe-5 ps-3 py-2"
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ fontSize: 14 }}
              />
              <button type="submit" style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32, background: '#4F46E5', border: 'none', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSearch size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-top overflow-hidden"
            >
              <div className="p-3 d-flex flex-column gap-2">
                {NAV_LINKS.map(link => (
                  <Link key={link.path} to={link.path} className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark rounded-2" onClick={() => setShowMobile(false)}>
                    {link.icon} {link.label}
                  </Link>
                ))}
                
                <div className="border-top pt-2 mt-2">
                  <div className="fw-bold text-uppercase small text-muted px-2 mb-1">Categories</div>
                  {categories.slice(0, 5).map(cat => (
                    <Link key={cat._id} to={`/products?category=${cat._id}`} className="d-block p-2 text-decoration-none text-dark rounded-2" onClick={() => setShowMobile(false)}>
                      {cat.name}
                    </Link>
                  ))}
                </div>

                {!user && (
                  <div className="d-flex gap-2 pt-3 border-top mt-2">
                    <Link to="/login" className="btn btn-outline-primary w-50" onClick={() => setShowMobile(false)}>Login</Link>
                    <Link to="/register" className="btn btn-primary w-50" style={{ background: '#4F46E5' }} onClick={() => setShowMobile(false)}>Register</Link>
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

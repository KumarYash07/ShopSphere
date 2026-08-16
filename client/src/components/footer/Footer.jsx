import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const footerLinks = {
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Press', path: '/press' },
    { label: 'Blog', path: '/blog' },
  ],
  Support: [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Returns', path: '/returns' },
    { label: 'Track Order', path: '/orders' },
  ],
  Business: [
    { label: 'Become a Seller', path: '/register?type=seller' },
    { label: 'Advertise', path: '/advertise' },
    { label: 'Partner Program', path: '/partners' },
    { label: 'Affiliate', path: '/affiliate' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Disclaimer', path: '/disclaimer' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--secondary-900)', color: 'white', marginTop: 80 }}>
      {/* Main Footer */}
      <div className="container-fluid px-4 py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb-3" style={{ gap: 10 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 20 }}>S</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>Shop<span style={{ color: 'var(--primary-light)' }}>Sphere</span></div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Multi-Vendor Marketplace</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              India's fastest-growing multi-vendor marketplace. Shop from thousands of verified sellers with confidence.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="col-6 col-md-2">
              <h6 style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>{section}</h6>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="col-12 col-md-4 col-lg-3">
            <h6 style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>Contact</h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { Icon: FiMail, text: 'support@shopsphere.in' },
                { Icon: FiPhone, text: '+91 1800 000 0000' },
                { Icon: FiMapPin, text: 'Bengaluru, Karnataka, India' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color: 'var(--primary-light)' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Payment Icons */}
            <div style={{ marginTop: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Secure Payments</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['VISA', 'MASTER', 'UPI', 'PAYTM', 'GPay', 'COD'].map(p => (
                  <span key={p} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px' }}>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between" style={{ gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            © 2024 ShopSphere Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

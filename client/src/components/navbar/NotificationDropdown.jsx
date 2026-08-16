import { motion } from 'framer-motion';
import { notifications } from '../../data/dummy';
import { FiBell, FiCheck } from 'react-icons/fi';

export default function NotificationDropdown({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
        background: 'white', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--secondary-200)',
        minWidth: 340, zIndex: 1000, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--secondary-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiBell size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</span>
          <span className="badge-primary" style={{ fontSize: 11 }}>{notifications.filter(n => !n.read).length} New</span>
        </div>
        <button style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          Mark all read
        </button>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.map((notif, i) => (
          <div
            key={notif.id}
            style={{
              padding: '12px 16px',
              background: notif.read ? 'transparent' : 'var(--primary-10)',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--secondary-100)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-100)'}
            onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'var(--primary-10)'}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--secondary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {notif.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 3 }}>{notif.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{notif.time}</div>
            </div>
            {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--secondary-100)', textAlign: 'center' }}>
        <button style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All Notifications</button>
      </div>
    </motion.div>
  );
}

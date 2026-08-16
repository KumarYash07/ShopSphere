import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DUMMY_USERS = {
  customer: { id: 'u1', name: 'Yash Kumar', email: 'customer@demo.com', password: 'demo123', role: 'customer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', phone: '9876543210' },
  seller: { id: 's1', name: 'iStore Official', email: 'seller@demo.com', password: 'demo123', role: 'seller', avatar: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&q=80', storeName: 'iStore Official', phone: '9988776655' },
  admin: { id: 'a1', name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80', phone: '9000000000' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_user')) || null; } catch { return null; }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('ss_user', JSON.stringify(user));
    else localStorage.removeItem('ss_user');
  }, [user]);

  const login = (email, password) => {
    const found = Object.values(DUMMY_USERS).find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return { success: true, user: found }; }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (data) => {
    const newUser = { id: `u_${Date.now()}`, ...data, role: data.role || 'customer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80' };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => { setUser(null); };

  const openLogin = () => { setShowLogin(true); setShowRegister(false); };
  const openRegister = () => { setShowRegister(true); setShowLogin(false); };
  const closeAuth = () => { setShowLogin(false); setShowRegister(false); };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, showLogin, showRegister, openLogin, openRegister, closeAuth, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, verifyEmailApi, getProfileApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_user')) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ss_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  // Fetch current user profile if token exists on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ss_token');
      if (storedToken) {
        try {
          const data = await getProfileApi();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('ss_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Failed to verify session profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  // Listen to 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = (e) => {
      setAuthError(e.detail || 'Session expired. Please log in again.');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await loginApi({ email, password });
      if (data.success && data.token) {
        localStorage.setItem('ss_token', data.token);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        closeAuth();
        return { success: true, user: data.user, token: data.token, message: data.message };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const data = await registerApi(formData);
      if (data.success) {
        return { success: true, email: data.email, userId: data.userId, message: data.message };
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (email, otp) => {
    setAuthError(null);
    try {
      const data = await verifyEmailApi({ email, otp });
      if (data.success) {
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, error: data.message || 'Verification failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const openLogin = () => { setShowLogin(true); setShowRegister(false); };
  const openRegister = () => { setShowRegister(true); setShowLogin(false); };
  const closeAuth = () => { setShowLogin(false); setShowRegister(false); };

  const value = {
    user,
    token,
    loading,
    authError,
    setAuthError,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    isHost: user?.role === 'host',
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    login,
    register,
    verifyEmail,
    logout,
    showLogin,
    showRegister,
    openLogin,
    openRegister,
    closeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

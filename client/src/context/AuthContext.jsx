import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi, registerApi, verifyEmailApi, getProfileApi, updateProfileApi,
  requestEmailChangeApi, verifyEmailChangeApi, googleAuthApi, createPasswordApi
} from '../api/authApi';

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
      const payload = {
        email: String(email || '').trim(),
        password: String(password || ''),
      };
      const data = await loginApi(payload);
      if (data.success && data.token) {
        localStorage.setItem('ss_token', data.token);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        closeAuth();
        return { success: true, user: data.user, token: data.token, message: data.message };
      }
      const errorMsg = data.message || 'Login failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (err) {
      console.error('Login API error:', err.response || err);
      let message = 'Unable to connect to server. Please make sure the backend is running.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response) {
        message = `Server error (${err.response.status}). Please try again later.`;
      }
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const googleLogin = async (credential) => {
    setAuthError(null);
    try {
      const data = await googleAuthApi({ idToken: credential });
      if (data.success && data.token) {
        localStorage.setItem('ss_token', data.token);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        closeAuth();
        return { success: true, user: data.user, token: data.token, message: data.message };
      }
      const errorMsg = data.message || 'Google sign-in failed. Please try again.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (err) {
      console.error('Google Auth API error:', err.response || err);
      let message = 'Unable to connect to server. Please try again later.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response) {
        message = `Server error (${err.response.status}). Please try again later.`;
      }
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

  const updateUserProfile = async (formData) => {
    setAuthError(null);
    try {
      const data = await updateProfileApi(formData);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, error: data.message || 'Failed to update profile' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const requestEmailChange = async (newEmail) => {
    setAuthError(null);
    try {
      const data = await requestEmailChangeApi({ newEmail });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to request email change.';
      return { success: false, message };
    }
  };

  const verifyEmailChange = async (newEmail, otp) => {
    setAuthError(null);
    try {
      const data = await verifyEmailChangeApi({ newEmail, otp });
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to verify email change.';
      return { success: false, message };
    }
  };

  const createPassword = async (newPassword, confirmPassword) => {
    setAuthError(null);
    try {
      const data = await createPasswordApi({ newPassword, confirmPassword });
      if (data.success) {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('ss_user', JSON.stringify(data.user));
        } else {
          setUser(prev => {
            const updated = prev ? { ...prev, hasPassword: true } : null;
            if (updated) localStorage.setItem('ss_user', JSON.stringify(updated));
            return updated;
          });
        }
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || 'Failed to create password' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create password. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

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
    googleLogin,
    register,
    verifyEmail,
    updateUserProfile,
    requestEmailChange,
    verifyEmailChange,
    createPassword,
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

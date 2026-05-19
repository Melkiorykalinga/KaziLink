import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const navigate = window.location ? null : null; // we will use window.location directly or we can use react-router-dom later if passed down

  // Session expiry modal trigger
  const triggerSessionExpiry = () => {
    setShowExpiryModal(true);
  };

  // 401 Interceptor
  useEffect(() => {
    const resInterceptor = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response && err.response.status === 401) {
          triggerSessionExpiry();
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Idle Timer & Tab Focus
  useEffect(() => {
    if (!token) return;

    let idleTimer;
    let absoluteTimer;
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    const ABSOLUTE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        triggerSessionExpiry();
      }, IDLE_TIMEOUT_MS);
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    // Track activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleUserActivity));
    resetIdleTimer();

    // Absolute timeout
    absoluteTimer = setTimeout(() => {
      triggerSessionExpiry();
    }, ABSOLUTE_TIMEOUT_MS);

    // Tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        api.get('/auth/verify').catch(() => triggerSessionExpiry());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleUserActivity));
      clearTimeout(idleTimer);
      clearTimeout(absoluteTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      // Verify token and load user profile
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
        })
        .catch(err => {
          console.error("Token invalid or expired", err);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await api.post('/auth/logout');
      } catch (e) {}
    }
    setToken(null);
    setUser(null);
    localStorage.clear();
    // clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login';
  };

  const handleModalLoginAgain = () => {
    setShowExpiryModal(false);
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
      {showExpiryModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1e293b' }}>Session Expired</h3>
            <p style={{ margin: '0 0 8px', color: '#475569' }}>Session expired. Please login again.</p>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>Kikao chako kimeisha. Tafadhali ingia tena.</p>
            <button onClick={handleModalLoginAgain} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Login Again
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

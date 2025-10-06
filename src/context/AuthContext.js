import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { apiLogin, apiRegister, apiValidateToken, apiGetUserByEmail, apiUpdateUser, clearTokens, setTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    if (!access || !refresh) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const validation = await apiValidateToken();
        if (validation?.valid && validation?.email) {
          const u = await apiGetUserByEmail(validation.email);
          setUser(u);
          setIsAuthenticated(true);
        } else {
          clearTokens();
        }
      } catch (_) {
        clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const tokens = await apiLogin(email, password);
    if (!(tokens?.accessToken && tokens?.refreshToken)) throw new Error('Invalid login response');
    const profile = await apiGetUserByEmail(email);
    setUser(profile);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const register = useCallback(async (email, password, name, surname, birthDate) => {
    await apiRegister({ email, password, name, surname, birthDate: birthDate || null });
    await login(email, password);
    return { success: true };
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) throw new Error('No user');
    const updated = await apiUpdateUser(String(user.id), { ...user, ...updates });
    setUser(updated);
    return { success: true };
  }, [user]);

  const value = useMemo(() => ({ isAuthenticated, user, login, register, logout, updateProfile, loading }), [isAuthenticated, user, login, register, logout, updateProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



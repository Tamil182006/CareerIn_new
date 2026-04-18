'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// AuthProvider — wrap your app with this
// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true while reading localStorage

  // On first render — restore session from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('careerin_token');
      const savedUser  = localStorage.getItem('careerin_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // If localStorage is corrupt just clear it
      localStorage.removeItem('careerin_token');
      localStorage.removeItem('careerin_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Call this after a successful login or signup ──────────────────────────
  const authLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('careerin_token', authToken);
    localStorage.setItem('careerin_user', JSON.stringify(userData));
  };

  // ── Call this to log the user out ─────────────────────────────────────────
  const authLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careerin_token');
    localStorage.removeItem('careerin_user');
  };

  // ── Update interests after onboarding ────────────────────────────────────
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('careerin_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, authLogin, authLogout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useAuth hook — use this anywhere inside the app
// ─────────────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

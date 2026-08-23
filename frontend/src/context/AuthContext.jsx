import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import i18n from '../i18n';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coop_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize language: default strictly to 'en' unless user manually chose otherwise in localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('coop_lang') || 'en';
    i18n.changeLanguage(savedLang);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          // Keep active language strictly as user's manual preference or default 'en'
          const currentLang = localStorage.getItem('coop_lang') || 'en';
          i18n.changeLanguage(currentLang);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const loginWithOtp = async (phone, otp, fullName, role) => {
    const currentLang = localStorage.getItem('coop_lang') || 'en';
    const res = await API.post('/auth/verify-otp', { phone, otp, fullName, role, language: currentLang });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('coop_token', res.data.token);
      setUser(res.data.user);
      i18n.changeLanguage(currentLang);
      return res.data.user;
    }
  };

    const login = async (identifier, password) => {
    const res = await API.post('/auth/login', { identifier, password });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('coop_token', res.data.token);
      setUser(res.data.user);
      const currentLang = localStorage.getItem('coop_lang') || 'en';
      i18n.changeLanguage(currentLang);
      return res.data.user;
    }
  };

  const loginAdmin = async (email, password) => {
    const res = await API.post('/auth/admin-login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('coop_token', res.data.token);
      setUser(res.data.user);
      const currentLang = localStorage.getItem('coop_lang') || 'en';
      i18n.changeLanguage(currentLang);
      return res.data.user;
    }
  };

  const registerCustomer = async (payload) => {
    const res = await API.post('/auth/register-customer', payload);
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('coop_token', res.data.token);
      setUser(res.data.user);
      const currentLang = localStorage.getItem('coop_lang') || 'en';
      i18n.changeLanguage(currentLang);
      return res.data.user;
    }
  };

  const registerWorker = async (formData) => {
    const res = await API.post('/auth/register-worker', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('coop_token', res.data.token);
      setUser(res.data.user);
      const currentLang = localStorage.getItem('coop_lang') || 'en';
      i18n.changeLanguage(currentLang);
      return res.data.user;
    }
  };

  // Manual language switcher called ONLY from Navbar button
  const switchLanguage = async (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('coop_lang', lang);
    if (user && token) {
      try {
        await API.patch('/auth/language', { language: lang });
        setUser({ ...user, language: lang });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('coop_token');
    // Keep user's chosen language intact or default to en
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginWithOtp,
        login,
        loginAdmin,
        registerWorker,
        registerCustomer,
        switchLanguage,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

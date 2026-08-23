import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ProfileModal } from './ProfileModal';
import {
  ShieldCheck,
  Bell,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Menu,
  X,
  Siren,
  User,
  ChevronDown,
  Calendar,
  IndianRupee,
  HeartHandshake
} from 'lucide-react';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, switchLanguage } = useAuth();
  const { unreadCount, notifications, markAllRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'worker': return '/worker/dashboard';
      case 'coop_admin': return '/admin/dashboard';
      case 'fed_admin': return '/federation/dashboard';
      default: return '/customer/dashboard';
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'worker':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">Worker</span>;
      case 'coop_admin':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">Coop Admin</span>;
      case 'fed_admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">Federation</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">Customer</span>;
    }
  };

  const getDisplayName = () => {
    if (!user?.fullName) return 'User';
    return user.fullName.split('(')[0].trim();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-[50000] border-b border-slate-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo.png"
                alt="ServiceSetu Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-coop-800 to-coop-600 bg-clip-text text-transparent leading-tight tracking-tight">
                {t('brand')}
              </span>
              <span className="hidden xl:block text-[10px] text-slate-400 font-semibold tracking-tight">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isActive('/') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Customer Links */}
            {(!user || user?.role === 'customer') && (
              <>
                <Link
                  to="/customer/services"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    isActive('/customer/services') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-coop-500" />
                  Services
                </Link>
                {user && (
                  <Link
                    to="/customer/bookings"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive('/customer/bookings') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                    }`}
                  >
                    Bookings
                  </Link>
                )}
                <Link
                  to="/customer/emergency"
                  className="ml-1 px-3 py-1.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm shadow-red-600/30 flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <Siren className="w-3.5 h-3.5 text-yellow-300" />
                  Need Now
                </Link>
              </>
            )}

            {/* Worker Links */}
            {user?.role === 'worker' && (
              <>
                <Link
                  to="/worker/earnings"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/worker/earnings') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.earnings')}
                </Link>
                <Link
                  to="/worker/welfare"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/worker/welfare') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.welfare')}
                </Link>
                <Link
                  to="/worker/schedule"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/worker/schedule') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Schedule
                </Link>
              </>
            )}

            {/* Cooperative Admin Links */}
            {user?.role === 'coop_admin' && (
              <>
                <Link
                  to="/admin/verifications"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/admin/verifications') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Verifications
                </Link>
                <Link
                  to="/admin/pricing"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/admin/pricing') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Pricing & Catalog
                </Link>
                <Link
                  to="/admin/grievances"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/admin/grievances') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Grievances
                </Link>
              </>
            )}

            {/* Federation Admin Links */}
            {user?.role === 'fed_admin' && (
              <>
                <Link
                  to="/federation/forecasting"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/federation/forecasting') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/federation/allocation"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/federation/allocation') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Allocations
                </Link>
                <Link
                  to="/federation/broadcast"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive('/federation/broadcast') ? 'text-coop-700 bg-coop-50' : 'text-slate-600 hover:text-coop-600 hover:bg-slate-50'
                  }`}
                >
                  Broadcast
                </Link>
              </>
            )}

            {user && (
              <Link
                to={getDashboardLink()}
                className="ml-1 px-3 py-1.5 rounded-xl text-xs font-black text-coop-700 hover:text-coop-800 bg-coop-50 hover:bg-coop-100 border border-coop-200 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-coop-600" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Action Tools: Language, Notifications, Profile Pill */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 border border-slate-200 text-[10px] sm:text-[11px] font-bold">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg transition-all ${i18n.language === 'en' ? 'bg-white text-coop-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguage('hi')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg transition-all ${i18n.language === 'hi' ? 'bg-white text-coop-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
              >
                हिन्दी
              </button>
            </div>

            {/* Notifications Button & Dropdown */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileDropdown(false);
                    setShowMobileMenu(false);
                    if (!showNotifications) markAllRead();
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Window */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-[99999] animate-in fade-in">
                    <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Notifications & Alerts</h4>
                      <span className="text-[10px] text-coop-600 font-bold">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 text-xs">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              setShowNotifications(false);
                              if (user?.role === 'worker') {
                                if (location.pathname === '/worker/dashboard') {
                                  document.getElementById('active-job-section')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  navigate('/worker/dashboard#active-job-section');
                                  setTimeout(() => {
                                    document.getElementById('active-job-section')?.scrollIntoView({ behavior: 'smooth' });
                                  }, 400);
                                }
                              } else if (n.link) {
                                navigate(n.link);
                              }
                            }}
                            className="p-3 hover:bg-coop-50/60 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-800 group-hover:text-coop-700 transition-colors">{n.title}</p>
                              <span className="text-[9px] text-coop-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                            </div>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar Button & Dropdown Menu */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifications(false);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-coop-700 to-coop-500 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col max-w-[130px] lg:max-w-[160px]">
                    <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {getDisplayName()}
                    </span>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform shrink-0" />
                </button>

                {/* Profile Details Dropdown Menu (Opened exclusively from Avatar button) */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[99999] animate-in fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <h4 className="font-extrabold text-slate-900 text-xs">{user.fullName}</h4>
                      <p className="text-[11px] text-slate-500">{user.phone || user.email}</p>
                      <div className="mt-1">{getRoleBadge()}</div>
                    </div>

                    <div className="py-1 text-xs text-slate-700">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 font-semibold text-coop-700"
                      >
                        <User className="w-4 h-4 text-coop-600" />
                        Edit Profile Details
                      </button>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </Link>

                      {user.role === 'customer' && (
                        <Link
                          to="/customer/bookings"
                          onClick={() => setShowProfileDropdown(false)}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 font-medium"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          My Bookings & Invoices
                        </Link>
                      )}

                      {user.role === 'worker' && (
                        <>
                          <Link
                            to="/worker/earnings"
                            onClick={() => setShowProfileDropdown(false)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <IndianRupee className="w-4 h-4 text-slate-400" />
                            Earnings Ledger & Payouts
                          </Link>
                          <Link
                            to="/worker/welfare"
                            onClick={() => setShowProfileDropdown(false)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <HeartHandshake className="w-4 h-4 text-slate-400" />
                            Welfare & Insurance (₹3L)
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-xs font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-coop-700 hover:bg-coop-50 rounded-xl transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/customer/register"
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-coop-600 to-coop-500 text-white rounded-xl shadow-xs hover:from-coop-700 hover:to-coop-600 transition-all whitespace-nowrap"
                >
                  Register as Customer
                </Link>
                <Link
                  to="/worker/register"
                  className="hidden sm:inline-block px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all whitespace-nowrap"
                >
                  Join as Worker
                </Link>
              </div>
            )}

            {/* 3-Line Mobile Hamburger Menu Button (Visible ONLY on mobile/tablet below md breakpoint) */}
            <button
              type="button"
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                setShowProfileDropdown(false);
                setShowNotifications(false);
              }}
              className="md:hidden p-1.5 sm:p-2 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {showMobileMenu ? <X className="w-5 h-5 text-coop-700" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Line Hamburger Menu Drawer (Functional on mobile/tablet below md breakpoint) */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 sm:px-6 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-3 w-full">
          <Link
            to="/"
            onClick={() => setShowMobileMenu(false)}
            className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive('/') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t('nav.home')}
          </Link>

          {(!user || user?.role === 'customer') && (
            <>
              <Link
                to="/customer/services"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/customer/services') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-coop-500" />
                Services Catalog
              </Link>
              {user && (
                <Link
                  to="/customer/bookings"
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/customer/bookings') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  My Bookings & Invoices
                </Link>
              )}
              <Link
                to="/customer/emergency"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-sm"
              >
                <Siren className="w-4 h-4 text-yellow-300" />
                Emergency Need Now
              </Link>
            </>
          )}

          {user?.role === 'worker' && (
            <>
              <Link
                to="/worker/earnings"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/worker/earnings') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Earnings Ledger & Payouts
              </Link>
              <Link
                to="/worker/welfare"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/worker/welfare') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Welfare & Insurance (₹3L)
              </Link>
              <Link
                to="/worker/schedule"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/worker/schedule') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Availability Schedule
              </Link>
            </>
          )}

          {user?.role === 'coop_admin' && (
            <>
              <Link
                to="/admin/verifications"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/admin/verifications') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Worker KYC Verifications
              </Link>
              <Link
                to="/admin/pricing"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/admin/pricing') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pricing & Catalog Settings
              </Link>
              <Link
                to="/admin/grievances"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/admin/grievances') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Grievances Resolution
              </Link>
            </>
          )}

          {user?.role === 'fed_admin' && (
            <>
              <Link
                to="/federation/forecasting"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/federation/forecasting') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Predictive Analytics
              </Link>
              <Link
                to="/federation/allocation"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/federation/allocation') ? 'bg-coop-700 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Workforce Allocations
              </Link>
              <Link
                to="/federation/broadcast"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/federation/broadcast') ? 'bg-coop-50 text-coop-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                National Broadcasts
              </Link>
            </>
          )}

          {user && (
            <Link
              to={getDashboardLink()}
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-coop-50 text-coop-700 rounded-xl text-xs font-black border border-coop-200"
            >
              <LayoutDashboard className="w-4 h-4 text-coop-600" />
              Go to Dashboard
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/customer/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full py-3 bg-gradient-to-r from-coop-600 to-coop-500 text-white text-center rounded-xl text-xs font-black shadow-sm"
                >
                  Register as a Customer
                </Link>
                <Link
                  to="/worker/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full py-2.5 bg-amber-50 text-amber-900 border border-amber-200 text-center rounded-xl text-xs font-bold"
                >
                  Register as a Worker
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  logout();
                  navigate('/');
                }}
                className="w-full py-2.5 px-3.5 text-left text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </nav>
  );
};

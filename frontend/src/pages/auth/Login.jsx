import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, Lock, Mail, ArrowRight, User, Phone } from 'lucide-react';

export const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter your email/mobile and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      showToast(`Welcome back, ${user.fullName}!`, 'success');

      // Navigate directly based on user role
      if (user.role === 'customer') {
        navigate('/');
      } else if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'coop_admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'fed_admin') {
        navigate('/federation/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid email/mobile or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Accounts Pre-filler
  const selectDemoAccount = (role) => {
    if (role === 'customer') {
      setIdentifier('9876543210');
      setPassword('pass123');
    } else if (role === 'worker') {
      setIdentifier('9811000101');
      setPassword('worker123');
    } else if (role === 'coop_admin') {
      setIdentifier('admin@shramik.coop');
      setPassword('coop123');
    } else if (role === 'fed_admin') {
      setIdentifier('admin@federation.coop');
      setPassword('FedCoop@2026!Secured');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-coop-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-coop-600/20 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t('nav.login')}</h2>
          <p className="text-xs text-slate-500 mt-1">Cooperative Gig Services Unified Portal</p>
        </div>

        {/* Quick Demo Accounts Selector (Pre-fills credentials for all 4 profiles) */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-6">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            ⚡ Quick Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => selectDemoAccount('customer')}
              className="py-2 px-2.5 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-all text-center flex items-center justify-center gap-1 shadow-xs"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => selectDemoAccount('worker')}
              className="py-2 px-2.5 bg-amber-50 text-amber-800 rounded-xl hover:bg-amber-100 border border-amber-200 transition-all text-center flex items-center justify-center gap-1 shadow-xs"
            >
              👷 Worker (Rajesh)
            </button>
            <button
              type="button"
              onClick={() => selectDemoAccount('coop_admin')}
              className="py-2 px-2.5 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 border border-blue-200 transition-all text-center flex items-center justify-center gap-1 shadow-xs"
            >
              🏛️ Coop Admin
            </button>
            <button
              type="button"
              onClick={() => selectDemoAccount('fed_admin')}
              className="py-2 px-2.5 bg-purple-50 text-purple-800 rounded-xl hover:bg-purple-100 border border-purple-200 transition-all text-center flex items-center justify-center gap-1 shadow-xs"
            >
              👑 Fed Admin
            </button>
          </div>
        </div>

        {/* Unified Sign In Form for All Profiles */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or admin@shramik.coop"
                className="w-full text-xs p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Password / PIN
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="new-password"
                name="auth_security_key"
                data-lpignore="true"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3.5 pl-10 rounded-2xl border border-slate-200 focus:outline-none focus:border-coop-500 font-mono transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Demo passwords: <code className="text-coop-600 font-bold">pass123</code> (Customer) • <code className="text-coop-600 font-bold">worker123</code> (Worker) • <code className="text-coop-600 font-bold">coop123</code> (Admin)
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-coop-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <div>
            New to ServiceSetu?{' '}
            <Link to="/customer/register" className="font-black text-coop-700 hover:underline">
              Register as a Customer
            </Link>
          </div>
          <div className="text-[11px] text-slate-400">
            Want to offer your skilled services?{' '}
            <Link to="/worker/register" className="font-bold text-amber-700 hover:underline">
              Register as a Worker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

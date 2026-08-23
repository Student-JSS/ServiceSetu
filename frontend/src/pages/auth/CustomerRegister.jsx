import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Home
} from 'lucide-react';

export const CustomerRegister = () => {
  const { t } = useTranslation();
  const { registerCustomer } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    city: 'New Delhi',
    pincode: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.password.trim() || !formData.address.trim()) {
      showToast('Please fill all required details (Name, Phone, Password, Address)', 'error');
      return;
    }

    if (formData.phone.trim().length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await registerCustomer(formData);
      showToast('🎉 Customer registration successful! You can now book services immediately.', 'success');
      navigate('/customer/services');
    } catch (err) {
      showToast(err.response?.data?.message || 'Customer registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-coop-700 to-coop-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-coop-600/25 mb-3">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Register as a Customer</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Book verified plumbers, electricians, cleaners & carpenters with <strong className="text-emerald-700 font-bold">0% middleman commission</strong>
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Instant Booking Activated • No Verification Delay
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Aarav Gupta"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-mono font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="aarav@example.com"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Password / PIN *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-mono font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Delivery & Service Address *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House / Flat No., Apartment / Street, Landmark"
                className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
              />
              <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="110016"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-mono font-medium"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Guarantee Pill */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-coop-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              By registering as a customer, you get direct access to certified cooperative gig workers with transparent standardized pricing, in-app live GPS tracking, and dedicated 24x7 cooperative grievance support.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-coop-600 to-coop-500 hover:from-coop-700 hover:to-coop-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-coop-600/25 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Creating Customer Account...' : 'Complete Registration & Start Booking'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <div>
            Already have an account?{' '}
            <Link to="/login" className="font-black text-coop-700 hover:underline">
              Sign In to Portal
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

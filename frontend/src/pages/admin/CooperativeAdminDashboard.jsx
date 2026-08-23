import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Users,
  ShieldCheck,
  Briefcase,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Filter
} from 'lucide-react';

export const CooperativeAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cooperative, setCooperative] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'pending'
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/stats').then((res) => {
      if (res.data.success) {
        setStats(res.data.stats);
        setCooperative(res.data.cooperative);
      }
    });

    API.get('/bookings/my').then((res) => {
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">
        Loading admin panel...
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const isPaid = b.paymentStatus === 'paid' || b.paymentStatus === 'cod_collected';
    if (paymentFilter === 'paid') return isPaid;
    if (paymentFilter === 'pending') return !isPaid;
    return true;
  });

  const paidCount = bookings.filter((b) => b.paymentStatus === 'paid' || b.paymentStatus === 'cod_collected').length;
  const pendingPaymentCount = bookings.filter((b) => b.paymentStatus === 'pending' || b.paymentStatus === 'cod_pending').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              Cooperative Administration
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {cooperative?.name || 'Labour Cooperative Society'}
            </h1>
            <p className="text-xs text-slate-500">{cooperative?.city}, {cooperative?.state}</p>
          </div>

          <Link
            to="/admin/verifications"
            className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Review Pending KYC ({stats?.pendingVerifications || 0})
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 block mb-1">Registered Workers</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{stats?.totalWorkers || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold block mt-2">
              {stats?.pendingVerifications || 0} awaiting document review
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 block mb-1">Active Bookings</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{stats?.activeBookings || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">
              {stats?.completedBookings || 0} lifetime completed
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 block mb-1">Gross Service Volume</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">₹{stats?.totalRevenue || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">
              ₹{stats?.workerPayouts || 0} distributed to workers
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 block mb-1">Co-op Welfare Pool</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-purple-700">₹{stats?.coopWelfareEarnings || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-purple-600 font-bold block mt-2">
              Retained for worker welfare & ops
            </span>
          </div>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/admin/verifications"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-coop-700">Worker KYC & Documents</h4>
              <p className="text-xs text-slate-400 mt-0.5">Verify Aadhaar, skills, and issue badges</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-coop-600" />
          </Link>

          <Link
            to="/admin/pricing"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-coop-700">Service Catalog & Pricing</h4>
              <p className="text-xs text-slate-400 mt-0.5">Customize cooperative rates & durations</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-coop-600" />
          </Link>

          <Link
            to="/admin/grievances"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-coop-700">Worker Grievances</h4>
              <p className="text-xs text-slate-400 mt-0.5">{stats?.pendingGrievances || 0} pending tickets</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-coop-600" />
          </Link>
        </div>

        {/* All Bookings Under Cooperative Table (With Real-Time Payment Status) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">All Bookings Under Cooperative</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time booking progression and customer payment reconciliation ledger
              </p>
            </div>

            {/* Payment Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'all' ? 'bg-white text-coop-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setPaymentFilter('paid')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'paid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Paid ({paidCount})
              </button>
              <button
                onClick={() => setPaymentFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Pending ({pendingPaymentCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                No bookings matching this payment filter.
              </div>
            ) : (
              filteredBookings.map((b) => {
                const isPaid = b.paymentStatus === 'paid' || b.paymentStatus === 'cod_collected';

                return (
                  <div key={b._id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">#{b._id.slice(-6).toUpperCase()}</span>
                        <span className="font-extrabold text-slate-900 text-sm">{b.serviceId?.name}</span>
                        
                        {/* Service Status Badge */}
                        <span className="bg-slate-100 text-slate-700 font-black px-2.5 py-0.5 rounded-full uppercase text-[10px] border border-slate-200">
                          {b.status.replace(/_/g, ' ')}
                        </span>

                        {/* Payment Status Badge (Completed vs Pending) */}
                        {isPaid ? (
                          <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Payment: Completed
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-black px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-amber-300 shadow-2xs animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" /> Payment: Pending
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 text-xs">
                        Customer: <strong className="text-slate-800">{b.customerId?.fullName}</strong> ({b.customerId?.phone}) • Worker: <strong className="text-slate-800">{b.workerId?.userId?.fullName || 'Unassigned'}</strong>
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Mode: <strong className="text-slate-600 uppercase font-semibold">{b.paymentMethod && b.paymentMethod !== 'none' ? b.paymentMethod : (isPaid ? 'Razorpay / UPI' : 'Pending Checkout')}</strong></span>
                        <span>•</span>
                        <span>Scheduled: {new Date(b.scheduledAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block sm:hidden">Total Amount</span>
                        <span className="font-black text-slate-900 text-base">₹{b.totalAmount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-coop-700 font-bold block">Co-op Fee: ₹{b.coopFee}</span>
                        <span className="text-[10px] text-emerald-700 font-medium block">Worker: ₹{b.workerEarnings}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

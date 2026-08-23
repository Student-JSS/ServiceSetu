import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { PaymentModal } from '../../components/common/PaymentModal';
import {
  IndianRupee,
  Calendar,
  Star,
  Activity,
  ArrowRight,
  Sparkles,
  Siren,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'worker') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      const res = await API.patch(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled from Dashboard' });
      if (res.data.success) {
        showToast('Booking cancelled successfully', 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast('Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const totalBookings = bookings.length;
  const currentBookings = bookings.filter((b) =>
    ['requested', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) =>
    ['completed', 'closed'].includes(b.status)
  );
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const customerRating = "5.0 ★";

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading customer dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Customer Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Welcome back, {user?.fullName || 'Valued Customer'}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your cooperative service requests, review active workers, and track fair wages.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/customer/services"
              className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md shadow-coop-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Book New Service
            </Link>
            <Link
              to="/customer/emergency"
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/30 flex items-center gap-1.5"
            >
              <Siren className="w-4 h-4 text-yellow-300" /> Need Now
            </Link>
          </div>
        </div>

        {/* 4 Playcards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Spent
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">₹{totalSpent}</span>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">
              90% paid directly to skilled workers
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Bookings
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{totalBookings}</span>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[10px] text-coop-600 font-bold block mt-2">
              {completedBookings.length} completed successfully
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Current Bookings
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-amber-600">{currentBookings.length}</span>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold block mt-2">
              {currentBookings.length > 0 ? 'Live field service in progress' : 'No active jobs right now'}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Rating
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{customerRating}</span>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-bold block mt-2">
              Cooperative Trust Member
            </span>
          </div>
        </div>

        {/* Current Active Live Bookings with Request Timestamps & Cancel Action */}
        {currentBookings.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Live Bookings
              </h2>
              <span className="text-xs font-bold text-coop-700 bg-coop-50 px-3 py-1 rounded-full">
                {currentBookings.length} Active
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {currentBookings.map((b) => (
                <div key={b._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#{b._id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                      {b.isEmergency && (
                        <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                          🚨 Emergency
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{b.serviceId?.name}</h3>
                    <p className="text-xs text-slate-500">
                      Assigned Worker: {b.workerId?.userId?.fullName || 'Auto-Assigning...'} • {b.address}
                    </p>
                    {/* Timestamp Details */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1 text-coop-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Requested: {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Slot: {b.timeSlot || 'Immediate'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      disabled={cancellingId === b._id}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                    <Link
                      to={`/customer/tracker/${b._id}`}
                      className="px-4 py-2 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                    >
                      Track Live <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            to="/customer/services"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-coop-500 shadow-sm transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-coop-50 text-coop-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-coop-700">Explore Services & Map</h3>
            <p className="text-xs text-slate-500 mt-1">Discover verified nearby workers on an interactive Leaflet map</p>
          </Link>

          <Link
            to="/customer/bookings"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-coop-500 shadow-sm transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-coop-700">Booking History & Invoices</h3>
            <p className="text-xs text-slate-500 mt-1">Download official PDF receipts and review past cooperative services</p>
          </Link>

          <Link
            to="/customer/emergency"
            className="bg-gradient-to-br from-red-600 to-rose-700 p-6 rounded-3xl border border-red-500 shadow-lg transition-all group text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-yellow-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Siren className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">Emergency Need-Now Dispatch</h3>
            <p className="text-xs text-red-100 mt-1">1-click instant broadcast to 3.5★-5★ top rated nearest workers</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

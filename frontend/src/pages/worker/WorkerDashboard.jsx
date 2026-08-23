import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Briefcase,
  Star,
  Clock,
  ArrowRight,
  Radio,
  Calendar,
  HeartHandshake,
  XCircle
} from 'lucide-react';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const { socket, incomingEmergency, setIncomingEmergency } = useSocket();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isAway, setIsAway] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decliningId, setDecliningId] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/workers/me');
      if (res.data.success) {
        setProfile(res.data.worker);
        setStats(res.data.stats);
        setIsOnline(res.data.worker.isOnline);
        setIsAway(res.data.worker.isAway);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get('/bookings/my');
      if (res.data.success) {
        // RULE: Keep all active jobs + completed jobs where customer has NOT paid yet!
        const active = res.data.bookings.filter((b) => {
          const isPendingWorkflow = ['requested', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status);
          const isCompletedUnpaid = b.status === 'completed' && !['paid', 'cod_collected'].includes(b.paymentStatus);
          return isPendingWorkflow || isCompletedUnpaid;
        });
        setActiveJobs(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, []);

  // Real-time synchronization: When customer pays, refresh dashboard & earnings immediately!
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = (payload) => {
      fetchProfile();
      fetchJobs();
    };
    socket.on('booking_status_updated', handleStatusUpdate);
    return () => socket.off('booking_status_updated', handleStatusUpdate);
  }, [socket]);

  const handleToggleOnline = async () => {
    try {
      const res = await API.patch('/workers/availability', {
        isOnline: !isOnline,
        isAway: false,
      });
      if (res.data.success) {
        setIsOnline(res.data.isOnline);
        setIsAway(false);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleToggleAway = async () => {
    try {
      const res = await API.patch('/workers/availability', {
        isAway: !isAway,
      });
      if (res.data.success) {
        setIsAway(res.data.isAway);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAcceptEmergency = async (bookingId) => {
    try {
      const res = await API.patch(`/bookings/${bookingId}/accept`);
      if (res.data.success) {
        showToast('Emergency job accepted! Route and customer details loaded.', 'success');
        setIncomingEmergency(null);
        navigate(`/worker/jobs/${bookingId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not accept job', 'error');
    }
  };

  const handleWorkerCancel = async (bookingId, isEmergency = false) => {
    const promptMsg = isEmergency
      ? 'Decline this emergency job? It will be automatically transferred to the next nearest certified worker.'
      : 'Are you sure you want to cancel this job assignment?';

    if (!window.confirm(promptMsg)) return;

    setDecliningId(bookingId);
    try {
      const res = await API.patch(`/bookings/${bookingId}/worker-cancel`, {
        reason: 'Worker requested cancellation',
      });
      if (res.data.success) {
        showToast(res.data.message, 'info');
        fetchJobs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel job', 'error');
    } finally {
      setDecliningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Incoming Emergency Dispatch Popup Banner */}
        {incomingEmergency && (
          <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-6 rounded-3xl shadow-2xl border border-white/20 animate-bounce flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                🚨
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/30 px-2 py-0.5 rounded-full">
                  Emergency Need-Now Alert
                </span>
                <h3 className="text-lg font-black mt-1">
                  {incomingEmergency.booking?.serviceId?.name} for {incomingEmergency.booking?.customerId?.fullName}
                </h3>
                <p className="text-xs text-rose-100">
                  Fare: ₹{incomingEmergency.booking?.totalAmount} (Surge + Fair Direct Wage Included)
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIncomingEmergency(null)}
                className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/40 text-white text-xs font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleAcceptEmergency(incomingEmergency.booking?._id)}
                className="px-6 py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black shadow-lg"
              >
                Accept Job (₹{incomingEmergency.booking?.workerEarnings} Earnings)
              </button>
            </div>
          </div>
        )}

        {/* Unverified Worker Pending KYC Banner */}
        {profile && !profile.isVerified && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex items-start gap-3.5 text-amber-900 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">KYC Approval in Progress with Cooperative Admin</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your worker registration and submitted credentials are currently under review by the Cooperative Society Admin. To maintain trust and quality, your profile will remain hidden from customer search lists and booking catalogs until your KYC is verified. Once approved, you will automatically start receiving customer service requests.
              </p>
            </div>
          </div>
        )}

        {/* Worker Header Card & Status Toggles */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-coop-700 to-coop-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-coop-600/20">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.fullName}</h1>
                {profile?.isVerified ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Co-op Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    <AlertCircle className="w-3 h-3" /> KYC Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Skills: <strong className="text-coop-700">{profile?.skills?.join(', ')}</strong> • Radius: {profile?.serviceRadiusKm || 15} km
              </p>
            </div>
          </div>

          {/* Availability Control Switches */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isOnline && !isAway
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isOnline && !isAway ? 'animate-pulse' : ''}`} />
              Online
            </button>
            <button
              onClick={handleToggleAway}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isAway
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Away Mode
            </button>
          </div>
        </div>

        {/* Cumulative Stats Grid (Strictly Settled Paid Earnings) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Total Paid Earnings</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">₹{stats?.totalEarned || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">Cumulative Settled Payouts</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Settled Service Jobs</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{stats?.completedJobs || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-2">Recorded in Earnings Ledger</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Average Rating</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{stats?.ratingAvg || 5.0} ★</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold block mt-2">
              {stats?.ratingCount || 0} Customer Reviews
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Social Security</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-emerald-700">₹3,00,000</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-coop-700 font-bold block mt-2">Health & Accident Policy Active</span>
          </div>
        </div>

        {/* Active & Pending Payment Jobs Section */}
        <div id="active-job-section" className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 scroll-mt-20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Your Active & Pending Payment Jobs</h2>
              <p className="text-xs text-slate-500">
                Jobs remain here until completed and paid. Once customer completes payment, they move to the Earnings section.
              </p>
            </div>
            <span className="text-xs font-bold text-coop-700 bg-coop-50 px-3 py-1 rounded-full border border-coop-200">
              {activeJobs.length} Active / Pending Payment
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active or pending payment jobs currently. Stay online to receive incoming bookings.
              </div>
            ) : (
              activeJobs.map((job) => {
                const isCompletedPending = job.status === 'completed' && !['paid', 'cod_collected'].includes(job.paymentStatus);

                return (
                  <div key={job._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{job._id.slice(-6).toUpperCase()}
                        </span>
                        {isCompletedPending ? (
                          <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                            ⏳ Work Completed — Payment Pending from Customer
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        )}
                        {job.isEmergency && (
                          <span className="text-[10px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">
                            🚨 Emergency
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1">{job.serviceId?.name}</h3>
                      
                      {/* Customer Name, Date & Time */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                        <span className="font-bold text-slate-800">Customer: {job.customerId?.fullName || 'Customer'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-coop-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(job.createdAt).toLocaleDateString()}, {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">Slot: {job.timeSlot || 'Immediate'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">
                          {isCompletedPending ? 'Pending Payout' : 'Expected Wage'}
                        </span>
                        <span className="text-base font-black text-emerald-600">₹{job.workerEarnings}</span>
                      </div>

                      {job.status !== 'completed' && (
                        <button
                          onClick={() => handleWorkerCancel(job._id, job.isEmergency)}
                          disabled={decliningId === job._id}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {decliningId === job._id ? 'Cancelling...' : 'Decline Job'}
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/worker/jobs/${job._id}`)}
                        className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-black shadow-md shadow-coop-600/20 flex items-center gap-1.5"
                      >
                        Open Job Dashboard <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/worker/schedule"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 shadow-sm transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-coop-700">Weekly Availability Schedule</h4>
              <p className="text-xs text-slate-400 mt-0.5">Configure working days & hour slots</p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400 group-hover:text-coop-600" />
          </Link>

          <Link
            to="/worker/earnings"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 shadow-sm transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-coop-700">Cumulative Paid Earnings Ledger</h4>
              <p className="text-xs text-slate-400 mt-0.5">Download settled monthly payout statements</p>
            </div>
            <IndianRupee className="w-5 h-5 text-slate-400 group-hover:text-coop-600" />
          </Link>

          <Link
            to="/worker/welfare"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-coop-500 shadow-sm transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-coop-700">Welfare & Grievances</h4>
              <p className="text-xs text-slate-400 mt-0.5">Insurance policies & support tickets</p>
            </div>
            <HeartHandshake className="w-5 h-5 text-slate-400 group-hover:text-coop-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

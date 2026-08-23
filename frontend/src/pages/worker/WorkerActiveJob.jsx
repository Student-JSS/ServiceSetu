import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import { ChatDrawer } from '../../components/common/ChatDrawer';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Navigation,
  Banknote,
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const WorkerActiveJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinBookingRoom } = useSocket();
  const { showToast } = useNotification();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    joinBookingRoom(id);

    if (!socket) return;
    const handleStatusUpdate = (payload) => {
      if (payload.bookingId === id) {
        setBooking(payload.booking);
        showToast(payload.message, 'info');
      }
    };
    socket.on('booking_status_updated', handleStatusUpdate);
    return () => socket.off('booking_status_updated', handleStatusUpdate);
  }, [id, socket]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await API.patch(`/bookings/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setBooking(res.data.booking);
        showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCollectCOD = async () => {
    try {
      const res = await API.post('/payments/cod-collected', { bookingId: booking._id });
      if (res.data.success) {
        showToast('Cash collected recorded! Job closed and ledger updated.', 'success');
        setBooking(res.data.booking);
      }
    } catch (err) {
      showToast('Failed to record cash collection', 'error');
    }
  };

  const handleWorkerDeclineJob = async () => {
    const promptMsg = booking.isEmergency
      ? 'Decline this emergency job? The system will automatically transfer it to the next nearest certified worker immediately.'
      : 'Are you sure you want to decline/cancel this job?';

    if (!window.confirm(promptMsg)) return;

    try {
      const res = await API.patch(`/bookings/${booking._id}/worker-cancel`, {
        reason: 'Worker cancelled from field view',
      });
      if (res.data.success) {
        showToast(res.data.message, 'info');
        navigate('/worker/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel job', 'error');
    }
  };

  if (loading || !booking) {
    return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading job details...</div>;
  }

  const isPaid = ['paid', 'cod_collected'].includes(booking.paymentStatus);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Job Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-coop-100 text-coop-800 px-2.5 py-1 rounded-full">
                Job #{booking._id.slice(-6).toUpperCase()}
              </span>
              {booking.isEmergency && (
                <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                  🚨 Emergency Need-Now
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{booking.serviceId?.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {booking.address}
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-xs text-slate-400 block font-semibold">Your Net Earnings</span>
            <span className="text-2xl font-black text-emerald-600">₹{booking.workerEarnings}</span>
            <span className="text-[11px] text-slate-400 font-mono">Gross Total: ₹{booking.totalAmount}</span>

            {/* Cancel Button */}
            {!['completed', 'closed'].includes(booking.status) && (
              <button
                onClick={handleWorkerDeclineJob}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                {booking.isEmergency ? 'Decline & Transfer Emergency' : 'Decline Assignment'}
              </button>
            )}
          </div>
        </div>

        {/* Detailed Job Specification & Customer Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Customer & Job Specifications
            </h3>

            {/* Customer Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Customer Name:</span>
                <strong className="text-slate-900 font-black text-sm">{booking.customerId?.fullName || 'Customer'}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Contact Phone:</span>
                <a href={`tel:${booking.customerId?.phone || ''}`} className="font-bold text-coop-600 hover:underline">
                  {booking.customerId?.phone || 'Not provided'}
                </a>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-semibold">Service Address:</span>
                <span className="font-bold text-slate-800 text-right max-w-[220px]">{booking.address}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Booking Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {new Date(booking.createdAt).toLocaleDateString()}, {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Scheduled Slot:</span>
                <span className="font-bold text-coop-700 bg-coop-50 px-2 py-0.5 rounded border border-coop-200">
                  {booking.timeSlot || 'Immediate'}
                </span>
              </div>

              {/* Payment Status Indicator */}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Payment Status:</span>
                {isPaid ? (
                  <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PAID / DONE
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 border border-amber-300">
                    <Clock className="w-3.5 h-3.5" /> PENDING FROM CUSTOMER
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Phone & Live Chat */}
            <div className="flex gap-2 pt-1">
              <a
                href={`tel:${booking.customerId?.phone || ''}`}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-coop-600" /> Call Customer
              </a>
              <button
                onClick={() => setChatOpen(true)}
                className="flex-1 py-3 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-coop-600/20"
              >
                <MessageSquare className="w-4 h-4" /> Live In-App Chat
              </button>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Status Workflow</h3>
              <p className="text-xs text-slate-600 font-medium mb-4">
                Current Field Status: <strong className="text-coop-700 uppercase">{booking.status.replace(/_/g, ' ')}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => updateStatus('on_the_way')}
                  disabled={updating}
                  className="w-full py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> Start Journey (I am On The Way)
                </button>
              )}

              {booking.status === 'on_the_way' && (
                <button
                  onClick={() => updateStatus('in_progress')}
                  disabled={updating}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> Arrived at Location & Start Work
                </button>
              )}

              {booking.status === 'in_progress' && (
                <button
                  onClick={() => updateStatus('completed')}
                  disabled={updating}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Service as Completed
                </button>
              )}

              {/* Once Completed: Payment Section */}
              {['completed', 'closed'].includes(booking.status) && (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold">
                    🎉 Service Marked as Completed!
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      {isPaid
                        ? 'Customer payment has been settled! ₹' + booking.workerEarnings + ' credited to your ledger.'
                        : 'Payment status is currently PENDING. Awaiting customer online payment or cash hand-over.'}
                    </p>
                  </div>

                  {booking.paymentMethod === 'cod' && booking.paymentStatus !== 'cod_collected' && (
                    <button
                      onClick={handleCollectCOD}
                      className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                    >
                      <Banknote className="w-4 h-4 text-emerald-400" /> Collect Cash ₹{booking.totalAmount} (Mark Cash Received)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Tracking Map */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 mb-3">Live Customer Destination Route</h4>
          <LiveTrackingMap
            customerCoords={booking.location?.coordinates}
            workerCoords={booking.workerId?.location?.coordinates}
            status={booking.status}
          />
        </div>

        {/* Live In-App Chat Drawer */}
        {chatOpen && (
          <ChatDrawer
            bookingId={booking._id}
            recipientName={booking.customerId?.fullName || 'Customer'}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

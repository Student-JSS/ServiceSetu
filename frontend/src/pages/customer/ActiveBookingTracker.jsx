import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import { ChatDrawer } from '../../components/common/ChatDrawer';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { RatingModal } from '../../components/common/RatingModal';
import { PaymentModal } from '../../components/common/PaymentModal';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  Download,
  Star,
  CreditCard,
  Banknote,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar
} from 'lucide-react';

const STATUS_STEPS = ['requested', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'closed'];

export const ActiveBookingTracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinBookingRoom } = useSocket();
  const { showToast } = useNotification();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await API.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    joinBookingRoom(id);

    if (!socket) return;

    const handleStatusUpdate = (payload) => {
      if (payload.bookingId === id) {
        setBooking(payload.booking);
        showToast(payload.message, 'info');
      }
    };

    socket.on('booking_status_updated', handleStatusUpdate);

    return () => {
      socket.off('booking_status_updated', handleStatusUpdate);
    };
  }, [id, socket]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await API.patch(`/bookings/${booking._id}/cancel`, {
        reason: cancelReason,
      });
      if (res.data.success) {
        showToast('Booking cancelled successfully', 'success');
        setBooking(res.data.booking);
        setCancelModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">
        Loading live booking status...
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(booking.status);
  const canCancel = ['requested', 'confirmed', 'on_the_way', 'in_progress'].includes(booking.status);

  return (
    <div className="min-h-screen bg-slate-50 pt-2 pb-8 px-3 sm:px-6 lg:px-8 w-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Booking Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-coop-50 text-coop-700 px-3 py-1 rounded-full border border-coop-200">
                Booking #{booking._id.slice(-6).toUpperCase()}
              </span>
              {booking.status === 'cancelled' && (
                <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full border border-rose-300">
                  Cancelled
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{booking.serviceId?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Address: {booking.address}</p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-coop-500" />
              Requested on: {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">₹{booking.totalAmount}</span>

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Booking
              </button>
            )}
          </div>
        </div>

        {/* Service Lifecycle Stepper */}
        {booking.status !== 'cancelled' ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Service Progression Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'requested', label: 'Requested' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'on_the_way', label: 'On The Way' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
              ].map((step, idx) => {
                const isPast = currentStepIndex >= idx;
                const isCurrent = booking.status === step.id;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-coop-600 text-white border-coop-600 shadow-md shadow-coop-600/20 font-black'
                        : isPast
                        ? 'bg-coop-50 text-coop-800 border-coop-200 font-bold'
                        : 'bg-slate-50 text-slate-400 border-slate-100 font-medium'
                    }`}
                  >
                    <span className="text-[10px] block opacity-70">Step {idx + 1}</span>
                    <span className="text-xs">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <strong>This booking was cancelled.</strong>
              <p className="text-rose-600 text-[11px] mt-0.5">Reason: {booking.cancellationReason || 'Cancelled by user'}</p>
            </div>
          </div>
        )}

        {/* Live Route & Worker Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Geolocation Route
            </h4>
            <LiveTrackingMap
              customerCoords={booking.location?.coordinates}
              workerCoords={booking.workerId?.location?.coordinates}
              status={booking.status}
            />
          </div>

          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Professional</span>
              {booking.workerId ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-coop-100 text-coop-800 flex items-center justify-center font-bold text-lg">
                      👷
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {booking.workerId?.userId?.fullName || 'Co-op Worker'}
                      </h4>
                      <p className="text-xs text-slate-500">{booking.cooperativeId?.name}</p>
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                        ★ {booking.workerId?.ratingAvg || 5.0} Cooperative Certified
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <a
                      href={`tel:${booking.workerId?.userId?.phone || ''}`}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-coop-600" />
                      Call
                    </a>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="flex-1 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-coop-600/20 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Live Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <span className="animate-spin inline-block mb-2">⏳</span>
                  <p className="font-bold">Locating closest certified worker...</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3 mt-4">
              {['completed', 'closed'].includes(booking.status) ? (
                <>
                  {booking.paymentStatus === 'pending' || booking.paymentStatus === 'cod_pending' ? (
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay & Settle Invoice (₹{booking.totalAmount})
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment Settled: {booking.paymentStatus.toUpperCase()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setInvoiceModalOpen(true)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                    {!booking.customerRated && (
                      <button
                        onClick={() => setRatingModalOpen(true)}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <Star className="w-4 h-4" />
                        Rate Worker
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  Invoice and ratings will unlock upon service completion.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-base font-black text-slate-900">Cancel Requested Worker</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel this booking? The assigned worker will be notified immediately.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200"
                >
                  <option>Change of plans / Not required now</option>
                  <option>Worker took too long to arrive</option>
                  <option>Booked wrong service category</option>
                  <option>Found alternative local assistance</option>
                  <option>Other personal reason</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentModalOpen && (
          <PaymentModal
            booking={booking}
            onClose={() => setPaymentModalOpen(false)}
            onSuccess={(updated) => setBooking(updated)}
          />
        )}

        {chatOpen && (
          <ChatDrawer
            bookingId={booking._id}
            recipientName={booking.workerId?.userId?.fullName || 'Assigned Worker'}
            onClose={() => setChatOpen(false)}
          />
        )}

        {invoiceModalOpen && (
          <InvoiceModal booking={booking} onClose={() => setInvoiceModalOpen(false)} />
        )}

        {ratingModalOpen && (
          <RatingModal
            booking={booking}
            onClose={() => setRatingModalOpen(false)}
            onSuccess={fetchBooking}
          />
        )}
      </div>
    </div>
  );
};

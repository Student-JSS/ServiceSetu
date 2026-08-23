
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { RatingModal } from '../../components/common/RatingModal';
import { Download, Star, ExternalLink } from 'lucide-react';

export const CustomerHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Your Booking History</h1>
          <p className="text-xs text-slate-500 mt-0.5">All your previous cooperative service requests and receipts</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No bookings recorded yet. Start by booking a certified cooperative service!
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{b._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        b.status === 'completed' || b.status === 'closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{b.serviceId?.name}</h3>
                    <p className="text-xs text-slate-500">
                      Worker: {b.workerId?.userId?.fullName || 'Auto-Assigned'} • {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">₹{b.totalAmount}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">{b.paymentStatus.toUpperCase()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/customer/tracker/${b._id}`)}
                        className="p-2 text-slate-600 hover:text-coop-600 hover:bg-coop-50 rounded-xl"
                        title="View Live Tracker"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setInvoiceModalOpen(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {!b.customerRated && (b.status === 'completed' || b.status === 'closed') && (
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setRatingModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          Rate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {invoiceModalOpen && (
          <InvoiceModal booking={selectedBooking} onClose={() => setInvoiceModalOpen(false)} />
        )}

        {ratingModalOpen && (
          <RatingModal
            booking={selectedBooking}
            onClose={() => setRatingModalOpen(false)}
            onSuccess={fetchBookings}
          />
        )}
      </div>
    </div>
  );
};

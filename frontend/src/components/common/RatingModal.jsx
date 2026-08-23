
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const RatingModal = ({ booking, onClose, onSuccess }) => {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/ratings', {
        bookingId: booking._id,
        stars,
        review,
      });
      if (res.data.success) {
        showToast('Thank you! Your rating and feedback were submitted.', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Rate Your Experience</h3>
          <p className="text-xs text-slate-500 mt-1">
            {booking.serviceId?.name} with {booking.workerId?.userId?.fullName || 'Cooperative Worker'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setStars(num)}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${num <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Review & Comments
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell the cooperative about worker punctuality, skill quality, and manners..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-coop-600 hover:bg-coop-700 text-white text-xs font-bold shadow-md shadow-coop-600/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

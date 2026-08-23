import React, { useState } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, X, ShieldAlert } from 'lucide-react';

export const ComplaintModal = ({ isOpen, onClose, defaultCategory = 'customer_behavior' }) => {
  const { showToast } = useNotification();
  const [category, setCategory] = useState(defaultCategory);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) {
      showToast('Please describe your complaint or issue', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/grievances', { category, message });
      if (res.data.success) {
        showToast('Dispute ticket submitted to Cooperative Grievance Redressal Board!', 'success');
        setMessage('');
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Cooperative Grievance Cell</h3>
            <p className="text-xs text-slate-500">File a formal dispute or report misbehavior</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
            >
              <option value="customer_behavior">Complaint against Worker / Misbehavior</option>
              <option value="wage_payout">Wage Payout or Billing Overcharge</option>
              <option value="safety">Field Safety or Property Damage</option>
              <option value="insurance_claim">Accident & Health Insurance Claim</option>
              <option value="technical_app">Technical Platform Issue</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Explanation of Dispute</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide booking ID (if any), timestamps, and description of what happened..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            ⚖️ All tickets are reviewed directly by the <strong>Labour Cooperative Oversight Committee</strong> within 24 hours under the Fair Charter Act.
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20"
            >
              {submitting ? 'Filing Ticket...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

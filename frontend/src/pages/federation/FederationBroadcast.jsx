
import React, { useState } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Radio } from 'lucide-react';

export const FederationBroadcast = () => {
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    try {
      const res = await API.post('/federation/broadcast', { title, message });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setTitle('');
        setMessage('');
      }
    } catch (e) {
      showToast('Failed to dispatch federation broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Federation System-Wide Broadcast</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official policy updates, welfare notices, or wage guidelines to all cooperatives and workers
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Policy Notice Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Revised Minimum Fair Wage Directives"
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Policy Directive Content</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write official directive message..."
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-black shadow-lg shadow-purple-700/20 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              {sending ? 'Dispatching...' : 'Dispatch Federation Broadcast'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

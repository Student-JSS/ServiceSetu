
import React, { useState } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Send, Radio } from 'lucide-react';

export const CoopBroadcast = () => {
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    try {
      const res = await API.post('/admin/broadcast', { title, message });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setTitle('');
        setMessage('');
      }
    } catch (e) {
      showToast('Failed to dispatch broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cooperative Announcement & Broadcast</h1>
          <p className="text-xs text-slate-500 mt-0.5">Send real-time SMS & In-app notifications to all workers under your cooperative</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Health Checkup Camp on Sunday"
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Broadcast Message Content</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message for all workers..."
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl font-black shadow-lg shadow-coop-600/20 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              {sending ? 'Sending Broadcast...' : 'Broadcast to All Workers'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

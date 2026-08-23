import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { IndianRupee, Download, TrendingUp, Calendar, CheckCircle2, Info } from 'lucide-react';

export const WorkerEarnings = () => {
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      const res = await API.get('/workers/earnings');
      if (res.data.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // Real-time update when a payment is settled
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = () => {
      fetchEarnings();
    };
    socket.on('booking_status_updated', handleStatusUpdate);
    return () => socket.off('booking_status_updated', handleStatusUpdate);
  }, [socket]);

  const downloadCSV = () => {
    if (!data?.bookings || data.bookings.length === 0) return;
    const headers = 'Booking ID,Service,Customer,Total Fare,Direct Worker Wage (90%),Status,Settled Date\n';
    const rows = data.bookings
      .map(
        (b) =>
          `${b._id},${b.serviceId?.name || 'Service'},${b.customerId?.fullName || 'Customer'},${b.totalAmount},${b.workerEarnings},PAID / SETTLED,${new Date(b.completedAt || b.createdAt).toLocaleDateString()}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker_settled_earnings_${Date.now()}.csv`;
    a.click();
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading cumulative earnings ledger...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Worker Cumulative Earnings & Payouts Ledger</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical ledger of all completed service jobs where customer payment has been settled.
            </p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={!data?.bookings || data.bookings.length === 0}
            className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-coop-600/20"
          >
            <Download className="w-4 h-4" /> Download CSV Statement
          </button>
        </div>

        {/* Explanatory Banner */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 flex items-center gap-3 text-xs text-blue-900">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <strong>Transparent Fair Wage Ledger:</strong> Only jobs with confirmed customer payment appear in this cumulative history. If a job is marked completed but payment is pending, it remains on your <strong>Worker Dashboard</strong> until payment is settled.
          </div>
        </div>

        {/* Highlight Stats (Exact Match with Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Total Lifetime Earned</span>
            <span className="text-3xl font-black text-slate-900">₹{data?.totalEarned || 0}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">
              Sum of 90% direct fair wages from {data?.jobCount || 0} paid jobs
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Settled Service Jobs</span>
            <span className="text-3xl font-black text-slate-900">{data?.jobCount || 0}</span>
            <span className="text-[10px] text-coop-600 font-bold block mt-1">Paid & Closed In Ledger</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Co-op Welfare Contribution</span>
            <span className="text-3xl font-black text-purple-700">₹{Math.round((data?.totalEarned || 0) * 0.05)}</span>
            <span className="text-[10px] text-purple-600 font-bold block mt-1">5% Social Security & Insurance Fund</span>
          </div>
        </div>

        {/* Cumulative Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Cumulative Paid Jobs Statement</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {data?.bookings?.length || 0} Settled Records
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {data?.bookings?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No paid jobs in ledger yet. Once customer payments are completed, they will appear here.
              </div>
            ) : (
              data?.bookings?.map((b) => (
                <div key={b._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">{b.serviceId?.name}</p>
                      <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        PAID / SETTLED
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Customer: {b.customerId?.fullName || 'Customer'} • Settled on: {new Date(b.completedAt || b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm">+₹{b.workerEarnings}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Gross Total ₹{b.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

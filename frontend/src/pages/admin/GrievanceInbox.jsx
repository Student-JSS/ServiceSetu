
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

export const GrievanceInbox = () => {
  const { showToast } = useNotification();
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [responseNote, setResponseNote] = useState('');

  const fetchGrievances = async () => {
    try {
      const res = await API.get('/grievances/coop');
      if (res.data.success) {
        setGrievances(res.data.grievances);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleResolve = async () => {
    if (!selectedGrievance) return;
    try {
      const res = await API.patch(`/grievances/${selectedGrievance._id}/resolve`, {
        status: 'resolved',
        adminResponse: responseNote || 'Resolved by Cooperative Welfare Committee',
      });
      if (res.data.success) {
        showToast('Grievance marked as resolved and notified to worker', 'success');
        setSelectedGrievance(null);
        fetchGrievances();
      }
    } catch (e) {
      showToast('Failed to resolve', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Worker Grievance Resolution Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review and settle worker support tickets and welfare claims</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {grievances.map((g) => (
            <div key={g._id} className="p-5 flex justify-between items-center hover:bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {g.category.replace(/_/g, ' ')}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {g.workerId?.userId?.fullName} ({g.workerId?.userId?.phone})
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">{g.message}</p>
                {g.adminResponse && (
                  <p className="text-[11px] text-coop-700 font-medium mt-1">Resolution: {g.adminResponse}</p>
                )}
              </div>

              <div>
                {g.status === 'pending' ? (
                  <button
                    onClick={() => {
                      setSelectedGrievance(g);
                      setResponseNote('');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Resolve Ticket
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedGrievance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-black text-slate-900">Resolve Grievance</h3>
              <p className="text-xs text-slate-500">{selectedGrievance.message}</p>

              <textarea
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                placeholder="Enter resolution notes / action taken..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

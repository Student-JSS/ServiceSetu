
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Activity, Radio, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const WorkforceAllocationMatrix = () => {
  const { showToast } = useNotification();
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/federation/workforce-allocation').then((res) => {
      if (res.data.success) setMatrix(res.data.matrix);
      setLoading(false);
    });
  }, []);

  const handleBroadcastRecruit = async (categoryName) => {
    try {
      const res = await API.post('/federation/broadcast', {
        title: `Urgent Cooperative Worker Recruitment: ${categoryName}`,
        message: `High consumer demand detected for certified ${categoryName}s. Cooperatives are requested to onboard and verify skilled workers immediately.`,
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
      }
    } catch (e) {
      showToast('Failed to dispatch recruitment broadcast', 'error');
    }
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Calculating allocation matrix...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Workforce Allocation & Skill Gap Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tabulation of skill categories against member cooperatives with instant recruitment dispatch
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {matrix.map((item) => (
              <div key={item.categoryId} className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.categoryName}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Skill Category</span>
                  </div>
                  <button
                    onClick={() => handleBroadcastRecruit(item.categoryName)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Radio className="w-3.5 h-3.5 text-coop-400" /> Recruit Broadcast
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {item.coopBreakdown?.map((coop) => (
                    <div
                      key={coop.cooperativeId}
                      className={`p-3.5 rounded-2xl border flex justify-between items-center ${
                        coop.isDeficit
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold">{coop.cooperativeName}</h4>
                        <p className="text-[11px] opacity-75">{coop.city}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold block">
                          {coop.availableWorkers} Active / {coop.totalRegistered} Reg
                        </span>
                        {coop.isDeficit ? (
                          <span className="text-[10px] font-bold text-rose-600 block">⚠️ DEFICIT (Demand: {coop.demand})</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 block">Balanced</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

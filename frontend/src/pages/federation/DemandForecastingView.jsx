
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { TrendingUp, AlertTriangle, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const DemandForecastingView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/federation/demand-forecasting').then((res) => {
      if (res.data.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Computing demand models...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rule-Based Demand Forecasting & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated booking trends surfacing high demand categories and critical worker shortages
          </p>
        </div>

        {/* Shortage Alerts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Critical Workforce Shortage Alerts
          </h3>

          {data?.alerts?.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              All skill categories currently have adequate available cooperative workers.
            </div>
          ) : (
            data?.alerts?.map((a, idx) => (
              <div
                key={idx}
                className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="font-extrabold text-amber-900">{a.category} — High Demand Gap</h4>
                    <p className="text-amber-700">{a.message}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  {a.demandCount} Demands / {a.supplyCount} Supply
                </span>
              </div>
            ))
          )}
        </div>

        {/* Category Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.categoryDemand?.map((cat) => (
            <div key={cat._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-900 uppercase text-xs">{cat._id}</span>
                <span className="bg-coop-50 text-coop-700 font-bold px-2 py-0.5 rounded text-[10px]">
                  {cat.totalRequests} Bookings
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Completed Rate:</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((cat.completedJobs / (cat.totalRequests || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Volume:</span>
                  <span className="font-bold text-emerald-600">₹{cat.totalRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Surge Requests:</span>
                  <span className="font-bold text-rose-600">{cat.emergencyCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

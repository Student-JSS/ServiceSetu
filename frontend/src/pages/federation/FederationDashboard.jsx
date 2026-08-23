
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Building2,
  Users,
  Briefcase,
  IndianRupee,
  Activity,
  TrendingUp,
  Percent,
  Radio,
  ArrowRight,
  Award
} from 'lucide-react';

export const FederationDashboard = () => {
  const { showToast } = useNotification();
  const [data, setData] = useState(null);
  const [feeInput, setFeeInput] = useState(5);
  const [updatingFee, setUpdatingFee] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await API.get('/federation/overview');
      if (res.data.success) {
        setData(res.data);
        setFeeInput(res.data.federation?.platformFeePercent || 5);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    setUpdatingFee(true);
    try {
      const res = await API.patch('/federation/fee', { platformFeePercent: feeInput });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchOverview();
      }
    } catch (e) {
      showToast('Failed to update fee', 'error');
    } finally {
      setUpdatingFee(false);
    }
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading federation overview...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
              Federation Governance & Executive Analytics
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {data?.federation?.name || 'National Labour Cooperative Federation of India'}
            </h1>
            <p className="text-xs text-slate-500">Oversight and economic monitoring of member labour cooperatives</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/federation/forecasting"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Demand Forecasting
            </Link>
            <Link
              to="/federation/allocation"
              className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Activity className="w-4 h-4" /> Workforce Matrix
            </Link>
          </div>
        </div>

        {/* National Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Member Cooperatives</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{data?.metrics?.totalCooperatives || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-purple-600 font-bold block mt-2">Active Societies Network</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Total Verified Workers</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{data?.metrics?.totalWorkers || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-coop-600 font-bold block mt-2">
              {data?.metrics?.verifiedWorkers || 0} Police & Skill Verified
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Platform Gross GMV</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">₹{data?.metrics?.totalGMV || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">
              ₹{data?.metrics?.workerDisbursements || 0} Direct Worker Wages
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-1">Federation Tech Fee (5%)</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-purple-700">₹{data?.metrics?.federationRevenue || 0}</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-2">
              Utilization: {data?.metrics?.utilizationRate || 0}%
            </span>
          </div>
        </div>

        {/* Platform Fee Config Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Platform Federation Fee Configuration</h3>
            <p className="text-xs text-slate-500">Transparent system-wide fee deducted to sustain open digital infrastructure</p>
          </div>

          <form onSubmit={handleUpdateFee} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="15"
              step="0.5"
              value={feeInput}
              onChange={(e) => setFeeInput(parseFloat(e.target.value))}
              className="w-20 p-2 rounded-xl border border-slate-200 text-xs font-black text-center"
            />
            <span className="text-xs font-bold text-slate-600">%</span>
            <button
              type="submit"
              disabled={updatingFee}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md"
            >
              Update Fee
            </button>
          </form>
        </div>

        {/* Member Cooperatives Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Affiliated Labour Cooperatives</h3>
            <span className="text-xs text-slate-400">{data?.cooperatives?.length || 0} Societies</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {data?.cooperatives?.map((coop) => (
              <div key={coop._id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{coop.name}</h4>
                  <p className="text-slate-500 mt-0.5">
                    Location: {coop.city}, {coop.state} • Admin: {coop.adminUserId?.fullName || coop.adminUserId?.email}
                  </p>
                </div>

                <div className="text-right">
                  <span className="bg-coop-50 text-coop-700 font-bold px-2.5 py-1 rounded-lg">
                    {coop.commissionRate}% Welfare Reserve
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Surge Multiplier: {coop.surgeMultiplier}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

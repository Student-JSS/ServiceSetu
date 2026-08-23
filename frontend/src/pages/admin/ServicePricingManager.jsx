import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Tag,
  Plus,
  Edit2,
  CheckCircle2,
  Trash2,
  IndianRupee,
  Layers,
  Wrench,
  Percent,
  TrendingUp,
  X,
  Save,
  Clock
} from 'lucide-react';

export const ServicePricingManager = () => {
  const { showToast } = useNotification();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coop, setCoop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: 'electrician',
    basePrice: 399,
    durationEstimateMinutes: 60,
    description: '',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.25);
  const [codEnabled, setCodEnabled] = useState(true);

  const fetchData = async () => {
    try {
      const [srvRes, catRes, statRes] = await Promise.all([
        API.get('/services'),
        API.get('/services/categories'),
        API.get('/admin/stats'),
      ]);
      if (srvRes.data.success) setServices(srvRes.data.services);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (statRes.data.success && statRes.data.cooperative) {
        setCoop(statRes.data.cooperative);
        setCommissionRate(statRes.data.cooperative.commissionRate || 5.0);
        setSurgeMultiplier(statRes.data.cooperative.surgeMultiplier || 1.25);
        setCodEnabled(statRes.data.cooperative.codEnabled !== false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCoopSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await API.patch('/admin/pricing/coop-settings', {
        commissionRate,
        surgeMultiplier,
        codEnabled,
      });
      if (res.data.success) {
        showToast('Cooperative commission & surge multiplier updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/services', newService);
      if (res.data.success) {
        showToast('New cooperative service catalog item added!', 'success');
        setShowAddModal(false);
        setNewService({
          name: '',
          category: 'electrician',
          basePrice: 399,
          durationEstimateMinutes: 60,
          description: '',
        });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add service', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading pricing manager...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase bg-coop-50 text-coop-700 px-3 py-1 rounded-full border border-coop-200">
              Cooperative Economics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Service Catalog & Fair Wage Pricing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage base tariffs, surge multipliers, and transparent 90% direct fair wage breakdown.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-coop-600/25 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add New Service Item
          </button>
        </div>

        {/* Cooperative Commission & Surge Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-coop-50 text-coop-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Society Rate Configurations</h3>
              <p className="text-xs text-slate-500">Regulate welfare deductor and emergency need-now surge</p>
            </div>
          </div>

          <form onSubmit={handleUpdateCoopSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cooperative Welfare Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:border-coop-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Allocated to Worker Welfare Trust</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Surge Multiplier
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.0"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:border-coop-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Applied to 'Need Now' bookings</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cash on Delivery (COD)</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="codCheck"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-4 h-4 accent-coop-600 rounded"
                  />
                  <label htmlFor="codCheck" className="text-xs font-bold text-slate-800">
                    Enable COD for Customers
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="mt-3 w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {savingSettings ? 'Saving...' : 'Save Rate Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Services Grid (Spacious Cards) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">Current Cooperative Service Items</h2>
            <span className="text-xs font-bold text-slate-500">{services.length} Total Services</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((s) => (
              <div
                key={s._id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase bg-coop-50 text-coop-700 px-2.5 py-0.5 rounded-lg border border-coop-200">
                      {s.category}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Base Rate</span>
                    <span className="text-lg font-black text-slate-900">₹{s.basePrice}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">Est. Duration</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-coop-500" /> ~{s.durationEstimateMinutes}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean, Centered Add Service Modal via React Portal */}
        {showAddModal &&
          ReactDOM.createPortal(
            <div
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[88vh] overflow-y-auto transform animate-in zoom-in-95"
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-coop-100 text-coop-700 flex items-center justify-center font-bold text-xl">
                    🛠️
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Add New Service Item</h3>
                    <p className="text-xs text-slate-500">Configure base price, category, and specifications</p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Service Title</label>
                    <input
                      type="text"
                      required
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g. Water Purifier RO Membrane Replacement"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Skill Category</label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Base Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="50"
                        value={newService.basePrice}
                        onChange={(e) => setNewService({ ...newService, basePrice: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-coop-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Estimated Duration (Mins)</label>
                      <input
                        type="number"
                        min="15"
                        value={newService.durationEstimateMinutes}
                        onChange={(e) => setNewService({ ...newService, durationEstimateMinutes: parseInt(e.target.value) || 30 })}
                        className="w-full p-3 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-coop-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Detailed Description</label>
                    <textarea
                      rows={3}
                      required
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Specify deliverables, safety checks, and scope of work..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl font-bold shadow-lg shadow-coop-600/25 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <Save className="w-4 h-4" /> Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { HeartHandshake, ShieldCheck, Landmark, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

export const WorkerWelfare = () => {
  const { showToast } = useNotification();
  const [profile, setProfile] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [category, setCategory] = useState('wage_payout');
  const [message, setMessage] = useState('');
  const [bankDetails, setBankDetails] = useState({ accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', relationship: '' });

  const fetchDetails = async () => {
    try {
      const [profRes, grievRes] = await Promise.all([
        API.get('/workers/me'),
        API.get('/grievances/my'),
      ]);
      if (profRes.data.success) {
        setProfile(profRes.data.worker);
        if (profRes.data.worker.bankDetails) setBankDetails(profRes.data.worker.bankDetails);
        if (profRes.data.worker.emergencyContact) setEmergencyContact(profRes.data.worker.emergencyContact);
      }
      if (grievRes.data.success) setGrievances(grievRes.data.grievances);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleUpdateWelfare = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch('/workers/welfare', { bankDetails, emergencyContact });
      if (res.data.success) {
        showToast('Banking and Emergency contact saved successfully', 'success');
      }
    } catch (e) {
      showToast('Failed to update details', 'error');
    }
  };

  const handleCreateGrievance = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      const res = await API.post('/grievances', { category, message });
      if (res.data.success) {
        showToast('Grievance ticket raised to Cooperative Welfare Officer', 'success');
        setMessage('');
        fetchDetails();
      }
    } catch (e) {
      showToast('Failed to raise ticket', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Worker Welfare & Social Security</h1>
          <p className="text-xs text-slate-500 mt-0.5">Insurance policies, payout accounts, and grievance assistance</p>
        </div>

        {/* Insurance Coverage Banner */}
        <div className="bg-gradient-to-r from-purple-800 to-coop-800 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-400/30 text-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Social Security Policy
              </span>
              <h3 className="text-xl font-black mt-1">Labour Cooperative Welfare Group Insurance</h3>
              <p className="text-xs text-purple-200">
                Sum Insured: <strong>₹{profile?.insuranceStatus?.sumInsured || 300000}</strong> • Policy:{' '}
                {profile?.insuranceStatus?.policyNumber || 'COOP-INS-2026-081'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white text-purple-900 px-4 py-2 rounded-xl">
            100% Cooperative Funded
          </span>
        </div>

        {/* Bank Details & Emergency Contact Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Direct Payout & Bank Account Details</h3>
          <form onSubmit={handleUpdateWelfare} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="918237461928"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  placeholder="SBIN0001234"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank & Branch Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="State Bank of India"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI ID (Direct Payouts)</label>
                <input
                  type="text"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  placeholder="9811000101@upi"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md shadow-coop-600/20"
            >
              Save Bank & Contact Details
            </button>
          </form>
        </div>

        {/* Raise Grievance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2">Raise a Grievance Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">
              Directly notify your Cooperative Welfare Board about wage disputes or medical claims.
            </p>

            <form onSubmit={handleCreateGrievance} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                >
                  <option value="wage_payout">Wage Payout Dispute</option>
                  <option value="insurance_claim">Medical & Insurance Claim</option>
                  <option value="customer_behavior">Customer Misbehavior</option>
                  <option value="safety">Field Safety Issue</option>
                  <option value="technical_app">Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Description</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your situation in detail..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Submit Grievance Ticket
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Your Past Grievances</h3>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
              {grievances.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No grievances raised</div>
              ) : (
                grievances.map((g) => (
                  <div key={g._id} className="py-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 uppercase text-[10px]">{g.category.replace(/_/g, ' ')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600">{g.message}</p>
                    {g.adminResponse && (
                      <p className="text-coop-700 font-medium text-[11px] mt-1 bg-coop-50 p-2 rounded-lg">
                        Admin Note: {g.adminResponse}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

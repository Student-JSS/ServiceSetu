import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Award,
  MapPin,
  Clock,
  Eye,
  X,
  AlertTriangle,
  FileCheck,
  Sparkles
} from 'lucide-react';

export const WorkerVerificationQueue = () => {
  const { showToast } = useNotification();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkerId, setActiveWorkerId] = useState(null);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified'

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchWorkers = async () => {
    try {
      const res = await API.get('/admin/workers');
      if (res.data.success) {
        setWorkers(res.data.workers);
        // Automatically expand the first pending worker if available
        const firstPending = res.data.workers.find((w) => !w.isVerified);
        if (firstPending && !activeWorkerId) {
          setActiveWorkerId(firstPending._id);
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Could not load worker queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleVerify = async (workerId, isVerified) => {
    try {
      const res = await API.patch(`/admin/workers/${workerId}/verify`, {
        isVerified,
        verificationNotes: notes || (isVerified ? 'Documents verified by Cooperative Admin' : 'Incomplete documentation'),
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setNotes('');
        fetchWorkers();
      }
    } catch (e) {
      showToast('Failed to update verification', 'error');
    }
  };

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const filteredWorkers = workers.filter((w) => {
    if (filter === 'pending') return !w.isVerified;
    if (filter === 'verified') return w.isVerified;
    return true;
  });

  const pendingCount = workers.filter((w) => !w.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-3 pb-12 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-coop-50 text-coop-700 px-2.5 py-0.5 rounded-full border border-coop-200">
                Cooperative KYC Center
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Worker KYC & Verification Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect uploaded ID proofs and skill certifications to approve and issue certified badges.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'all' ? 'bg-white text-coop-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({workers.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'verified' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Verified ({workers.length - pendingCount})
            </button>
          </div>
        </div>

        {/* Worker Queue List with Directly Below Accordion Inspector */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs font-bold text-slate-400">
            Loading worker verification applications...
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800">No applications matching this filter.</p>
            <p className="text-slate-400">All worker KYC submissions are up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkers.map((w) => {
              const isExpanded = activeWorkerId === w._id;
              const isPending = !w.isVerified;

              return (
                <div
                  key={w._id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isPending
                      ? isExpanded
                        ? 'bg-white border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : isExpanded
                      ? 'bg-white border-coop-500 ring-2 ring-coop-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Worker Row Summary Card */}
                  <div
                    onClick={() => setActiveWorkerId(isExpanded ? null : w._id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm ${
                          isPending ? 'bg-gradient-to-tr from-amber-600 to-amber-400' : 'bg-gradient-to-tr from-emerald-600 to-coop-600'
                        }`}
                      >
                        {w.userId?.fullName?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">
                            {w.userId?.fullName || 'Registered Worker'}
                          </h3>
                          {isPending ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> Pending KYC
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Phone: <strong className="text-slate-700">{w.userId?.phone}</strong> • Aadhaar: <strong className="text-slate-700">{w.aadhaarNumber || 'Provided'}</strong>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {w.skills?.map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold capitalize bg-coop-50 text-coop-700 px-2 py-0.5 rounded-lg border border-coop-200"
                            >
                              {skill}
                            </span>
                          ))}
                          <span className="text-[10px] font-medium text-slate-400">
                            • {w.experienceYears} Years Exp • {w.serviceRadiusKm} km Radius
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Indicator Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] font-bold text-coop-700 bg-coop-50 px-2.5 py-1 rounded-xl border border-coop-200">
                        {w.documents?.length || 2} Docs Uploaded
                      </span>
                      <button className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* KYC Inspection Panel (Appears Directly Below That Worker's Row) */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-7 space-y-5 animate-in slide-in-from-top-2">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-coop-600" />
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            KYC Credentials & Document Inspection for {w.userId?.fullName}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">Application ID #{w._id.slice(-6).toUpperCase()}</span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Aadhaar Number</span>
                          <span className="font-mono font-bold text-slate-800">{w.aadhaarNumber || 'Verified in Registry'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Experience</span>
                          <span className="font-bold text-slate-800">{w.experienceYears} Years</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Service Coverage</span>
                          <span className="font-bold text-slate-800">{w.serviceRadiusKm} km Travel Radius</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Welfare Insurance</span>
                          <span className="font-bold text-emerald-700">₹3L Ayushman Eligible</span>
                        </div>
                      </div>

                      {/* Uploaded Verification Documents Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-coop-600" />
                            Uploaded KYC Verification Documents (Submitted by Worker)
                          </label>
                          <span className="text-[10px] text-slate-400 font-semibold">Click to preview file</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Document 1: Aadhaar Card */}
                          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-coop-400 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-coop-50 flex items-center justify-center text-coop-700 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-xs">
                                  {w.documents?.[0]?.title || 'Aadhaar / ID Card Proof'}
                                </h5>
                                <span className="text-[10px] text-slate-400 block">Identity & Address Proof</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: w.documents?.[0]?.title || 'Aadhaar / ID Card Proof',
                                  docType: 'Aadhaar Card Proof',
                                  workerName: w.userId?.fullName,
                                  workerPhone: w.userId?.phone,
                                  aadhaarNumber: w.aadhaarNumber,
                                  skills: w.skills,
                                  fileUrl: w.documents?.[0]?.fileUrl ? getFullFileUrl(w.documents[0].fileUrl) : null,
                                })
                              }
                              className="px-3 py-1.5 bg-coop-50 hover:bg-coop-100 text-coop-700 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-colors border border-coop-200 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </div>

                          {/* Document 2: Skill Certificate */}
                          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-coop-400 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-xs">
                                  {w.documents?.[1]?.title || 'Skill Qualification Certificate'}
                                </h5>
                                <span className="text-[10px] text-slate-400 block">Trade Competency Certificate</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: w.documents?.[1]?.title || 'Skill Qualification Certificate',
                                  docType: 'Trade Competency License',
                                  workerName: w.userId?.fullName,
                                  workerPhone: w.userId?.phone,
                                  aadhaarNumber: w.aadhaarNumber,
                                  skills: w.skills,
                                  fileUrl: w.documents?.[1]?.fileUrl ? getFullFileUrl(w.documents[1].fileUrl) : null,
                                })
                              }
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-colors border border-amber-200 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Admin Verification Note Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Admin Verification Remarks / Notes
                        </label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Identity verified against UIDAI and trade certification approved by society."
                          className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-coop-500 font-medium"
                        />
                      </div>

                      {/* Action Decision Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerify(w._id, false)}
                              className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-black transition-colors border border-rose-200 flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" /> Reject / Request Re-submission
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerify(w._id, true)}
                              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve KYC & Activate Worker
                            </button>
                          </>
                        ) : (
                          <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>This worker is officially KYC Verified & active in customer search.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleVerify(w._id, false)}
                              className="text-xs font-bold text-rose-600 hover:underline"
                            >
                              Revoke Badge
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Document Viewer Modal */}
      {viewingDoc &&
        ReactDOM.createPortal(
          <div
            onClick={() => setViewingDoc(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">{viewingDoc.title}</h3>
                  <span className="text-[11px] text-coop-700 font-bold">Applicant: {viewingDoc.workerName}</span>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Preview Display */}
              <div className="my-5">
                {viewingDoc.fileUrl ? (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center min-h-[260px]">
                    <img
                      src={viewingDoc.fileUrl}
                      alt="Uploaded Document"
                      className="max-h-[350px] w-auto object-contain rounded-xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        document.getElementById('fallback-doc-view').style.display = 'block';
                      }}
                    />
                    <div id="fallback-doc-view" style={{ display: 'none' }} className="p-6 text-center">
                      <FileText className="w-12 h-12 text-coop-500 mx-auto mb-2" />
                      <p className="font-bold text-xs text-slate-700">Digital Document Verified</p>
                      <a
                        href={viewingDoc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-coop-600 hover:underline"
                      >
                        Open Raw Document File <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-coop-950 text-white shadow-lg space-y-4 border border-coop-500/30">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          Cooperative KYC Document
                        </span>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">UIDAI Verified</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-300">
                        Document Type: <strong className="text-white">{viewingDoc.docType}</strong>
                      </p>
                      <p className="text-slate-300">
                        Holder Name: <strong className="text-white">{viewingDoc.workerName}</strong>
                      </p>
                      <p className="text-slate-300">
                        Registered Mobile: <strong className="text-white font-mono">{viewingDoc.workerPhone}</strong>
                      </p>
                      <p className="text-slate-300">
                        Aadhaar UID: <strong className="text-emerald-300 font-mono">{viewingDoc.aadhaarNumber || 'XXXX-XXXX-8921'}</strong>
                      </p>
                      <p className="text-slate-300">
                        Certified Trade Skills: <strong className="text-white capitalize">{viewingDoc.skills?.join(', ')}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                      <span>National Labour Cooperative Registry</span>
                      <span className="text-emerald-400 font-bold">✓ Official Government Tier Standard</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close Document Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};


import React from 'react';
import { X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const InvoiceModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-coop-600 text-white flex items-center justify-center shadow-lg shadow-coop-600/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">TAX INVOICE & RECEIPT</h3>
                <p className="text-xs text-coop-600 font-semibold">Labour Cooperative Federation of India</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {booking.paymentStatus === 'paid' ? 'PAID ONLINE' : booking.paymentStatus === 'cod_collected' ? 'COD PAID' : 'PAYMENT RECORDED'}
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {booking.invoiceNumber || `INV-${booking._id.slice(-6).toUpperCase()}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">BILLED TO (CUSTOMER):</span>
            <p className="font-bold text-slate-800">{booking.customerId?.fullName || 'Customer'}</p>
            <p className="text-slate-500">{booking.customerId?.phone}</p>
            <p className="text-slate-500 truncate">{booking.address}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block mb-1">SERVICE WORKER:</span>
            <p className="font-bold text-slate-800">{booking.workerId?.userId?.fullName || 'Cooperative Worker'}</p>
            <p className="text-slate-500">{booking.cooperativeId?.name || 'Central Labour Co-op'}</p>
            <p className="text-slate-500">Certified Skilled Member</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-slate-200 pb-2 px-1">
            <span>SERVICE DESCRIPTION</span>
            <span>AMOUNT</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100 px-1">
            <div>
              <p className="text-sm font-bold text-slate-800">{booking.serviceId?.name || 'Skilled Service'}</p>
              <p className="text-xs text-slate-400">
                {booking.isEmergency ? '🚨 Emergency On-Demand Dispatch' : 'Standard Scheduled Booking'}
              </p>
            </div>
            <span className="text-sm font-extrabold text-slate-900">₹{booking.totalAmount}</span>
          </div>
        </div>

        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/70 mb-6">
          <h5 className="text-xs font-extrabold text-emerald-900 mb-2">
            🤝 Fair Cooperative Economics Distribution
          </h5>
          <div className="space-y-1.5 text-xs text-emerald-800">
            <div className="flex justify-between">
              <span>Direct Worker Wage (90%):</span>
              <span className="font-bold text-emerald-900">₹{booking.workerEarnings || Math.round(booking.totalAmount * 0.9)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700">
              <span>Cooperative Welfare & Insurance Reserve (5%):</span>
              <span>₹{booking.coopFee || Math.round(booking.totalAmount * 0.05)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700">
              <span>Federation Technology & Operations (5%):</span>
              <span>₹{booking.platformFee || Math.round(booking.totalAmount * 0.05)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">TOTAL SETTLED</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{booking.totalAmount}</span>
          </div>
          <div className="flex gap-3">
            {booking.invoiceUrl && (
              <a
                href={booking.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md shadow-coop-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

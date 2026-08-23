import React, { useState } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  IndianRupee,
  Smartphone
} from 'lucide-react';

export const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const { showToast } = useNotification();
  const [paymentTab, setPaymentTab] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentData, setSuccessPaymentData] = useState(null);

  // Card mock state
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  const totalAmount = booking?.totalAmount || 349;
  const workerWage = booking?.workerEarnings || Math.round(totalAmount * 0.9);
  const welfareFee = booking?.coopFee || Math.round(totalAmount * 0.05);
  const fedFee = booking?.federationFee || Math.round(totalAmount * 0.05);

  const handlePayOnline = async (method = 'upi') => {
    setProcessing(true);
    try {
      const res = await API.post('/payments/verify', {
        bookingId: booking._id,
        method,
        razorpayPaymentId: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        razorpayOrderId: `ord_${Date.now()}`,
      });

      if (res.data.success) {
        showToast('Payment verified successfully! Receipt and invoice generated.', 'success');
        setPaymentSuccess(true);
        setSuccessPaymentData(res.data);
        if (onSuccess) onSuccess(res.data.booking);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment processing failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectCOD = async () => {
    setProcessing(true);
    try {
      const res = await API.post('/payments/cod', { bookingId: booking._id });
      if (res.data.success) {
        showToast('Payment method set to Cash on Delivery (COD)', 'success');
        if (onSuccess) onSuccess(res.data.booking);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select COD', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(`http://localhost:5000/api/payments/invoice/${booking._id}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {!paymentSuccess ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-coop-100 text-coop-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-coop-700 bg-coop-50 px-2 py-0.5 rounded border border-coop-200">
                  Cooperative Payment Gateway
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Settle Service Payment</h3>
              </div>
            </div>

            {/* Bill Breakdown Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-700">
                <span>{booking.serviceId?.name || 'Service Job'}</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                <span>✓ Direct Worker Fair Wage (90%):</span>
                <span>₹{workerWage}</span>
              </div>
              <div className="flex justify-between text-purple-700 text-[11px]">
                <span>✓ Worker Welfare & Insurance Fund (5%):</span>
                <span>₹{welfareFee}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>✓ Open Tech Infrastructure Fee (5%):</span>
                <span>₹{fedFee}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Payable:</span>
                <span className="text-emerald-700 font-extrabold text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setPaymentTab('upi')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'upi' ? 'bg-white text-coop-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" /> UPI Apps
              </button>
              <button
                onClick={() => setPaymentTab('card')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'card' ? 'bg-white text-coop-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Cards
              </button>
              <button
                onClick={() => setPaymentTab('cod')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'cod' ? 'bg-white text-coop-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash (COD)
              </button>
            </div>

            {/* Tab 1: UPI Pay */}
            {paymentTab === 'upi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <button
                      key={app}
                      onClick={() => handlePayOnline('upi')}
                      disabled={processing}
                      className="p-2.5 bg-slate-50 border border-slate-200 hover:border-coop-500 rounded-xl hover:bg-coop-50 transition-all text-slate-800"
                    >
                      <Zap className="w-4 h-4 mx-auto mb-1 text-coop-600" />
                      {app}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Or Enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => handlePayOnline('upi')}
                  disabled={processing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {processing ? 'Processing Digital Payout...' : `Pay ₹${totalAmount} via Instant UPI`}
                </button>
              </div>
            )}

            {/* Tab 2: Card Pay */}
            {paymentTab === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 text-center font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handlePayOnline('card')}
                  disabled={processing}
                  className="w-full py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-coop-600/20 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {processing ? 'Processing...' : `Pay ₹${totalAmount} with Card`}
                </button>
              </div>
            )}

            {/* Tab 3: COD Pay */}
            {paymentTab === 'cod' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-2xl font-bold">
                  💵
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Pay Cash upon Service Delivery</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Hand over ₹{totalAmount} in cash directly to your certified cooperative worker. The worker will mark it collected on their app.
                  </p>
                </div>

                <button
                  onClick={handleSelectCOD}
                  disabled={processing}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  Confirm Cash on Delivery (COD)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Payment Success View with Instant Invoice Download */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Settled 100%
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">₹{totalAmount} Paid Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                90% has been instantly credited to worker's verified cooperative ledger.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-black shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

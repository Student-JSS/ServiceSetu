import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { WorkerFinderMap } from '../../components/maps/WorkerFinderMap';
import { Sparkles, MapPin, Sliders, AlertTriangle, Siren } from 'lucide-react';

export const CustomerServices = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('electrician');
  const [selectedService, setSelectedService] = useState(null);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [radiusKm, setRadiusKm] = useState(15);
  const [customerLocation, setCustomerLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [chosenWorker, setChosenWorker] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [address, setAddress] = useState('B-42, Hauz Khas Enclave, New Delhi');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);



  useEffect(() => {
    if (user && user.role === 'worker') {
      navigate('/worker/dashboard', { replace: true });
      return;
    }

    API.get('/services/categories').then((res) => {
      if (res.data.success) setCategories(res.data.categories);
    });

    API.get('/services').then((res) => {
      if (res.data.success) {
        setServices(res.data.services);
        const preselectedId = searchParams.get('serviceId');
        if (preselectedId) {
          const match = res.data.services.find((s) => s._id === preselectedId);
          if (match) {
            setSelectedService(match);
            setSelectedCategory(match.category);
          }
        }
      }
    });
  }, [user, searchParams]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await API.get('/bookings/nearby-workers', {
          params: {
            category: selectedCategory,
            lat: customerLocation.lat,
            lng: customerLocation.lng,
            radiusKm,
          },
        });
        if (res.data.success) {
          setNearbyWorkers(res.data.workers);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkers();
  }, [selectedCategory, radiusKm, customerLocation]);

  const handleCreateBooking = async (isEmergency = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const serviceToBook = selectedService || services.find((s) => s.category === selectedCategory);
    if (!serviceToBook) {
      showToast('Please select a service first', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/bookings', {
        serviceId: serviceToBook._id,
        workerId: chosenWorker?._id || null,
        scheduledAt: scheduledAt || new Date(),
        timeSlot,
        address,
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        notes,
        isEmergency: false,
      });

      if (res.data.success) {
        showToast('Booking confirmed with cooperative worker!', 'success');
        setBookingModalOpen(false);
        navigate(`/customer/tracker/${res.data.booking._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-2 pb-8 px-3 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Cooperative Service Finder & Live Map
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select a service, view nearby certified workers, and dispatch with fair transparent rates.
            </p>
          </div>

          <button
            onClick={() => navigate(`/customer/emergency?category=${selectedCategory}`)}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Siren className="w-4 h-4 text-yellow-300 animate-bounce" />
            🚨 Emergency (Need Now Dispatch)
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-coop-600 text-white border-coop-600 shadow-md shadow-coop-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold text-slate-800">
                  Workers within {radiusKm} km radius ({nearbyWorkers.length} available)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-coop-700">
                <Sliders className="w-4 h-4" />
                <span>{radiusKm} km</span>
              </div>
            </div>

            <WorkerFinderMap
              customerLocation={customerLocation}
              workers={nearbyWorkers}
              radiusKm={radiusKm}
              onSelectWorker={(w) => {
                setChosenWorker(w);
                setBookingModalOpen(true);
              }}
            />

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-600">Search Radius:</span>
              <input
                type="range"
                min="3"
                max="30"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="flex-1 accent-coop-600"
              />
              <span className="text-xs font-mono font-bold text-slate-700">{radiusKm} km</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800">
                Certified {selectedCategory.toUpperCase()} Workers
              </h3>
              <span className="text-xs text-slate-400">{nearbyWorkers.length} nearby</span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {nearbyWorkers.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No workers in immediate {radiusKm}km range</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try expanding search radius or request an Emergency Dispatch.
                  </p>
                </div>
              ) : (
                nearbyWorkers.map((w) => (
                  <div
                    key={w._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-coop-500 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-coop-50 text-coop-700 font-bold flex items-center justify-center text-sm border border-coop-200">
                        👷
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900">{w.userId?.fullName}</h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            ★ {w.ratingAvg}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-coop-600 shrink-0" />
                          <span className="truncate max-w-[200px]">{w.userId?.address || 'New Delhi'}</span>
                        </p>
                        <p className="text-[10px] text-coop-700 font-semibold mt-0.5">
                          {w.experienceYears} yrs exp • {w.distanceKm} km away • {w.cooperativeId?.name}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setChosenWorker(w);
                        setBookingModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-bold shadow-md shadow-coop-600/20"
                    >
                      Book Worker
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-emerald-900">Auto-Assign Nearest</h5>
                <p className="text-[11px] text-emerald-700">Cooperative algorithm finds the closest available worker</p>
              </div>
              <button
                onClick={() => {
                  setChosenWorker(null);
                  setBookingModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Auto-Assign
              </button>
            </div>
          </div>
        </div>

        {bookingModalOpen &&
          ReactDOM.createPortal(
            <div
              onClick={() => setBookingModalOpen(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[88vh] overflow-y-auto transform animate-in zoom-in-95"
              >
                <h3 className="text-lg font-black text-slate-900 mb-1">Confirm Service Booking</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Service: <strong className="text-coop-700">{selectedCategory.toUpperCase()}</strong> | Worker:{' '}
                  <strong className="text-slate-800">{chosenWorker?.userId?.fullName || 'Auto-Assigned Nearest'}</strong>
                </p>

                <div className="space-y-4">
                  {/* Worker Base Station Details */}
                  {chosenWorker && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Worker Base Location
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-coop-600 shrink-0" />
                        <span>{chosenWorker.userId?.address || chosenWorker.cooperativeId?.name || 'New Delhi'}</span>
                      </div>
                      <span className="text-[10px] text-coop-700 font-semibold block">
                        {chosenWorker.cooperativeId?.name} • {chosenWorker.distanceKm} km from your destination
                      </span>
                    </div>
                  )}

                  {/* Customer Service Delivery Address (Where worker will arrive) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Service Delivery Address (Where worker will arrive)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. B-42, Hauz Khas Enclave, New Delhi"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                      >
                        <option>Immediate / Asap</option>
                        <option>Morning (09:00 - 12:00)</option>
                        <option>Afternoon (13:00 - 16:00)</option>
                        <option>Evening (17:00 - 20:00)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Special Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions for worker..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Service Price:</span>
                      <span className="font-bold text-slate-800">₹{selectedService?.basePrice || 349}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Direct Worker Wage (90%):</span>
                      <span className="font-bold">₹{Math.round((selectedService?.basePrice || 349) * 0.9)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
                      <span>Total Payable:</span>
                      <span>₹{selectedService?.basePrice || 349}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateBooking(false)}
                      disabled={submitting}
                      className="flex-1 py-3 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-black shadow-lg shadow-coop-600/20 transition-all"
                    >
                      {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
              </div>
    </div>
  );
};

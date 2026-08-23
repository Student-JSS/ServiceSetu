import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { WorkerFinderMap } from '../../components/maps/WorkerFinderMap';
import {
  Siren,
  AlertTriangle,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sliders,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const EmergencyBooking = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'electrician');
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [minRating, setMinRating] = useState(3.5);
  const [radiusKm, setRadiusKm] = useState(15);
  const [customerLocation, setCustomerLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [address, setAddress] = useState('B-42, Hauz Khas Enclave, New Delhi');
  const [notes, setNotes] = useState('Urgent emergency repair needed right now!');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/services/categories').then((res) => {
      if (res.data.success) setCategories(res.data.categories);
    });

    API.get('/services').then((res) => {
      if (res.data.success) setServices(res.data.services);
    });
  }, []);

  useEffect(() => {
    const fetchEmergencyWorkers = async () => {
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
          const highRated = res.data.workers
            .filter((w) => (w.ratingAvg || 5.0) >= minRating)
            .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
          setFilteredWorkers(highRated);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmergencyWorkers();
  }, [selectedCategory, radiusKm, customerLocation, minRating]);

  const handleInstantEmergencyDispatch = async (chosenWorkerId = null) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const service = services.find((s) => s.category === selectedCategory) || services[0];
    if (!service) {
      showToast('Please select a valid worker type', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (chosenWorkerId) {
        res = await API.post('/bookings', {
          serviceId: service._id,
          workerId: chosenWorkerId,
          isEmergency: true,
          timeSlot: 'Immediate (Need Now)',
          address,
          lat: customerLocation.lat,
          lng: customerLocation.lng,
          notes,
        });
      } else {
        res = await API.post('/bookings/emergency', {
          serviceId: service._id,
          address,
          lat: customerLocation.lat,
          lng: customerLocation.lng,
          notes,
        });
      }

      if (res.data.success) {
        showToast('🚨 Emergency request dispatched and confirmed! Tracking live worker...', 'success');
        navigate(`/customer/tracker/${res.data.booking._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Emergency dispatch failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Urgent Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-8 rounded-3xl shadow-2xl border border-red-500/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-xs font-black text-red-100 mb-3 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              HIGH PRIORITY ON-DEMAND DISPATCH
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Siren className="w-9 h-9 text-yellow-300 animate-bounce" />
              Emergency Need-Now Services
            </h1>
            <p className="text-sm text-red-100 mt-1 max-w-xl font-medium">
              Instant 1-click dispatch to certified workers with high ratings (3.5★ - 5.0★) nearest to your location.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right">
            <span className="text-xs text-red-200 block font-semibold">Emergency Surge Fare</span>
            <span className="text-2xl font-black text-yellow-300">1.25x Multiplier</span>
            <span className="text-[10px] text-red-200 block mt-0.5">Includes priority dispatch & fair wage</span>
          </div>
        </div>

        {/* Step 1: Select Worker Type */}
        <div className="bg-slate-800/90 p-6 rounded-3xl border border-slate-700/80 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              1. Select Worker Type / Skill Needed
            </h2>
            <span className="text-xs text-slate-400 font-semibold">{categories.length} Categories Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-2xl text-xs font-black text-left border flex flex-col justify-between transition-all h-24 ${
                    isSelected
                      ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30 scale-105 ring-2 ring-yellow-400'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="text-lg">
                    {cat.id === 'electrician' ? '⚡' : cat.id === 'plumber' ? '🚰' : cat.id === 'carpenter' ? '🔨' : cat.id === 'technician' ? '🔧' : cat.id === 'cleaner' ? '✨' : '👷'}
                  </span>
                  <span className="font-extrabold capitalize leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Rating Filter & Live Map Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-800/90 p-5 rounded-3xl border border-slate-700 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold text-slate-200">
                  Showing Top-Rated Workers within {radiusKm} km ({filteredWorkers.length} available)
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span>Rating {minRating}★+</span>
              </div>
            </div>

            <WorkerFinderMap
              customerLocation={customerLocation}
              workers={filteredWorkers}
              radiusKm={radiusKm}
              onSelectWorker={(w) => handleInstantEmergencyDispatch(w._id)}
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs">
              <div className="flex-1 flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-bold">Search Radius:</span>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="flex-1 accent-red-500"
                />
                <span className="font-mono font-bold text-yellow-400">{radiusKm} km</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-bold">Min Rating:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="bg-slate-800 text-yellow-400 font-bold rounded-lg px-2 py-1 border border-slate-600 focus:outline-none"
                >
                  <option value="3.5">3.5★ & Above</option>
                  <option value="4.0">4.0★ & Above (Top Rated)</option>
                  <option value="4.5">4.5★ & Above (Elite)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  Nearest Verified {selectedCategory.toUpperCase()} Pros ({minRating}★+)
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Online & Active
                </span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredWorkers.length === 0 ? (
                  <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 text-center text-xs text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    No workers meeting {minRating}★ rating in immediate {radiusKm}km. Try expanding radius or use Broadcast Dispatch.
                  </div>
                ) : (
                  filteredWorkers.map((w) => (
                    <div
                      key={w._id}
                      className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 hover:border-red-500 transition-all flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 text-white font-bold flex items-center justify-center text-base">
                          👷
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{w.userId?.fullName}</h4>
                            <span className="bg-yellow-400/20 text-yellow-300 text-[10px] font-black px-1.5 py-0.2 rounded border border-yellow-400/30 flex items-center gap-0.5">
                              ★ {w.ratingAvg || 5.0}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Distance: <strong className="text-red-400">{w.distanceKm} km away</strong> • {w.experienceYears} yrs exp
                          </p>
                          <span className="text-[10px] text-slate-500">{w.cooperativeId?.name}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInstantEmergencyDispatch(w._id)}
                        disabled={submitting}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/30 whitespace-nowrap"
                      >
                        Dispatch
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 1-Click Broadcast Dispatch (Auto-Confirms Immediately) */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 p-5 rounded-3xl border border-red-400/40 shadow-xl space-y-3">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping"></span>
                  Can't wait? 1-Click Instant Broadcast Dispatch
                </h4>
                <p className="text-xs text-red-100 mt-1">
                  Instantly confirms and assigns the closest top-rated worker ({filteredWorkers[0]?.userId?.fullName || 'Certified Worker'}) while alerting the entire cooperative field network.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-red-100 mb-1 uppercase">Emergency Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-black/30 border border-white/20 text-white placeholder-red-200 focus:outline-none focus:border-white"
                />
              </div>

              <button
                onClick={() => handleInstantEmergencyDispatch(null)}
                disabled={submitting}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-yellow-400/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Siren className="w-4 h-4 text-red-700" />
                {submitting ? 'Confirming & Dispatching Emergency...' : '1-Click Instant Confirm & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

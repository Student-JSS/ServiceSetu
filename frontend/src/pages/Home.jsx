import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  ShieldCheck,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Trees,
  Wrench,
  Home as HomeIcon,
  ArrowRight,
  Clock,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Siren
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Trees,
  Wrench,
  Home: HomeIcon,
};

// Fallback unique descriptions if not loaded from backend
const UNIQUE_DESCRIPTIONS = {
  "Fan, Light & Switchboard Repair": "Fix circuit trips, sparkings, ceiling fan regulator, light fittings, and socket wiring tests with safety equipment.",
  "Complete Home Electrical Inspection": "Full circuit load audit, MCB distribution board safety check, earthing leakage test, and thermal hotspot scanning.",
  "Tap Leakage & Pipe Joint Fixing": "High-pressure pipe joint repair, brass tap washer replacement, basin mixer seal fixing, and zero-drip testing.",
  "Bathroom Sanitary & Blockage Clear": "Heavy-duty drain snake unclogging for washbasins, commodes, traps, and odour-free drainage flushing.",
  "Door Lock & Handle Replacement": "Precision installation of mortise locks, cylindrical handles, security latches, and wooden door alignment.",
  "Furniture Assembly & Wood Polishing": "Wardrobe/bed flatpack assembly, teakwood scratch buffing, PU polish touch-up, and hinge tightening.",
  "Single Room Interior Painting": "Wall putty surface preparation, 2 coats premium washable acrylic emulsion with drop-cloth floor protection.",
  "Full Home Deep Cleaning (2 BHK)": "Single-disc floor scrubbing, tile grout descaling, glass streak-free shine, and balcony dust removal.",
  "Kitchen & Chimney Degreasing": "Removal of burnt oil & grease from baffle filters, stove burners, countertop backsplash, and cabinet exteriors.",
  "Elderly Home Caregiver (Day Shift)": "Compassionate certified bedside care, vital signs recording (BP/Sugar), mobility assist, and medication schedules.",
  "Personal Chauffeur / Driver On-Demand": "Police-verified, experienced manual & automatic car chauffeur for city errands, outstation, or daily office commutes.",
  "Lawn Mowing & Garden Trim": "Grass trimming, ornamental bush pruning, organic vermicompost enrichment, and potted plant weeding.",
  "Split AC Servicing & Gas Top-up": "Jet-pump coil foam wash, drain tray unclog, copper pipe pressure inspection, and cooling gas level calibration.",
  "Daily Household Cooking & Helper": "Hygienic home-cooked meals (North/South Indian recipes), vegetable prep, kitchen tidy-up, and vessel assistance.",
};

export const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
        return;
      } else if (user.role === 'coop_admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      } else if (user.role === 'fed_admin') {
        navigate('/federation/dashboard', { replace: true });
        return;
      }
    }
    const fetchData = async () => {
      try {
        const [catRes, srvRes] = await Promise.all([
          API.get('/services/categories'),
          API.get('/services'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (srvRes.data.success) setServices(srvRes.data.services);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  const filteredServices = services.filter((s) => {
    const matchesCat = !selectedCategory || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section (2-Column Responsive Layout) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-coop-50/80 via-white to-slate-50 pt-12 pb-16 lg:pt-16 lg:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: All Text & Actions (Aligned Left) */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coop-100 text-coop-800 text-xs font-bold border border-coop-200 shadow-xs animate-fade-in">
                <Award className="w-4 h-4 text-coop-600" />
                Empowered by Labour Cooperative Federations of India
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {t('home.heroTitle')}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                {t('home.heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/customer/services"
                  className="px-6 py-3.5 bg-gradient-to-r from-coop-600 to-coop-500 hover:from-coop-700 hover:to-coop-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-coop-600/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('home.bookNow')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/worker/register"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-bold shadow-xs transition-all hover:scale-105"
                >
                  Join as Worker
                </Link>
              </div>

              {/* Red Emergency CTA Banner (Left-aligned & responsive) */}
              <div className="pt-2">
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl text-2xl font-bold shrink-0">
                      <Siren className="w-6 h-6 text-yellow-300 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white">Need Emergency Repair Now?</h3>
                      <p className="text-xs text-red-100 mt-0.5">
                        1-Click priority dispatch to top-rated nearby verified workers (3.5★ - 5.0★).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/customer/emergency')}
                    className="w-full sm:w-auto px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl text-xs whitespace-nowrap shadow-lg shadow-yellow-400/30 transition-all hover:scale-105 shrink-0 text-center"
                  >
                    Dispatch Emergency (Need Now)
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Hero Portrait Image (Pronto Style - Clean Direct Placement, No Box/Borders) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-end p-0 m-0">
              <img
                src="/hero_worker.jpg"
                alt="ServiceSetu Certified Service Professional"
                className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto max-h-[520px] lg:max-h-[580px] object-contain object-bottom select-none p-0 m-0 border-0 shadow-none bg-transparent"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Categories Horizontal Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">{t('home.popularServices')}</h2>
          <p className="text-xs text-slate-500 mt-1">Predefined, fixed cooperative pricing with verified skill standards</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === ''
                ? 'bg-coop-600 text-white border-coop-600 shadow-md shadow-coop-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Wrench;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-coop-600 text-white border-coop-600 shadow-md shadow-coop-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-coop-600'}`} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* REDESIGNED Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredServices.map((srv) => {
            const specificDesc = UNIQUE_DESCRIPTIONS[srv.name] || srv.description;
            return (
              <div
                key={srv._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-coop-50 text-coop-700 px-2.5 py-1 rounded-lg border border-coop-200">
                      {srv.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Co-op Certified
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{srv.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {specificDesc}
                  </p>
                </div>

                {/* Bottom Bar: Price on Bottom-Left + Book Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Fixed Fair Rate</span>
                    <span className="text-xl font-black text-slate-900">₹{srv.basePrice}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/customer/services?serviceId=${srv._id}`)}
                    className="px-4 py-2.5 bg-coop-600 hover:bg-coop-700 text-white rounded-xl text-xs font-black shadow-md shadow-coop-600/20 transition-all hover:scale-105"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cooperative Value Propositions */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{t('home.coopValues')}</h2>
            <p className="text-slate-400 text-sm mt-2">Built for worker dignity and consumer reliability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.val1Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('home.val1Desc')}</p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.val2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('home.val2Desc')}</p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.val3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('home.val3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import { ShieldCheck, Upload, Award, CheckCircle2, Building2, MapPin, Wrench, Check } from 'lucide-react';

export const WorkerRegister = () => {
  const { t } = useTranslation();
  const { registerWorker } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [selectedCoopId, setSelectedCoopId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    aadhaarNumber: '',
    experienceYears: '',
    serviceRadiusKm: 15,
    address: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
  });

  const [selectedSkills, setSelectedSkills] = useState(['electrician']);
  const [idProofFile, setIdProofFile] = useState(null);
  const [skillCertFile, setSkillCertFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load service categories and regional cooperatives
    Promise.all([
      API.get('/services/categories'),
      API.get('/auth/cooperatives'),
    ])
      .then(([catRes, coopRes]) => {
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (coopRes.data.success && Array.isArray(coopRes.data.cooperatives)) {
          setCooperatives(coopRes.data.cooperatives);
          if (coopRes.data.cooperatives.length > 0) {
            setSelectedCoopId(coopRes.data.cooperatives[0]._id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load form prerequisites', err);
      });
  }, []);

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skillId));
      }
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.aadhaarNumber) {
      showToast('Please fill all required worker profile fields', 'error');
      return;
    }

    if (!selectedCoopId) {
      showToast('Please select your regional cooperative society chapter', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('phone', formData.phone);
      data.append('aadhaarNumber', formData.aadhaarNumber);
      data.append('cooperativeId', selectedCoopId);
      data.append('experienceYears', formData.experienceYears !== '' ? formData.experienceYears : 0);
      data.append('serviceRadiusKm', formData.serviceRadiusKm);
      data.append('address', formData.address);
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);
      data.append('skills', JSON.stringify(selectedSkills));

      if (idProofFile) data.append('idProof', idProofFile);
      if (skillCertFile) data.append('skillCert', skillCertFile);
      if (photoFile) data.append('photo', photoFile);

      await registerWorker(data);
      showToast('Application submitted! Your details have been routed to your selected Cooperative Society for KYC verification.', 'success');
      navigate('/worker/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Register as a Worker</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join a verified regional Labour Cooperative Society under the National Federation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Section 1: Cooperative Society Selection */}
          <div className="bg-gradient-to-br from-coop-50/80 to-emerald-50/50 p-5 rounded-3xl border border-coop-200 space-y-3">
            <div className="flex items-center gap-2 text-coop-900 font-extrabold text-sm">
              <Building2 className="w-4 h-4 text-coop-600" />
              <span>Select Your Primary Cooperative Society (Regional Chapter) *</span>
            </div>
            <p className="text-[11px] text-coop-800 leading-relaxed">
              Your registration application and KYC verification documents will be sent <strong>strictly to this specific society</strong> for review and admin approval.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {cooperatives.map((coop) => {
                const isSelected = selectedCoopId === coop._id;
                return (
                  <button
                    type="button"
                    key={coop._id}
                    onClick={() => setSelectedCoopId(coop._id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-white border-coop-600 shadow-md ring-2 ring-coop-500/20 text-slate-900'
                        : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block leading-snug">{coop.name}</span>
                        <span className="text-[10px] font-bold text-coop-700 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-coop-600" /> {coop.city || coop.state}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-coop-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block line-clamp-1">{coop.address}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Personal Identification */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Personal & Contact Credentials
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ramesh Kumar"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9811000101"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="XXXX-XXXX-8921"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  placeholder="e.g. 5"
                  value={formData.experienceYears}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, experienceYears: val === '' ? '' : parseInt(val) || '' });
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address / Area</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Rohini Sector 10, New Delhi"
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
              />
            </div>
          </div>

          {/* Section 3: Certified Skills */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Skill Trade Certifications (Select all that apply)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedSkills.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleSkill(cat.id)}
                    className={`p-3 rounded-2xl font-bold text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-coop-600 border-coop-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Service Radius */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Preferred Work Travel Radius</label>
              <span className="font-black text-coop-700 bg-coop-50 px-2.5 py-1 rounded-lg border border-coop-200">
                {formData.serviceRadiusKm} km coverage
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={formData.serviceRadiusKm}
              onChange={(e) => setFormData({ ...formData, serviceRadiusKm: parseInt(e.target.value) })}
              className="w-full accent-coop-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Section 5: Document Uploads */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              3. KYC Verification Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aadhaar / ID Card Proof</label>
                <input
                  type="file"
                  onChange={(e) => setIdProofFile(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-coop-50 file:text-coop-700 hover:file:bg-coop-100"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Certificate / Trade License</label>
                <input
                  type="file"
                  onChange={(e) => setSkillCertFile(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-coop-50 file:text-coop-700 hover:file:bg-coop-100"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-coop-600 to-coop-500 hover:from-coop-700 hover:to-coop-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-coop-600/25 transition-all"
          >
            {submitting ? 'Submitting Application to Society...' : 'Submit Application to Selected Cooperative Society'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already a registered cooperative worker?{' '}
          <Link to="/login" className="font-bold text-coop-600 hover:underline">
            Sign In to Worker Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

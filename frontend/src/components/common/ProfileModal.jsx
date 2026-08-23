import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { User, Phone, MapPin, Mail, Wrench, ShieldCheck, X, CheckCircle2, Save } from 'lucide-react';

const SKILL_OPTIONS = [
  'electrician',
  'plumber',
  'carpenter',
  'painter',
  'cleaner',
  'caregiver',
  'driver',
  'gardener',
  'technician',
  'domestic helper'
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const { showToast } = useNotification();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Worker specific
  const [skills, setSkills] = useState(user?.workerProfile?.skills || ['electrician']);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(user?.workerProfile?.serviceRadiusKm || 15);
  const [experienceYears, setExperienceYears] = useState(user?.workerProfile?.experienceYears || 3);
  const [saving, setSaving] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSkill = (s) => {
    if (skills.includes(s)) {
      if (skills.length > 1) setSkills(skills.filter((item) => item !== s));
    } else {
      setSkills([...skills, s]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName,
        phone,
        email,
        address,
        avatarUrl,
        skills,
        serviceRadiusKm,
        experienceYears,
      };

      const res = await API.patch('/auth/profile', payload);
      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        if (setUser) setUser(res.data.user);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Outer container has onClick={onClose} to dismiss popup when clicking anywhere outside
  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[88vh] overflow-y-auto transform animate-in zoom-in-95"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-coop-100 text-coop-700 flex items-center justify-center text-2xl font-bold shadow-inner">
            {user?.role === 'worker' ? '👷' : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                {user?.role === 'worker' ? 'Edit Worker Profile' : 'Edit Customer Profile'}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-coop-50 text-coop-700 px-2 py-0.5 rounded border border-coop-200">
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage your personal credentials, contact & service preferences</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Address / Area</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Connaught Place, New Delhi"
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-coop-500 font-medium"
            />
          </div>

          {/* Worker Specific Skills & Radius Configuration */}
          {user?.role === 'worker' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block font-bold text-slate-800">Your Certified Skill Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SKILL_OPTIONS.map((s) => {
                  const isChecked = skills.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className={`p-2.5 rounded-xl text-left font-bold capitalize border transition-all ${
                        isChecked
                          ? 'bg-coop-600 text-white border-coop-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Radius (km)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExperienceYears(val === '' ? '' : parseInt(val) || '');
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl font-bold shadow-lg shadow-coop-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

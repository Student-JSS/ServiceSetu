import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ComplaintModal } from './ComplaintModal';
import {
  ShieldCheck,
  Phone,
  MessageSquare,
  AlertTriangle,
  HeartHandshake,
  Award,
  ExternalLink,
  Mail,
  MapPin,
  Scale
} from 'lucide-react';

export const Footer = () => {
  const { user } = useAuth();
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800/80 pt-12 pb-8 mt-0 w-full text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Grid: Compact & Enlarged Typography */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-slate-800/80">
          {/* Brand Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="ServiceSetu Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-coop-400 to-emerald-400 bg-clip-text text-transparent">
                ServiceSetu
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's cooperative-owned digital gig marketplace ensuring 90%+ direct fair wages, worker insurance, and consumer trust.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
              <Award className="w-3.5 h-3.5" /> 90%+ Direct Worker Wage Guarantee
            </span>
          </div>

          {/* 24x7 Helpline */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-xs">
              24x7 Cooperative Helpline
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-coop-400 shrink-0" />
                <span>Toll-Free: <strong className="text-slate-200">1800-11-SHRAMIK</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: <strong className="text-slate-200">+91 98765 43210</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Support: <strong className="text-slate-200">support@ServiceSetu.in</strong></span>
              </div>
            </div>
          </div>

          {/* Dispute Redressal */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" /> Grievance & Dispute Cell
            </h4>
            <p className="text-slate-400 text-xs">
              Zero tolerance for misbehavior or wage disputes. All complaints reviewed within 24h.
            </p>
            <button
              onClick={() => setComplaintModalOpen(true)}
              className="w-full py-2 px-3 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <span>🚨 File a Formal Complaint</span>
              <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black">Fast Track</span>
            </button>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-xs">
              Quick Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/customer/services" className="hover:text-coop-400 transition-colors">
                  Services & Live Worker Map
                </Link>
              </li>
              <li>
                <Link to="/customer/emergency" className="hover:text-red-400 text-red-400 font-bold transition-colors">
                  🚨 Emergency Need-Now Dispatch
                </Link>
              </li>
              <li>
                <Link to="/worker/register" className="hover:text-coop-400 transition-colors">
                  Join as Certified Co-op Worker
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-coop-400 transition-colors">
                  Cooperative Admin & Federation Sign-in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-3">
          <p>© 2026 Cooperative Gig Services Platform • National Labour Cooperative Federation of India</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">ISO 9001:2015</span>
            <span>•</span>
            <span className="text-slate-400">Skill India Certified</span>
            <span>•</span>
            <span className="text-slate-400">NCUI Affiliated</span>
          </div>
        </div>
      </div>

      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
      />
    </footer>
  );
};

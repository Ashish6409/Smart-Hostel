import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Bed, 
  Users, 
  AlertTriangle, 
  Utensils, 
  QrCode, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Calendar,
  Compass,
  FileCheck
} from 'lucide-react';
import api from '../services/api';

export default function StudentHub({ currentUser, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Friendly Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#0e1424] to-[#121124] border border-white/[0.08] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student Resident Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
              <span>Roll No: <strong className="font-mono text-slate-200">{currentUser?.rollNumber || 'CS23B042'}</strong></span>
              <span>•</span>
              <span>Allotted: <strong className="text-indigo-400 font-semibold">Room {currentUser?.roomNumber || 'A-104'} (Block A)</strong></span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('complaints')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => onNavigate('security')}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-white/[0.08] transition-all flex items-center space-x-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Visitor Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: My Room & Roommate */}
        <div className="glass-panel card-hover rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Bed className="w-4 h-4" />
                </div>
                <span>Room Allotment</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                Active Resident
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">Room {currentUser?.roomNumber || 'A-104'}</span>
              <span className="text-xs text-slate-400">• Block A (Floor 1)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Double AC Room • Study Table • High-Speed LAN</p>

            <div className="mt-4 p-3.5 bg-[#080c16]/80 rounded-xl border border-white/[0.06] text-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Roommate</p>
              <p className="text-slate-200 font-semibold text-sm">Amit Patel (CS23B043)</p>
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>94% Lifestyle Compatibility (Synchronized Night Owl schedule)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('rooms')}
            className="mt-5 w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 text-xs font-semibold rounded-xl border border-white/[0.06] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>View Allotment & Swap Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Mess & Meal Status */}
        <div className="glass-panel card-hover rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <span>Hostel Mess Status</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/30">
                AI Meal Forecast
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">Next Meal: Dinner</span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">07:30 PM – 09:30 PM</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Expected: 420 students • Prepared: 430 meals</p>

            <div className="mt-4 p-3.5 bg-[#080c16]/80 rounded-xl border border-white/[0.06] text-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Meal Opt-in Status</p>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Opted-In for Tonight (Campus Dining Hall)</span>
              </div>
              <p className="text-[11px] text-slate-500">Going home this weekend? Submit leave pass to save meal charges.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('mess')}
            className="mt-5 w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-xl border border-white/[0.06] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Apply For Leave Pass / Mess Rebate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Recent Complaints */}
        <div className="glass-panel card-hover rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>Maintenance Requests</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Room A-104</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#080c16]/80 rounded-xl border border-white/[0.06] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">AC cooling failure in A-104</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-bold border border-amber-500/30">
                    ASSIGNED
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">Technician: Suresh Kumar (HVAC Specialist)</p>
              </div>

              <div className="p-3 bg-[#080c16]/80 rounded-xl border border-white/[0.06] text-xs opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Study table lamp flickering</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-500/30">
                    RESOLVED
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('complaints')}
            className="mt-5 w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl border border-white/[0.06] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>View All My Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Fee & Invoicing Status */}
        <div className="glass-panel card-hover rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>Hostel Fee Ledger</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                All Cleared
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">₹72,000</span>
              <span className="text-xs text-slate-400">• Spring Semester 2026</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Includes Room Rent (₹50k), Mess (₹18k), Amenities (₹4k)</p>

            <div className="mt-4 p-3 bg-[#080c16]/80 rounded-xl border border-white/[0.06] text-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-mono">Invoice: INV-2026-S1-001</p>
                <p className="text-emerald-400 font-semibold text-xs mt-0.5">Paid via UPI • Zero Outstanding</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>

          <button
            onClick={() => onNavigate('fees')}
            className="mt-5 w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-purple-300 hover:text-purple-200 text-xs font-semibold rounded-xl border border-white/[0.06] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>View Fee Receipt & Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

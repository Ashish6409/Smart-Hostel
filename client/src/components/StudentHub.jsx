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
  Calendar
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Friendly Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Roll No: <span className="font-mono text-slate-300">{currentUser?.rollNumber || 'CS23B042'}</span> • 
              Resident of <span className="text-indigo-300 font-semibold">Room {currentUser?.roomNumber || 'A-104'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('complaints')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report an Issue</span>
            </button>
            <button
              onClick={() => onNavigate('passes')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Visitor Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential Student Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: My Room & Roommate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <Bed className="w-4 h-4 text-indigo-400" />
                <span>My Room Details</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Allocated
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">Room {currentUser?.roomNumber || 'A-104'}</span>
              <span className="text-xs text-slate-400">• Block A (Floor 1)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Double AC Room • High-Speed WiFi • Study Desks</p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Roommate</p>
              <p className="text-slate-200 font-medium">Amit Patel (CS23B043)</p>
              <p className="text-emerald-400 text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>94% Lifestyle Compatibility (Synchronized Night Owl schedule)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('room')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Update Room Preferences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Today's Mess & Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Hostel Mess Status</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                AI Optimized
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">Next Meal: Dinner</span>
              <span className="text-xs text-emerald-400 font-mono">07:30 PM – 09:30 PM</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Expected: 420 students • Prepared: 430 meals</p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">My Meal Status</p>
              <p className="text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Opted-In for Dinner (Serving on Campus)</span>
              </p>
              <p className="text-[11px] text-slate-500">Going home this weekend? Submit leave to deduct meals.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('mess')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Apply For Meal Opt-Out / Leave Pass</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Recent Complaints */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Recent Maintenance Requests</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Room A-104</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">AC dead in room A-104</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                    ASSIGNED
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">Technician: Suresh Kumar (HVAC/Electrical)</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs opacity-70">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AC tripping MCB circuit breaker</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                    RESOLVED
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('complaints')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <span>View All My Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Fee & Invoicing Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-violet-400" />
                <span>Hostel Fee Status</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Settled
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">₹72,000</span>
              <span className="text-xs text-slate-400">• Spring 2026 Semester</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Includes Room Rent (₹50k), Mess (₹18k), Amenities (₹4k)</p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-mono">Invoice: INV-2026-S1-001</p>
                <p className="text-emerald-400 font-semibold text-xs mt-0.5">Paid via UPI • No Due Balance</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>

          <button
            onClick={() => onNavigate('fees')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <span>View Fee Invoice & Download Receipt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

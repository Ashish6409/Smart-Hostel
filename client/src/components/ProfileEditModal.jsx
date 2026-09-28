import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Bed, 
  Hash, 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Shield
} from 'lucide-react';
import api from '../services/api';

export default function ProfileEditModal({ currentUser, isOpen, onClose, onProfileUpdated }) {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [roomNumber, setRoomNumber] = useState(currentUser?.roomNumber || '');
  const [rollNumber, setRollNumber] = useState(currentUser?.rollNumber || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lifestyle Preferences
  const [studySchedule, setStudySchedule] = useState(currentUser?.preference?.studySchedule || 'FLEXIBLE');
  const [sleepTime, setSleepTime] = useState(currentUser?.preference?.sleepTime || '23:00');
  const [cleanlinessLevel, setCleanlinessLevel] = useState(currentUser?.preference?.cleanlinessLevel || 4);
  const [noiseTolerance, setNoiseTolerance] = useState(currentUser?.preference?.noiseTolerance || 'MODERATE');
  const [acPreference, setAcPreference] = useState(Boolean(currentUser?.preference?.acPreference));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        roomNumber,
        rollNumber,
        preferences: {
          studySchedule,
          sleepTime,
          cleanlinessLevel: parseInt(cleanlinessLevel, 10),
          noiseTolerance,
          acPreference
        }
      });

      if (res.data.token) {
        localStorage.setItem('smart_hostel_token', res.data.token);
      }

      setSuccessMsg('Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(res.data.user);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c101c] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-[#0c101c] to-[#0c101c]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Edit Profile</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentUser?.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Update personal details and room preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="space-y-3.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email (System ID)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full bg-slate-900/60 border border-white/[0.04] text-slate-400 rounded-xl pl-9 pr-3 py-2 cursor-not-allowed font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Room Allotment</label>
                <div className="relative">
                  <Bed className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A-104"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {currentUser?.role === 'STUDENT' && (
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Roll / Student ID</label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. CS23B042"
                      className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: AI Roommate & Lifestyle Preferences */}
          {currentUser?.role === 'STUDENT' && (
            <div className="pt-4 border-t border-white/[0.06] space-y-3.5">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-xs">
                <Sliders className="w-4 h-4" />
                <span>Roommate Compatibility & Lifestyle Attributes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Study Habits</label>
                  <select
                    value={studySchedule}
                    onChange={(e) => setStudySchedule(e.target.value)}
                    className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NIGHT_OWL">Night Owl (Late study)</option>
                    <option value="EARLY_BIRD">Early Bird (Morning study)</option>
                    <option value="FLEXIBLE">Flexible Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Typical Bedtime</label>
                  <select
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="22:00">10:00 PM</option>
                    <option value="23:30">11:30 PM</option>
                    <option value="01:30">01:30 AM</option>
                    <option value="02:30">02:30 AM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Noise Tolerance</label>
                  <select
                    value={noiseTolerance}
                    onChange={(e) => setNoiseTolerance(e.target.value)}
                    className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="QUIET">Quiet & Serene</option>
                    <option value="MODERATE">Moderate Tolerance</option>
                    <option value="SOCIAL">Social & Collaborative</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Cleanliness Expectation:</span>
                    <span className="text-indigo-400 font-bold">{cleanlinessLevel} / 5 Stars</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={cleanlinessLevel}
                    onChange={(e) => setCleanlinessLevel(e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer mt-1.5"
                  />
                </div>

                <div className="sm:col-span-2 pt-1">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acPreference}
                      onChange={(e) => setAcPreference(e.target.checked)}
                      className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Requires Air Conditioned (AC) Room</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

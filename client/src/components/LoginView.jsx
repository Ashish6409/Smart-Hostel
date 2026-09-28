import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck, 
  Wrench, 
  UserCheck, 
  AlertCircle, 
  Sliders,
  CheckCircle2,
  Zap
} from 'lucide-react';
import api from '../services/api';

export default function LoginView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login Form State
  const [email, setEmail] = useState('rahul.sharma@hostel.edu');
  const [password, setPassword] = useState('hostel123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('hostel123');
  const [regRoll, setRegRoll] = useState('');
  const [regPreferences, setRegPreferences] = useState({
    studySchedule: 'NIGHT_OWL',
    sleepTime: '01:30',
    cleanlinessLevel: 4,
    noiseTolerance: 'MODERATE',
    acPreference: true,
    preferredFloor: 1
  });

  // Quick Demo Accounts
  const demoAccounts = [
    {
      role: 'Student',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@hostel.edu',
      desc: 'Resident A-104 • Full Access',
      icon: UserCheck,
      color: 'hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      role: 'Warden / Admin',
      name: 'Dr. Arthur Vance',
      email: 'admin@hostel.edu',
      desc: 'Operations & Allocation',
      icon: Building2,
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      role: 'Security Guard',
      name: 'Ramesh Singh',
      email: 'guard.ramesh@hostel.edu',
      desc: 'Gate Terminal & QR Scanner',
      icon: ShieldCheck,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      role: 'Technician',
      name: 'Suresh Kumar',
      email: 'tech.suresh@hostel.edu',
      desc: 'HVAC & Facility Maintenance',
      icon: Wrench,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      localStorage.setItem('smart_hostel_token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail) => {
    setEmail(accEmail);
    setPassword('hostel123');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: accEmail,
        password: 'hostel123'
      });

      localStorage.setItem('smart_hostel_token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrorMsg('Failed to authenticate with demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName || !regEmail) {
      setErrorMsg('Please enter your full name and valid email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: regName,
        email: regEmail.trim(),
        password: regPassword || 'hostel123',
        rollNumber: regRoll || `CS24B0${Math.floor(10 + Math.random() * 90)}`,
        preferences: regPreferences
      });

      localStorage.setItem('smart_hostel_token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] bg-mesh-pattern text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 sm:w-[550px] h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-600/30 mb-3">
          <Cpu className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-1.5">
          <span>SmartHostel</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black">OS</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Autonomous Campus Living & Predictive Intelligence
        </p>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="mt-6 flex items-center justify-center p-1 bg-slate-950/70 border border-white/[0.08] rounded-xl max-w-xs mx-auto backdrop-blur-md">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Student Register
          </button>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-[#0c101c]/80 backdrop-blur-xl py-8 px-6 sm:px-10 border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/80 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hostel Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@hostel.edu"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
                  <span>Demo password: <strong className="text-indigo-400 font-mono">hostel123</strong></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Instant Demo Login Cards */}
              <div className="pt-5 border-t border-white/[0.06]">
                <div className="flex items-center justify-center space-x-1.5 mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant 1-Click Demo Login
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {demoAccounts.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleQuickLogin(acc.email)}
                        className={`p-3 rounded-2xl bg-slate-950/60 border text-left transition-all flex flex-col justify-between ${acc.color} group cursor-pointer`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                          <span className="font-bold text-xs text-slate-200 group-hover:text-white truncate">
                            {acc.role}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-[11px] text-slate-300 font-medium truncate">{acc.name}</p>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{acc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            /* MODE 2: NEW STUDENT REGISTRATION */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={regRoll}
                    onChange={(e) => setRegRoll(e.target.value)}
                    placeholder="e.g. CS24B099"
                    className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="vikram.singh@hostel.edu"
                  className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  placeholder="hostel123"
                />
              </div>

              {/* Lifestyle Preferences for Allocation Engine */}
              <div className="pt-3 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Lifestyle Profile (AI Compatibility Engine)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Study Habits</label>
                    <select
                      value={regPreferences.studySchedule}
                      onChange={(e) => setRegPreferences({ ...regPreferences, studySchedule: e.target.value })}
                      className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="NIGHT_OWL">Night Owl (Late study)</option>
                      <option value="EARLY_BIRD">Early Bird (Morning study)</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Typical Bedtime</label>
                    <select
                      value={regPreferences.sleepTime}
                      onChange={(e) => setRegPreferences({ ...regPreferences, sleepTime: e.target.value })}
                      className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="22:00">10:00 PM</option>
                      <option value="23:30">11:30 PM</option>
                      <option value="01:30">01:30 AM</option>
                      <option value="02:30">02:30 AM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Cleanliness Expectation:</span>
                    <span className="text-indigo-400 font-bold">{regPreferences.cleanlinessLevel} / 5 Stars</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={regPreferences.cleanlinessLevel}
                    onChange={(e) => setRegPreferences({ ...regPreferences, cleanlinessLevel: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regPreferences.acPreference}
                      onChange={(e) => setRegPreferences({ ...regPreferences, acPreference: e.target.checked })}
                      className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Requires AC Room</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Account & Run AI Match</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

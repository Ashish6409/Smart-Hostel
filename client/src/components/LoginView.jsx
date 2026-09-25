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
  Sliders
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
      desc: 'Resident of A-104 (AC issue)',
      icon: UserCheck,
      color: 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/10'
    },
    {
      role: 'Warden / Admin',
      name: 'Dr. Arthur Vance',
      email: 'admin@hostel.edu',
      desc: 'Chief Warden & Ops Manager',
      icon: Building2,
      color: 'border-purple-500/40 text-purple-300 hover:bg-purple-600/10'
    },
    {
      role: 'Security',
      name: 'Ramesh Singh',
      email: 'guard.ramesh@hostel.edu',
      desc: 'Main Gate QR Terminal',
      icon: ShieldCheck,
      color: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/10'
    },
    {
      role: 'Technician',
      name: 'Suresh Kumar',
      email: 'tech.suresh@hostel.edu',
      desc: 'HVAC & Electrical Specialist',
      icon: Wrench,
      color: 'border-amber-500/40 text-amber-300 hover:bg-amber-600/10'
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
      setErrorMsg('Failed to log in with demo account.');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Background glowing ambient effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-600/30 mb-4">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SmartHostel<span className="text-indigo-400">OS</span>
        </h1>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          Autonomous Hostel Campus Operating System & AI Decision Engine
        </p>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="mt-6 flex items-center justify-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`w-1/2 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`w-1/2 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Student Register
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 border border-slate-800 rounded-3xl shadow-2xl shadow-black/60 space-y-6">
          
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
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@hostel.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                  <span>Default demo password: <strong className="text-indigo-400 font-mono">hostel123</strong></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
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

              {/* Quick 1-Click Role Presets */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Instant 1-Click Demo Login
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleQuickLogin(acc.email)}
                        className={`p-2.5 rounded-xl bg-slate-950/70 border text-left transition-all ${acc.color} flex items-start space-x-2`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs truncate text-slate-200">{acc.role}</p>
                          <p className="text-[10px] text-slate-400 truncate">{acc.name}</p>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={regRoll}
                    onChange={(e) => setRegRoll(e.target.value)}
                    placeholder="e.g. CS24B099"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="hostel123"
                />
              </div>

              {/* Lifestyle Preferences for Room Allocation */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Lifestyle Profile (For Room Allocation Engine)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Study Habits</label>
                    <select
                      value={regPreferences.studySchedule}
                      onChange={(e) => setRegPreferences({ ...regPreferences, studySchedule: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="NIGHT_OWL">Night Owl</option>
                      <option value="EARLY_BIRD">Early Bird</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bedtime</label>
                    <select
                      value={regPreferences.sleepTime}
                      onChange={(e) => setRegPreferences({ ...regPreferences, sleepTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="22:00">10:00 PM</option>
                      <option value="23:30">11:30 PM</option>
                      <option value="01:30">01:30 AM</option>
                      <option value="02:30">02:30 AM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Cleanliness Standard: {regPreferences.cleanlinessLevel}/5 Stars
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={regPreferences.cleanlinessLevel}
                    onChange={(e) => setRegPreferences({ ...regPreferences, cleanlinessLevel: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regPreferences.acPreference}
                      onChange={(e) => setRegPreferences({ ...regPreferences, acPreference: e.target.checked })}
                      className="rounded accent-indigo-500"
                    />
                    <span>Requires AC Room</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Account & Initialize Match</span>
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

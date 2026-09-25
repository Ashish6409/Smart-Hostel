import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  Cpu, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({ currentUser, onSwitchRole, onLogout }) {
  const roles = [
    { id: 'STUDENT', label: 'Student', name: 'Rahul (A-104)', icon: UserCheck, color: 'hover:bg-indigo-600/20 text-indigo-400' },
    { id: 'WARDEN', label: 'Warden / Admin', name: 'Dr. Arthur Vance', icon: Building2, color: 'hover:bg-purple-600/20 text-purple-400' },
    { id: 'SECURITY', label: 'Security Guard', name: 'Ramesh Singh', icon: ShieldCheck, color: 'hover:bg-emerald-600/20 text-emerald-400' },
    { id: 'STAFF', label: 'Technician', name: 'Suresh (HVAC/Elec)', icon: Wrench, color: 'hover:bg-amber-600/20 text-amber-400' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SmartHostel<span className="text-indigo-400">OS</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Engines Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Next-Gen Intelligent Hostel Campus Management</p>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">Role:</span>
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentUser?.role === r.id || (r.id === 'WARDEN' && currentUser?.role === 'ADMIN');
              return (
                <button
                  key={r.id}
                  onClick={() => onSwitchRole(r.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800'
                  }`}
                  title={`Switch to ${r.name}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Badge & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-200">{currentUser?.name || 'Guest'}</p>
              <p className="text-xs text-indigo-400 font-mono">
                {currentUser?.role} {currentUser?.roomNumber ? `• Room ${currentUser.roomNumber}` : ''}
              </p>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-300">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 transition-all"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

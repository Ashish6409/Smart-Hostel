import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  LayoutDashboard, 
  Bed, 
  AlertTriangle, 
  Utensils, 
  ShieldCheck, 
  CreditCard, 
  Wrench, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  Home, 
  QrCode,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function Sidebar({ currentUser, activeTab, onSelectTab, onSwitchRole, onLogout }) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const demoRoles = [
    { id: 'STUDENT', label: 'Student', name: 'Rahul Sharma', sub: 'Room A-104' },
    { id: 'WARDEN', label: 'Warden / Admin', name: 'Dr. Arthur Vance', sub: 'Chief Warden' },
    { id: 'SECURITY', label: 'Security Guard', name: 'Ramesh Singh', sub: 'Main Gate' },
    { id: 'STAFF', label: 'Technician', name: 'Suresh Kumar', sub: 'HVAC & Electrical' }
  ];

  // Role-specific navigation items
  const getNavItems = () => {
    const role = currentUser?.role;

    if (role === 'STUDENT') {
      return [
        { id: 'student-hub', label: 'My Hub', icon: Home, badge: 'Home' },
        { id: 'rooms', label: 'My Room Allotment', icon: Bed, badge: 'Allotment' },
        { id: 'complaints', label: 'Report Issue (AI)', icon: AlertTriangle },
        { id: 'mess', label: 'Mess & Leave Pass', icon: Utensils },
        { id: 'security', label: 'Visitor QR Pass', icon: QrCode },
        { id: 'fees', label: 'Hostel Fees', icon: CreditCard }
      ];
    }

    if (role === 'SECURITY') {
      return [
        { id: 'security', label: 'Gate Scanner & Visitors', icon: ShieldCheck, badge: 'Live Gate' }
      ];
    }

    if (role === 'STAFF') {
      return [
        { id: 'staff-hub', label: 'My Work Orders', icon: Wrench, badge: 'Assigned' },
        { id: 'maintenance', label: 'Predictive Alerts', icon: Activity }
      ];
    }

    // Default for ADMIN & WARDEN
    return [
      { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
      { id: 'rooms', label: '⚡ Allocate Rooms & Residents', icon: Bed, badge: 'Allocate' },
      { id: 'maintenance', label: 'Predictive Maintenance', icon: Activity, badge: '2 Alerts' },
      { id: 'complaints', label: 'Complaint Management', icon: AlertTriangle },
      { id: 'mess', label: 'Mess Demand ML', icon: Utensils },
      { id: 'security', label: 'Gate Security & QR', icon: ShieldCheck },
      { id: 'fees', label: 'Fee Ledger', icon: CreditCard }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">SmartHostel</span>
              <span className="text-indigo-400 font-bold text-sm">OS</span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Living Platform</p>
          </div>
        </div>

        {/* Clean Role Switcher Dropdown */}
        <div className="mt-4 relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="w-full p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-left transition-all text-xs"
          >
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Viewing As</p>
              <p className="font-bold text-slate-200 truncate mt-0.5">
                {currentUser?.role === 'STUDENT' ? '🎓 Student' :
                 currentUser?.role === 'SECURITY' ? '🛡️ Security Guard' :
                 currentUser?.role === 'STAFF' ? '🔧 Technician' : '🏛️ Warden / Admin'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
              {demoRoles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSwitchRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full p-2 text-left rounded-lg text-xs transition-all flex flex-col ${
                    currentUser?.role === r.id || (r.id === 'WARDEN' && currentUser?.role === 'ADMIN')
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-[10px] opacity-75">{r.name} ({r.sub})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {currentUser?.roomNumber ? `Room ${currentUser.roomNumber}` : currentUser?.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

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
  Activity,
  X
} from 'lucide-react';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  onSelectTab, 
  onSwitchRole, 
  onLogout,
  mobileOpen = false,
  onCloseMobile = () => {}
}) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const demoRoles = [
    { id: 'STUDENT', label: 'Student', name: 'Rahul Sharma', sub: 'Room A-104', icon: Home, color: 'text-indigo-400' },
    { id: 'WARDEN', label: 'Warden / Admin', name: 'Dr. Arthur Vance', sub: 'Chief Warden', icon: Building2, color: 'text-purple-400' },
    { id: 'SECURITY', label: 'Security Guard', name: 'Ramesh Singh', sub: 'Main Gate', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'STAFF', label: 'Technician', name: 'Suresh Kumar', sub: 'HVAC & Electrical', icon: Wrench, color: 'text-amber-400' }
  ];

  // Role-specific navigation items
  const getNavItems = () => {
    const role = currentUser?.role;

    if (role === 'STUDENT') {
      return [
        { id: 'student-hub', label: 'My Hub', icon: Home, badge: 'Home' },
        { id: 'rooms', label: 'Room Allotment', icon: Bed, badge: 'Allotment' },
        { id: 'complaints', label: 'Report Issue (AI)', icon: AlertTriangle },
        { id: 'mess', label: 'Mess & Leave Pass', icon: Utensils },
        { id: 'security', label: 'Visitor QR Pass', icon: QrCode },
        { id: 'fees', label: 'Hostel Fees', icon: CreditCard }
      ];
    }

    if (role === 'SECURITY') {
      return [
        { id: 'security', label: 'Gate Scanner & QR', icon: ShieldCheck, badge: 'Live Gate' }
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
      { id: 'rooms', label: 'Room Allocation & AI', icon: Bed, badge: 'Auto' },
      { id: 'maintenance', label: 'Predictive Maintenance', icon: Activity, badge: 'AI Alerts' },
      { id: 'complaints', label: 'Complaint Management', icon: AlertTriangle },
      { id: 'mess', label: 'Mess Demand ML', icon: Utensils },
      { id: 'security', label: 'Gate Security & QR', icon: ShieldCheck },
      { id: 'fees', label: 'Fee Invoicing Ledger', icon: CreditCard }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-[#0c101c]/95 md:bg-[#0c101c]/90 backdrop-blur-xl border-r border-white/[0.07] flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">SmartHostel</span>
                  <span className="text-indigo-400 font-bold text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">OS</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Campus Living Engine</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Role Switcher Dropdown */}
          <div className="mt-4 relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-white/[0.08] hover:border-indigo-500/40 rounded-xl flex items-center justify-between text-left transition-all text-xs group"
            >
              <div className="overflow-hidden">
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Active Workspace</p>
                <p className="font-semibold text-slate-200 truncate mt-0.5 group-hover:text-white transition-colors">
                  {currentUser?.role === 'STUDENT' ? '🎓 Student Portal' :
                   currentUser?.role === 'SECURITY' ? '🛡️ Gate Security' :
                   currentUser?.role === 'STAFF' ? '🔧 Facility Tech' : '🏛️ Warden Executive'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${roleDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>

            {roleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f1422] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/80 z-50 p-1.5 space-y-1 backdrop-blur-xl animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Switch Demo Persona
                </div>
                {demoRoles.map((r) => {
                  const RoleIcon = r.icon;
                  const isCurrent = currentUser?.role === r.id || (r.id === 'WARDEN' && currentUser?.role === 'ADMIN');
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSwitchRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full p-2 text-left rounded-xl text-xs transition-all flex items-center space-x-2.5 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <RoleIcon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : r.color}`} />
                      <div className="overflow-hidden">
                        <div className="font-semibold truncate">{r.label}</div>
                        <div className={`text-[10px] truncate ${isCurrent ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {r.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-600/5 text-indigo-300 border border-indigo-500/30 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-1 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.04]'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive 
                      ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/30' 
                      : 'bg-slate-800/80 text-slate-400 border border-white/[0.04]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/[0.06]">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {currentUser?.roomNumber ? `Room ${currentUser.roomNumber}` : currentUser?.role}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

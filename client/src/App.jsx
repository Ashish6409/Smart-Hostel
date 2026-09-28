import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import StudentHub from './components/StudentHub';
import StaffHub from './components/StaffHub';
import OverviewView from './components/OverviewView';
import RoomAllocationView from './components/RoomAllocationView';
import ComplaintView from './components/ComplaintView';
import MessDemandView from './components/MessDemandView';
import PredictiveMaintenanceView from './components/PredictiveMaintenanceView';
import SecurityView from './components/SecurityView';
import FeeManagementView from './components/FeeManagementView';
import HostelAssistantWidget from './components/HostelAssistantWidget';
import api from './services/api';
import { 
  Menu, 
  X, 
  Sparkles, 
  Bell, 
  LogOut, 
  User, 
  ChevronRight,
  Shield,
  Activity,
  Layers
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('student-hub');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  const getDefaultTabForRole = (role) => {
    if (role === 'STUDENT') return 'student-hub';
    if (role === 'SECURITY') return 'security';
    if (role === 'STAFF') return 'staff-hub';
    return 'overview'; // ADMIN / WARDEN
  };

  const initAuth = async () => {
    const token = localStorage.getItem('smart_hostel_token');
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data.user);
      setActiveTab(getDefaultTabForRole(res.data.user?.role));
    } catch (err) {
      localStorage.removeItem('smart_hostel_token');
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab(getDefaultTabForRole(user?.role));
  };

  const handleSwitchRole = async (role) => {
    try {
      const res = await api.post('/auth/switch-demo-role', { role });
      localStorage.setItem('smart_hostel_token', res.data.token);
      setCurrentUser(res.data.user);
      setActiveTab(getDefaultTabForRole(res.data.user?.role));
    } catch (err) {
      alert('Error switching demo role');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_hostel_token');
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-ping" />
          </div>
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Loading SmartHostel OS...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Clean, Modern Login/Registration
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] bg-mesh-pattern text-slate-100 flex flex-col md:flex-row antialiased relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-sky-500/08 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Role-Filtered Clean Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Sleek Top Navigation Bar */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0c101c]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left: Mobile Trigger & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-400 hover:text-slate-300">SmartHostel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-bold text-white capitalize bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right: Quick Role Switcher & User Profile Pill */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher Pills */}
            <div className="hidden lg:flex items-center bg-slate-950/70 p-1 rounded-xl border border-white/[0.06] space-x-1 text-[11px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Role:</span>
              {[
                { id: 'STUDENT', label: '🎓 Student', role: 'STUDENT' },
                { id: 'WARDEN', label: '🏛️ Warden', role: 'WARDEN' },
                { id: 'STAFF', label: '🔧 Tech', role: 'STAFF' },
                { id: 'SECURITY', label: '🛡️ Guard', role: 'SECURITY' }
              ].map((r) => {
                const isCurrent = currentUser?.role === r.role || (r.role === 'WARDEN' && currentUser?.role === 'ADMIN');
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSwitchRole(r.role)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Live Operational Status Badge */}
            <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              <span>PostgreSQL & ML Online</span>
            </div>

            {/* User Greeting & Quick Profile */}
            <div className="flex items-center space-x-2 pl-2 border-l border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-600/20">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-slate-200 leading-tight truncate max-w-[130px]">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 font-mono leading-tight">{currentUser?.role}</p>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Screen View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {activeTab === 'student-hub' && (
            <StudentHub currentUser={currentUser} onNavigate={setActiveTab} />
          )}

          {activeTab === 'staff-hub' && (
            <StaffHub currentUser={currentUser} />
          )}

          {activeTab === 'overview' && (
            <OverviewView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'rooms' && (
            <RoomAllocationView currentUser={currentUser} onSwitchRole={handleSwitchRole} />
          )}

          {activeTab === 'complaints' && (
            <ComplaintView currentUser={currentUser} />
          )}

          {activeTab === 'mess' && (
            <MessDemandView currentUser={currentUser} />
          )}

          {activeTab === 'maintenance' && (
            <PredictiveMaintenanceView currentUser={currentUser} />
          )}

          {activeTab === 'security' && (
            <SecurityView currentUser={currentUser} />
          )}

          {activeTab === 'fees' && (
            <FeeManagementView currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Floating AI Hostel Assistant Widget */}
      <HostelAssistantWidget currentUser={currentUser} />
    </div>
  );
}

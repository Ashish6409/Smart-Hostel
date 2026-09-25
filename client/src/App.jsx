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
import api from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('student-hub');
  const [checkingAuth, setCheckingAuth] = useState(true);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Starting SmartHostel OS...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Clean Login/Registration
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Role-Filtered Clean Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Subtle Top Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>Portal</span>
            <span>/</span>
            <span className="text-white font-bold capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Connected
            </span>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fadeIn">
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
    </div>
  );
}

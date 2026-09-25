import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  UserPlus, 
  LogIn, 
  LogOut, 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  Search,
  Users
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

export default function SecurityView({ currentUser }) {
  const isSecurityOrAdmin = currentUser?.role === 'SECURITY' || currentUser?.role === 'ADMIN' || currentUser?.role === 'WARDEN';

  // Student Pass Request State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [passes, setPasses] = useState([]);
  const [selectedPassForQR, setSelectedPassForQR] = useState(null);

  // Security Guard State
  const [passCodeInput, setPassCodeInput] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);

  useEffect(() => {
    if (isSecurityOrAdmin) {
      fetchActiveVisitors();
    } else {
      fetchPasses();
    }
  }, [isSecurityOrAdmin]);

  const fetchPasses = async () => {
    try {
      const res = await api.get('/visitors/all');
      setPasses(res.data.passes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveVisitors = async () => {
    setLoadingActive(true);
    try {
      const res = await api.get('/visitors/active');
      setActiveVisitors(res.data.visitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleRequestPass = async (e) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;

    try {
      const res = await api.post('/visitors/request', {
        visitorName,
        visitorPhone,
        purpose: purpose || 'Family / Academic Visit',
        targetStudentId: currentUser?.id
      });
      alert(`Visitor pass generated! Code: ${res.data.passCode}`);
      setVisitorName('');
      setVisitorPhone('');
      setPurpose('');
      fetchPasses();
      setSelectedPassForQR(res.data.pass);
    } catch (err) {
      alert('Failed to create pass');
    }
  };

  const handleVerifyCode = async (codeToVerify) => {
    const code = codeToVerify || passCodeInput;
    if (!code) return;

    try {
      const res = await api.get(`/visitors/verify?passCode=${code.trim()}`);
      setVerifiedPass(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid or expired pass');
      setVerifiedPass(null);
    }
  };

  const handleCheckIn = async (passCode) => {
    try {
      await api.post('/visitors/check-in', { passCode });
      alert(`Checked in! Entry timestamp logged.`);
      setVerifiedPass(null);
      setPassCodeInput('');
      fetchActiveVisitors();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async (passCode) => {
    try {
      await api.post('/visitors/check-out', { passCode });
      alert(`Checked out! Exit timestamp logged.`);
      setVerifiedPass(null);
      setPassCodeInput('');
      fetchActiveVisitors();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Access Control</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">
          {isSecurityOrAdmin ? 'Gate Guard Terminal & Active Visitors' : 'My Guest Visitor Passes'}
        </h1>
        <p className="text-xs text-slate-400">
          {isSecurityOrAdmin 
            ? 'Scan incoming visitor QR passes, record entry/exit stamps, and monitor on-campus overstays.'
            : 'Pre-register visiting guests to issue a digital QR pass for gate clearance.'}
        </p>
      </div>

      {/* STUDENT PASS SECTION */}
      {!isSecurityOrAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Issue Guest Pass</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter your guest's info. A secure QR pass will be generated instantly.
            </p>

            <form onSubmit={handleRequestPass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Sunil Sharma (Father)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+91 98111 22334"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Academic discussion, Family visit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate QR Pass</span>
              </button>
            </form>
          </div>

          {/* Pass History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">My Active & Recent Passes</h2>
              <span className="text-xs text-slate-400 font-mono">{passes.length} passes</span>
            </div>

            <div className="space-y-3">
              {passes.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                  No visitor passes issued yet. Fill out the form to create your first pass.
                </div>
              ) : (
                passes.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{p.visitorName}</span>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {p.passCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'CHECKED_IN' ? 'bg-purple-500/20 text-purple-300' :
                          p.status === 'CHECKED_OUT' ? 'bg-slate-700 text-slate-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Phone: {p.visitorPhone} • Purpose: {p.purpose}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPassForQR(p)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View QR Pass</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SECURITY GUARD TERMINAL */
        <div className="space-y-6">
          {/* Quick Scanner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Gate Barcode / Pass Token Verification</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter visitor's pass code to stamp entry or exit.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={passCodeInput}
                onChange={(e) => setPassCodeInput(e.target.value)}
                placeholder="Enter Pass Code (e.g. VP-882194, VP-QR9910, VP-OVERSTAY)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleVerifyCode()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Verify Token</span>
              </button>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">Quick Test:</span>
              <button 
                onClick={() => { setPassCodeInput('VP-QR9910'); handleVerifyCode('VP-QR9910'); }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[11px]"
              >
                VP-QR9910 (Approved)
              </button>
              <button 
                onClick={() => { setPassCodeInput('VP-882194'); handleVerifyCode('VP-882194'); }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-mono text-[11px]"
              >
                VP-882194 (Inside)
              </button>
              <button 
                onClick={() => { setPassCodeInput('VP-OVERSTAY'); handleVerifyCode('VP-OVERSTAY'); }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono text-[11px]"
              >
                VP-OVERSTAY (Overstay!)
              </button>
            </div>

            {/* Verification Result Card */}
            {verifiedPass && (
              <div className="mt-5 p-5 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-white">{verifiedPass.pass.visitorName}</span>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {verifiedPass.pass.passCode}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      verifiedPass.isOverstay ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {verifiedPass.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Visiting: <strong className="text-white">{verifiedPass.pass.student?.name}</strong> (Room {verifiedPass.pass.student?.roomNumber})
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Purpose: {verifiedPass.pass.purpose} • Phone: {verifiedPass.pass.visitorPhone}
                </p>

                {verifiedPass.isOverstay && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center space-x-2 font-semibold">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>⚠️ Security Alert: Visitor exceeded permitted departure time!</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  {verifiedPass.pass.status === 'APPROVED' && (
                    <button
                      onClick={() => handleCheckIn(verifiedPass.pass.passCode)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Stamp Entry (Check-In)</span>
                    </button>
                  )}

                  {verifiedPass.pass.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleCheckOut(verifiedPass.pass.passCode)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Stamp Exit (Check-Out)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Visitors Live Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Active Visitors On Campus ({activeVisitors.length})</span>
                </h2>
                <p className="text-xs text-slate-400">Live roster with overstay warnings</p>
              </div>
            </div>

            {loadingActive ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading active roster...</div>
            ) : activeVisitors.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
                No external visitors currently checked in inside the hostel.
              </div>
            ) : (
              <div className="space-y-3">
                {activeVisitors.map((v) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      v.isOverstay ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{v.visitorName}</span>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {v.passCode}
                        </span>
                        {v.isOverstay && (
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            ⚠️ OVERSTAY
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1">
                        Visiting: <strong>{v.student?.name}</strong> (Room {v.student?.roomNumber})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Checked In: {new Date(v.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({v.minutesInside} mins ago)
                      </p>
                    </div>

                    <button
                      onClick={() => handleCheckOut(v.passCode)}
                      className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Check-Out Exit</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedPassForQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-indigo-400 font-bold">DIGITAL VISITOR PASS</span>
              <button 
                onClick={() => setSelectedPassForQR(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <QRCodeSVG 
                value={`SMART-HOSTEL-PASS:${selectedPassForQR.passCode}`} 
                size={180}
                level="H"
              />
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base">{selectedPassForQR.visitorName}</h3>
              <p className="text-xs font-mono text-indigo-400 mt-0.5 font-bold">{selectedPassForQR.passCode}</p>
              <p className="text-xs text-slate-400 mt-2">
                Host: {selectedPassForQR.student?.name} (Room {selectedPassForQR.student?.roomNumber})
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Show this QR pass at the security gate for automated check-in.
              </p>
            </div>

            <button
              onClick={() => setSelectedPassForQR(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

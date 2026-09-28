import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Camera,
  CameraOff,
  RefreshCw,
  Compass,
  ArrowRight,
  AlertTriangle,
  Calendar,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

export default function SecurityView({ currentUser }) {
  const isSecurityOrAdmin = currentUser?.role === 'SECURITY' || currentUser?.role === 'ADMIN' || currentUser?.role === 'WARDEN';

  // Student Pass Form State
  const [passCategory, setPassCategory] = useState('STUDENT_OUTING'); // 'STUDENT_OUTING' or 'GUEST_VISITOR'
  const [outingType, setOutingType] = useState('DAY_OUTING'); // 'DAY_OUTING', 'NIGHT_OUT', 'WEEKEND_LEAVE', 'EMERGENCY_MEDICAL'
  const [destination, setDestination] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Guest Pass Form State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('');

  // Passes & Active Data
  const [passes, setPasses] = useState([]);
  const [selectedPassForQR, setSelectedPassForQR] = useState(null);
  const [loadingPasses, setLoadingPasses] = useState(false);

  // Security Guard Terminal State
  const [passCodeInput, setPassCodeInput] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [stampingAction, setStampingAction] = useState(false);
  const [activeRoster, setActiveRoster] = useState({
    studentsOutside: [],
    visitorsInside: [],
    activeVisitorsCount: 0,
    studentsOutsideCount: 0,
    overstayCount: 0
  });
  const [rosterTab, setRosterTab] = useState('students'); // 'students' or 'visitors'
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Live Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const qrScannerRef = useRef(null);

  useEffect(() => {
    if (isSecurityOrAdmin) {
      fetchGateRoster();
    } else {
      fetchPasses();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isSecurityOrAdmin]);

  // Set default return curfew time for student (today 9:30 PM)
  useEffect(() => {
    const today = new Date();
    today.setHours(21, 30, 0, 0);
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - tzOffset)).toISOString().slice(0, 16);
    setExpectedReturnTime(localISOTime);
  }, []);

  const fetchPasses = async () => {
    setLoadingPasses(true);
    try {
      const res = await api.get('/visitors/all');
      setPasses(res.data.passes || []);
    } catch (err) {
      console.error('Failed to fetch passes:', err);
    } finally {
      setLoadingPasses(false);
    }
  };

  const fetchGateRoster = async () => {
    setLoadingRoster(true);
    try {
      const res = await api.get('/visitors/active');
      setActiveRoster({
        studentsOutside: res.data.studentsOutside || [],
        visitorsInside: res.data.visitorsInside || res.data.visitors || [],
        activeVisitorsCount: res.data.activeVisitorsCount || 0,
        studentsOutsideCount: res.data.studentsOutsideCount || 0,
        overstayCount: res.data.overstayCount || 0
      });
    } catch (err) {
      console.error('Failed to fetch gate roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Student Pass Creation
  const handleCreatePass = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        passType: passCategory,
        targetStudentId: currentUser?.id
      };

      if (passCategory === 'STUDENT_OUTING') {
        if (!destination) {
          alert('Please enter your outing destination or reason');
          return;
        }
        payload.outingType = outingType;
        payload.destination = destination;
        payload.visitorPhone = emergencyPhone || currentUser?.phone || '9876543210';
        payload.expectedDeparture = expectedReturnTime ? new Date(expectedReturnTime).toISOString() : undefined;
      } else {
        if (!visitorName || !visitorPhone) {
          alert('Please enter visitor name and phone number');
          return;
        }
        payload.visitorName = visitorName;
        payload.visitorPhone = visitorPhone;
        payload.purpose = guestPurpose || 'Family / Academic Visit';
      }

      const res = await api.post('/visitors/request', payload);
      alert(`✅ Pass generated successfully! Pass Code: ${res.data.passCode}`);

      // Reset form
      setDestination('');
      setVisitorName('');
      setVisitorPhone('');
      setGuestPurpose('');
      fetchPasses();

      // Automatically open QR modal
      setSelectedPassForQR(res.data.pass);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate pass');
    }
  };

  // Security Verification
  const handleVerifyCode = async (codeToVerify) => {
    let code = (codeToVerify || passCodeInput).trim();
    if (!code) return;

    // Check if JSON QR string
    if (code.startsWith('{') && code.endsWith('}')) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.passCode) code = parsed.passCode;
      } catch (e) {
        // ignore
      }
    }

    setVerifying(true);
    try {
      const res = await api.get(`/visitors/verify?passCode=${encodeURIComponent(code)}`);
      setVerifiedPass(res.data);
      setPassCodeInput(code);
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid or expired QR pass.');
      setVerifiedPass(null);
    } finally {
      setVerifying(false);
    }
  };

  // Stamp Gate Action (EXIT or ENTRY)
  const handleStampGate = async (action) => {
    if (!verifiedPass?.pass?.passCode) return;

    setStampingAction(true);
    try {
      const res = await api.post('/visitors/stamp-gate', {
        passCode: verifiedPass.pass.passCode,
        action
      });

      if (res.data.isLate) {
        alert(`⚠️ Action Logged! Note: Student returned ${res.data.minutesLate} minutes late past the permitted curfew. Incident recorded for Warden.`);
      } else {
        alert(`✅ Gate ${action === 'EXIT' ? 'Exit' : 'Entry'} successfully stamped!`);
      }

      setVerifiedPass(null);
      setPassCodeInput('');
      fetchGateRoster();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to stamp gate action');
    } finally {
      setStampingAction(false);
    }
  };

  // Camera Scanner Functions
  const startCameraScanner = async () => {
    setCameraError('');
    setCameraActive(true);

    // Give DOM time to render #qr-reader
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        qrScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Success
            handleVerifyCode(decodedText);
            stopCameraScanner();
          },
          (errorMessage) => {
            // Scanning frame parse failure - normal while scanning
          }
        );
      } catch (err) {
        console.error('Camera init error:', err);
        setCameraError('Could not access camera. Please allow camera permissions or enter the code manually.');
        setCameraActive(false);
      }
    }, 200);
  };

  const stopCameraScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().then(() => {
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }).catch(() => {
        qrScannerRef.current = null;
      });
    }
    setCameraActive(false);
  };

  // Format QR Code Payload for Student Pass
  const getQRPayload = (pass) => {
    return JSON.stringify({
      passCode: pass.passCode,
      type: pass.passCode.startsWith('EP-') ? 'STUDENT_OUTING' : 'GUEST_VISIT',
      studentName: pass.student?.name,
      rollNumber: pass.student?.rollNumber,
      roomNumber: pass.student?.roomNumber,
      curfew: pass.expectedDeparture,
      status: pass.status
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Gate & Movement Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSecurityOrAdmin ? 'Security Gate Guard Terminal' : 'Student Digital Entry & Exit Passes'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isSecurityOrAdmin 
              ? 'Real-time QR barcode scanner, student outing timestamps, curfew validation, and campus visitor roster.'
              : 'Generate secure digital QR passes for outings, leave requests, and guest visitor entry.'}
          </p>
        </div>

        {isSecurityOrAdmin && (
          <button
            onClick={fetchGateRoster}
            disabled={loadingRoster}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRoster ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Sync Live Roster</span>
          </button>
        )}
      </div>

      {/* ========================================================
          VIEW 1: STUDENT RESIDENT PASS MANAGEMENT
      ======================================================== */}
      {!isSecurityOrAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pass Generator Form */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Generate Gate Pass</h2>
                  <p className="text-xs text-slate-400">Instant digital QR pass for gate clearance</p>
                </div>
              </div>

              {/* Pass Category Selector */}
              <div className="flex p-1 bg-[#080c16] rounded-xl border border-white/[0.08] mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPassCategory('STUDENT_OUTING')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    passCategory === 'STUDENT_OUTING' 
                      ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  My Outing Pass
                </button>
                <button
                  type="button"
                  onClick={() => setPassCategory('GUEST_VISITOR')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    passCategory === 'GUEST_VISITOR' 
                      ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Guest Visitor
                </button>
              </div>

              <form onSubmit={handleCreatePass} className="space-y-3.5 text-xs">
                {passCategory === 'STUDENT_OUTING' ? (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Outing Type</label>
                      <select
                        value={outingType}
                        onChange={(e) => setOutingType(e.target.value)}
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="DAY_OUTING">Day Outing (City / Shopping / Library)</option>
                        <option value="NIGHT_OUT">Night Out (Pre-approved)</option>
                        <option value="WEEKEND_LEAVE">Weekend Home Visit</option>
                        <option value="EMERGENCY_MEDICAL">Medical / Emergency Clinic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Destination & Purpose</label>
                      <input
                        type="text"
                        required
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Phoenix Mall, City Library"
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Expected Return Curfew</label>
                      <input
                        type="datetime-local"
                        required
                        value={expectedReturnTime}
                        onChange={(e) => setExpectedReturnTime(e.target.value)}
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Campus curfew is 09:30 PM tonight.</span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Emergency Phone (Optional)</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Guest Full Name</label>
                      <input
                        type="text"
                        required
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Sunil Sharma (Father)"
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Guest Phone Number</label>
                      <input
                        type="text"
                        required
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Visit Purpose</label>
                      <input
                        type="text"
                        value={guestPurpose}
                        onChange={(e) => setGuestPurpose(e.target.value)}
                        placeholder="e.g. Parents visit, Academic materials"
                        className="w-full bg-[#080c16] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Issue {passCategory === 'STUDENT_OUTING' ? 'Outing Pass' : 'Visitor Pass'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Passes Roster */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>My Issued QR Passes</span>
                <span className="text-xs font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.06]">
                  {passes.length}
                </span>
              </h2>
            </div>

            {loadingPasses ? (
              <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs">
                Loading your passes...
              </div>
            ) : passes.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-2">
                <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active passes. Use the form to generate your entry/exit QR pass.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {passes.map((p) => {
                  const isStudent = p.passCode.startsWith('EP-');
                  const isCheckedOut = p.status === 'CHECKED_OUT';
                  const isCheckedIn = p.status === 'CHECKED_IN';
                  
                  return (
                    <div
                      key={p.id}
                      className="glass-panel card-hover rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isStudent 
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}>
                            {isStudent ? 'STUDENT OUTING' : 'GUEST VISITOR'}
                          </span>

                          <span className="font-mono font-bold text-white text-xs">
                            {p.passCode}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCheckedOut ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            isCheckedIn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {isCheckedOut ? 'OUTSIDE CAMPUS' : isCheckedIn ? 'RETURNED & COMPLETED' : 'READY AT GATE'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 font-medium">
                          {p.visitorName} • <span className="text-slate-400">{p.purpose}</span>
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                          <span>Return Curfew: <strong className="text-slate-300 font-mono">{new Date(p.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                          {p.actualCheckOut && (
                            <span>Left: <strong className="text-slate-300 font-mono">{new Date(p.actualCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPassForQR(p)}
                        className="px-3.5 py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Show QR Pass</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
            VIEW 2: SECURITY GUARD SCANNER TERMINAL
        ======================================================== */
        <div className="space-y-6">
          {/* KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Students Outside</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{activeRoster.studentsOutsideCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Currently out of campus</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Compass className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visitors Inside</p>
                <p className="text-2xl font-black text-purple-400 mt-1">{activeRoster.activeVisitorsCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active checked-in guests</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Curfew / Overstay Flags</p>
                <p className={`text-2xl font-black mt-1 ${activeRoster.overstayCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeRoster.overstayCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Late return / overstay alerts</p>
              </div>
              <div className={`p-3 rounded-2xl ${activeRoster.overstayCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <AlertOctagon className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Scanner & Manual Verification Module */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Gate Barcode & Live Camera Scanner</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Point device camera at student's QR pass or paste/type pass code
                </p>
              </div>

              {/* Camera Scanner Toggle Button */}
              <button
                type="button"
                onClick={cameraActive ? stopCameraScanner : startCameraScanner}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                  cameraActive 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Open Camera Scanner</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Camera Viewfinder Box */}
            {cameraActive && (
              <div className="p-4 bg-[#080c16] border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-fadeIn">
                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border-2 border-dashed border-emerald-500/60 bg-black">
                  <div id="qr-reader" className="w-full" />
                </div>
                <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live camera scanning active — hold QR code within frame</span>
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Manual Code Input Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passCodeInput}
                  onChange={(e) => setPassCodeInput(e.target.value)}
                  placeholder="Enter or paste Pass Code (e.g. EP-89F12A, VP-9910AF)"
                  className="w-full bg-[#080c16] border border-white/[0.08] focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleVerifyCode()}
                disabled={verifying}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{verifying ? 'Verifying...' : 'Verify Pass'}</span>
              </button>
            </div>

            {/* Quick 1-Click Simulation Buttons */}
            <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Testing:</span>
              <button 
                onClick={() => { setPassCodeInput('EP-STUDENT-OUT'); handleVerifyCode('EP-STUDENT-OUT'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-white/[0.06] font-mono text-[11px] cursor-pointer"
              >
                EP-STUDENT-OUT (Leaving)
              </button>
              <button 
                onClick={() => { setPassCodeInput('EP-STUDENT-RET'); handleVerifyCode('EP-STUDENT-RET'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-white/[0.06] font-mono text-[11px] cursor-pointer"
              >
                EP-STUDENT-RET (Returning)
              </button>
              <button 
                onClick={() => { setPassCodeInput('VP-QR9910'); handleVerifyCode('VP-QR9910'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-white/[0.06] font-mono text-[11px] cursor-pointer"
              >
                VP-QR9910 (Guest Enter)
              </button>
            </div>

            {/* Verification Result Decision Box */}
            {verifiedPass && (
              <div className="p-5 rounded-2xl bg-[#080c16] border border-indigo-500/30 space-y-4 animate-scaleUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {verifiedPass.pass?.visitorName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white text-sm">{verifiedPass.pass?.visitorName}</span>
                        <span className="font-mono text-xs text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                          {verifiedPass.pass?.passCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {verifiedPass.isStudentPass 
                          ? `Resident Student • Room ${verifiedPass.pass?.student?.roomNumber || 'A-104'} • Roll: ${verifiedPass.pass?.student?.rollNumber || 'CS23B042'}`
                          : `Visiting Student: ${verifiedPass.pass?.student?.name} (Room ${verifiedPass.pass?.student?.roomNumber})`}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    verifiedPass.isPastCurfew ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    verifiedPass.status === 'CHECKED_OUT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {verifiedPass.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Outing / Visit Reason:</span>
                    <span className="text-slate-200 font-medium">{verifiedPass.pass?.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Permitted Curfew / Return Time:</span>
                    <span className="text-slate-200 font-mono font-medium">
                      {new Date(verifiedPass.pass?.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Overdue Curfew Alert */}
                {verifiedPass.isPastCurfew && (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-center space-x-2 font-semibold">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>
                      ⚠️ CURFEW VIOLATION: Return time has expired by {verifiedPass.minutesLate} minutes! Late timestamp will be submitted to the Chief Warden.
                    </span>
                  </div>
                )}

                {/* Primary Stamping Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.06]">
                  {verifiedPass.nextAllowedAction === 'EXIT' && (
                    <button
                      onClick={() => handleStampGate('EXIT')}
                      disabled={stampingAction}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{stampingAction ? 'Stamping...' : 'Stamp Exit (Allow to Leave)'}</span>
                    </button>
                  )}

                  {verifiedPass.nextAllowedAction === 'ENTRY' && (
                    <button
                      onClick={() => handleStampGate('ENTRY')}
                      disabled={stampingAction}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{stampingAction ? 'Stamping...' : 'Stamp Entry (Clear to Enter)'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setVerifiedPass(null)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gate Roster: Students Outside & Visitors Inside */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRosterTab('students')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rosterTab === 'students'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  Students Outside ({activeRoster.studentsOutsideCount})
                </button>
                <button
                  onClick={() => setRosterTab('visitors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rosterTab === 'visitors'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  Visitors Inside ({activeRoster.activeVisitorsCount})
                </button>
              </div>

              <span className="text-xs text-slate-500 font-mono">Real-time gate synchronization</span>
            </div>

            {rosterTab === 'students' ? (
              <div className="space-y-3">
                {activeRoster.studentsOutside.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    All hostel residents are currently accounted for inside campus.
                  </div>
                ) : (
                  activeRoster.studentsOutside.map((s) => (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        s.isPastCurfew 
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                          : 'bg-[#080c16] border-white/[0.06]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{s.visitorName}</span>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {s.passCode}
                          </span>
                          <span className="text-xs text-slate-400">
                            Room {s.student?.roomNumber} • Roll: {s.student?.rollNumber}
                          </span>
                          {s.isPastCurfew && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              LATE BY {s.minutesLate}m
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Destination: {s.purpose} • Left at: {s.actualCheckOut ? new Date(s.actualCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setPassCodeInput(s.passCode);
                          handleVerifyCode(s.passCode);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold rounded-xl border border-white/[0.08] transition-all self-start sm:self-auto cursor-pointer"
                      >
                        Stamp Return
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {activeRoster.visitorsInside.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No external guest visitors currently checked in inside the hostel.
                  </div>
                ) : (
                  activeRoster.visitorsInside.map((v) => (
                    <div
                      key={v.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        v.isOverstay ? 'bg-rose-950/20 border-rose-500/40' : 'bg-[#080c16] border-white/[0.06]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{v.visitorName}</span>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {v.passCode}
                          </span>
                          {v.isOverstay && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              OVERSTAY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Visiting: {v.student?.name} (Room {v.student?.roomNumber}) • Phone: {v.visitorPhone}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setPassCodeInput(v.passCode);
                          handleVerifyCode(v.passCode);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold rounded-xl border border-white/[0.08] transition-all self-start sm:self-auto cursor-pointer"
                      >
                        Stamp Exit
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DIGITAL QR PASS BOARDING CARD
      ======================================================== */}
      {selectedPassForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0c101c] border border-white/[0.1] rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
            
            <button
              onClick={() => setSelectedPassForQR(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Official Gate Clearance Pass</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{selectedPassForQR.visitorName}</h3>
              <p className="text-xs text-slate-400">
                {selectedPassForQR.passCode.startsWith('EP-') ? 'Resident Student Outing' : 'Guest Visitor Entry'}
              </p>
              <p className="text-sm font-mono font-bold text-indigo-400 tracking-wider">
                {selectedPassForQR.passCode}
              </p>
            </div>

            {/* High Contrast QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/20">
              <QRCodeSVG
                value={getQRPayload(selectedPassForQR)}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Pass Metadata Grid */}
            <div className="w-full bg-[#080c16] rounded-2xl p-3.5 text-xs text-left space-y-1.5 border border-white/[0.06]">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination/Reason:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[170px]">{selectedPassForQR.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Return Curfew:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {new Date(selectedPassForQR.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gate Status:</span>
                <span className="text-indigo-400 font-bold">{selectedPassForQR.status}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.08] text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPassForQR(null)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

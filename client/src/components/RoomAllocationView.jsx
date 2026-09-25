import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Sliders, 
  Compass, 
  Bed, 
  ShieldCheck, 
  Search, 
  UserMinus, 
  Mail, 
  Phone, 
  FileText, 
  Check, 
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  UserPlus,
  ArrowRight,
  X,
  Filter,
  CheckCircle,
  PlusCircle,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function RoomAllocationView({ currentUser, onSwitchRole }) {
  const isWarden = currentUser?.role === 'ADMIN' || currentUser?.role === 'WARDEN';

  // Warden Active Sub-Tab: 'vacant' | 'queue' | 'residents'
  const [activeTab, setActiveTab] = useState('vacant');

  // Warden Data States
  const [allVacantRooms, setAllVacantRooms] = useState([]);
  const [loadingVacant, setLoadingVacant] = useState(false);
  const [allocatedStudents, setAllocatedStudents] = useState([]);
  const [loadingAllocated, setLoadingAllocated] = useState(false);
  const [adminQueue, setAdminQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Filters for Vacant Rooms Explorer
  const [vacantSearch, setVacantSearch] = useState('');
  const [vacantBlockFilter, setVacantBlockFilter] = useState('ALL');
  const [vacantTypeFilter, setVacantTypeFilter] = useState('ALL');

  // Filters for Allocated Students Directory
  const [searchTerm, setSearchTerm] = useState('');
  const [residentBlockFilter, setResidentBlockFilter] = useState('ALL');

  // Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [modalMode, setModalMode] = useState('NEW_STUDENT'); // 'NEW_STUDENT' | 'EXISTING_STUDENT'
  const [modalRoomId, setModalRoomId] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [allocationSuccessMessage, setAllocationSuccessMessage] = useState('');

  // Form State for Filling New Student Information
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
    studySchedule: 'FLEXIBLE',
    sleepTime: '23:30',
    cleanlinessLevel: 4,
    noiseTolerance: 'MODERATE',
    acPreference: true
  });

  // Student View States
  const [myAllocation, setMyAllocation] = useState(null);
  const [loadingMyAlloc, setLoadingMyAlloc] = useState(true);

  // Student Edit Preferences State
  const [preferences, setPreferences] = useState({
    studySchedule: 'NIGHT_OWL',
    sleepTime: '01:30',
    cleanlinessLevel: 4,
    noiseTolerance: 'MODERATE',
    acPreference: true,
    preferredFloor: 1
  });

  useEffect(() => {
    if (isWarden) {
      fetchVacantRooms();
      fetchAdminQueue();
      fetchAllocatedStudents();
    } else {
      fetchMyAllocation();
    }
  }, [isWarden, residentBlockFilter]);

  const fetchVacantRooms = async () => {
    setLoadingVacant(true);
    try {
      const res = await api.get('/rooms?availableOnly=true');
      setAllVacantRooms(res.data.rooms || []);
    } catch (err) {
      console.error('Error fetching vacant rooms:', err);
    } finally {
      setLoadingVacant(false);
    }
  };

  const fetchAllocatedStudents = async () => {
    setLoadingAllocated(true);
    try {
      const url = residentBlockFilter === 'ALL' 
        ? `/rooms/allocated-students?search=${encodeURIComponent(searchTerm)}` 
        : `/rooms/allocated-students?block=${encodeURIComponent(residentBlockFilter)}&search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      setAllocatedStudents(res.data.students || []);
    } catch (err) {
      console.error('Error fetching allocated students:', err);
    } finally {
      setLoadingAllocated(false);
    }
  };

  const fetchAdminQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await api.get('/rooms/admin-queue');
      setAdminQueue(res.data.queue || []);
    } catch (err) {
      console.error('Error fetching admin queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchMyAllocation = async () => {
    setLoadingMyAlloc(true);
    try {
      const res = await api.get('/rooms/my-allocation');
      setMyAllocation(res.data);
      if (res.data.preference) {
        setPreferences({
          studySchedule: res.data.preference.studySchedule || 'FLEXIBLE',
          sleepTime: res.data.preference.sleepTime || '23:00',
          cleanlinessLevel: res.data.preference.cleanlinessLevel || 4,
          noiseTolerance: res.data.preference.noiseTolerance || 'MODERATE',
          acPreference: Boolean(res.data.preference.acPreference),
          preferredFloor: res.data.preference.preferredFloor || 1
        });
      }
    } catch (err) {
      console.error('Error fetching my allocation:', err);
    } finally {
      setLoadingMyAlloc(false);
    }
  };

  // 1-Click Allocate from AI Queue
  const handleQueueAllocate = async (studentId, roomId, studentName, roomNumber) => {
    try {
      await api.post('/rooms/allocate', { studentId, roomId });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      fetchAdminQueue();
      fetchAllocatedStudents();
      fetchVacantRooms();
      alert(`Warden Allocation Complete: Allocated ${studentName} to Room ${roomNumber}.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Allocation failed');
    }
  };

  // Open Modal pre-selecting a specific vacant room
  const handleOpenAllocateForRoom = (room) => {
    setModalRoomId(room.id);
    if (adminQueue.length > 0) {
      setModalStudentId(adminQueue[0].student.id);
    }
    // Set AC preference according to room
    setNewStudent(prev => ({
      ...prev,
      acPreference: room.type.includes('AC')
    }));
    setShowAllocateModal(true);
  };

  // Submit Allocation Modal (either New Student Information or Existing Queue Student)
  const handleSubmitAllocation = async (e) => {
    e.preventDefault();
    if (!modalRoomId) {
      alert('Please select a vacant room to allocate.');
      return;
    }

    setAllocating(true);
    try {
      let payload;
      if (modalMode === 'NEW_STUDENT') {
        if (!newStudent.name.trim() || !newStudent.email.trim()) {
          alert('Please enter at least the student name and email address.');
          setAllocating(false);
          return;
        }
        payload = {
          roomId: modalRoomId,
          studentData: {
            ...newStudent,
            cleanlinessLevel: parseInt(newStudent.cleanlinessLevel, 10)
          }
        };
      } else {
        if (!modalStudentId) {
          alert('Please select a student from the unassigned list.');
          setAllocating(false);
          return;
        }
        payload = {
          roomId: modalRoomId,
          studentId: modalStudentId
        };
      }

      const res = await api.post('/rooms/allocate', payload);

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      setShowAllocateModal(false);
      // Reset form
      setNewStudent({
        name: '',
        email: '',
        rollNumber: '',
        phone: '',
        studySchedule: 'FLEXIBLE',
        sleepTime: '23:30',
        cleanlinessLevel: 4,
        noiseTolerance: 'MODERATE',
        acPreference: true
      });

      // Refresh all lists
      fetchVacantRooms();
      fetchAdminQueue();
      fetchAllocatedStudents();

      alert(res.data.message || 'Room allocated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Allocation failed');
    } finally {
      setAllocating(false);
    }
  };

  // De-allocate / Vacate Room
  const handleDeallocate = async (studentId, studentName, roomNumber) => {
    if (!window.confirm(`Warden Confirmation: Are you sure you want to de-allocate ${studentName} from Room ${roomNumber}? This will make the bed vacant again.`)) {
      return;
    }

    try {
      await api.post('/rooms/deallocate', { studentId });
      alert(`De-allocated ${studentName}. Vacancy opened in Room ${roomNumber}.`);
      fetchAllocatedStudents();
      fetchAdminQueue();
      fetchVacantRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'De-allocation failed');
    }
  };

  // Filter vacant rooms based on user criteria
  const filteredVacantRooms = allVacantRooms.filter((r) => {
    if (vacantBlockFilter !== 'ALL' && r.block !== vacantBlockFilter) return false;
    if (vacantTypeFilter === 'AC' && !r.type.includes('AC')) return false;
    if (vacantTypeFilter === 'NON_AC' && r.type.includes('AC')) return false;
    if (vacantSearch) {
      const q = vacantSearch.toLowerCase();
      const matchRoom = r.roomNumber.toLowerCase().includes(q);
      const matchBlock = r.block.toLowerCase().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      if (!matchRoom && !matchBlock && !matchType) return false;
    }
    return true;
  });

  // Calculate summary counts
  const totalVacantBeds = allVacantRooms.reduce((sum, r) => sum + (r.capacity - r.occupancy), 0);
  const selectedModalRoom = allVacantRooms.find(r => r.id === parseInt(modalRoomId, 10));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ========================================================
          WARDEN VIEW (EXCLUSIVE ALLOCATION AUTHORITY)
      ======================================================== */}
      {isWarden ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Hostel Administrative Authority: Room Allotment Studio</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Room Allocation & Resident Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Explore vacant rooms, directly allocate available beds with student details, or execute 1-click AI matching.
              </p>
            </div>

            {/* Quick Action: Allocate Vacant Room */}
            <button
              onClick={() => {
                if (allVacantRooms.length > 0 && !modalRoomId) {
                  setModalRoomId(allVacantRooms[0].id);
                }
                setShowAllocateModal(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Allocate Vacant Room</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vacant Rooms</span>
              <p className="text-2xl font-black text-white mt-0.5">{allVacantRooms.length}</p>
              <p className="text-[10px] text-indigo-400 mt-0.5 font-medium">Ready for allocation</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available Beds</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{totalVacantBeds}</p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Vacant spots open</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Allotment</span>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{adminQueue.length}</p>
              <p className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Students in queue</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Official Residents</span>
              <p className="text-2xl font-black text-indigo-300 mt-0.5">{allocatedStudents.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Occupying rooms</p>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('vacant')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeTab === 'vacant'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Vacant Rooms Explorer ({allVacantRooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeTab === 'queue'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Unassigned Queue ({adminQueue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('residents')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeTab === 'residents'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Residents Directory ({allocatedStudents.length})</span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: VACANT ROOMS EXPLORER (DIRECT ALLOTMENT)
          ======================================================== */}
          {activeTab === 'vacant' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search vacant rooms by number (e.g. A-102, B-201, C-301)..."
                    value={vacantSearch}
                    onChange={(e) => setVacantSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  {/* Block Filters */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['ALL', 'Block A', 'Block B', 'Block C'].map((b) => (
                      <button
                        key={b}
                        onClick={() => setVacantBlockFilter(b)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          vacantBlockFilter === b
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {/* Type Filters */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setVacantTypeFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        vacantTypeFilter === 'ALL'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setVacantTypeFilter('AC')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        vacantTypeFilter === 'AC'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      AC
                    </button>
                    <button
                      onClick={() => setVacantTypeFilter('NON_AC')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        vacantTypeFilter === 'NON_AC'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Non-AC
                    </button>
                  </div>
                </div>
              </div>

              {/* Vacant Rooms Grid */}
              {loadingVacant ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Loading vacant rooms inventory...
                </div>
              ) : filteredVacantRooms.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <p className="text-sm font-bold text-slate-300">No vacant rooms match your filter criteria.</p>
                  <p className="text-xs text-slate-500">Try changing block or room type filters above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVacantRooms.map((room) => {
                    const vacantCount = room.capacity - room.occupancy;
                    const occupancyPercentage = (room.occupancy / room.capacity) * 100;

                    return (
                      <div
                        key={room.id}
                        className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md hover:shadow-indigo-500/10 group"
                      >
                        {/* Top Card Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
                                Room {room.roomNumber}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                                {room.block} • F{room.floor}
                              </span>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {vacantCount} {vacantCount === 1 ? 'Bed Vacant' : 'Beds Vacant'}
                            </span>
                          </div>

                          {/* Room Type & Price */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">{room.type}</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              ₹{room.basePrice?.toLocaleString()} <span className="text-[10px] text-slate-500">/sem</span>
                            </span>
                          </div>

                          {/* Visual Occupancy Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>Occupancy: {room.occupancy} / {room.capacity}</span>
                              <span className="text-emerald-400 font-semibold">{vacantCount} available</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-indigo-500 h-full rounded-full transition-all"
                                style={{ width: `${occupancyPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(room.amenities ? room.amenities.split(', ') : ['WiFi', 'Standard Attached Bath']).map((am, i) => (
                              <span key={i} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                {am}
                              </span>
                            ))}
                          </div>

                          {/* Roommates sharing this room */}
                          {room.students && room.students.length > 0 ? (
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                Current Occupant(s):
                              </span>
                              {room.students.map((st) => (
                                <div key={st.id} className="flex items-center justify-between text-slate-300">
                                  <span className="font-medium text-xs text-white">{st.name}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {st.preference?.studySchedule || 'FLEXIBLE'} • {st.preference?.sleepTime || '23:00'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 italic">
                              ✨ Entire room is vacant. Available for new allotment.
                            </div>
                          )}
                        </div>

                        {/* Action Button: Allocate Room */}
                        <button
                          onClick={() => handleOpenAllocateForRoom(room)}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Allocate This Vacant Room</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: AI UNASSIGNED QUEUE (1-CLICK ALLOCATE)
          ======================================================== */}
          {activeTab === 'queue' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI Compatibility Allocation Queue ({adminQueue.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vector-distance model matches each student's sleep schedule, cleanliness, and study habits with available vacant rooms.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 self-start sm:self-auto">
                  {adminQueue.length} Pending
                </span>
              </div>

              {loadingQueue ? (
                <div className="py-12 text-center text-slate-400 text-xs">Computing optimal recommendations...</div>
              ) : adminQueue.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 text-xs flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All registered students have been officially allocated by the Warden!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminQueue.map((item) => (
                    <div 
                      key={item.student.id} 
                      className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{item.student.name}</span>
                          <span className="text-xs text-slate-400 font-mono">({item.student.rollNumber})</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                            {item.preference?.studySchedule}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Bedtime: {item.preference?.sleepTime} • Cleanliness: {item.preference?.cleanlinessLevel}/5 • Noise: {item.preference?.noiseTolerance}
                        </p>
                      </div>

                      {item.topRecommendations && item.topRecommendations[0] && (
                        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-lg shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-white">Room {item.topRecommendations[0].room.roomNumber}</span>
                            <span className="text-xs font-extrabold text-emerald-400 ml-2">
                              {item.topRecommendations[0].compatibilityScore}% Match
                            </span>
                            <p className="text-[11px] text-slate-400">
                              {item.topRecommendations[0].room.type} ({item.topRecommendations[0].room.block})
                            </p>
                          </div>

                          <button
                            onClick={() => handleQueueAllocate(
                              item.student.id,
                              item.topRecommendations[0].room.id,
                              item.student.name,
                              item.topRecommendations[0].room.roomNumber
                            )}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5 shrink-0"
                            title="Execute AI Allotment"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>1-Click Allocate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 3: ALLOCATED RESIDENTS DIRECTORY
          ======================================================== */}
          {activeTab === 'residents' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search allocated students by name, roll number, or room (e.g. Rahul, CS23B042, A-104)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAllocatedStudents()}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
                  {['ALL', 'Block A', 'Block B', 'Block C'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setResidentBlockFilter(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        residentBlockFilter === b
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Official Hostel Residents Registry ({allocatedStudents.length})</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {allocatedStudents.length} official occupants
                  </span>
                </div>

                {loadingAllocated ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading directory...</div>
                ) : allocatedStudents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
                    No allocated students found matching criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Room & Block</th>
                          <th className="py-3 px-4">Room Type</th>
                          <th className="py-3 px-4">Roommate(s)</th>
                          <th className="py-3 px-4">Living Habits</th>
                          <th className="py-3 px-4 text-right">Warden Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {allocatedStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-950/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-white text-xs">{s.name}</p>
                                  <p className="text-[11px] text-slate-400 font-mono">{s.rollNumber || s.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                Room {s.roomNumber}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {s.roomDetails?.block} • Floor {s.roomDetails?.floor}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-slate-300">{s.roomDetails?.type || 'Standard'}</span>
                              <p className="text-[11px] text-slate-500 font-mono">₹{s.roomDetails?.basePrice?.toLocaleString()} / sem</p>
                            </td>

                            <td className="py-3.5 px-4">
                              {s.roommates && s.roommates.length > 0 ? (
                                <div className="space-y-0.5">
                                  {s.roommates.map((rm) => (
                                    <span key={rm.id} className="inline-block bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300 mr-1">
                                      {rm.name} ({rm.rollNumber})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">Single Occupant</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 bg-slate-950 rounded text-indigo-300 font-mono">
                                  {s.preference?.studySchedule || 'FLEXIBLE'}
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-950 rounded text-slate-300 font-mono">
                                  {s.preference?.sleepTime || '23:00'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeallocate(s.id, s.name, s.roomNumber)}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1"
                                title="De-allocate / Vacate Room"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>Vacate</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              ALLOCATE VACANT ROOM MODAL (FILL NECESSARY INFORMATION)
          ======================================================== */}
          {showAllocateModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">Allocate Vacant Room</h3>
                      <p className="text-[11px] text-slate-400">Fill in the student details to officially allot this room</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAllocateModal(false)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitAllocation} className="space-y-4">
                  {/* Step 1: Target Room Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      1. Target Vacant Room
                    </label>
                    <select
                      value={modalRoomId}
                      onChange={(e) => setModalRoomId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    >
                      {allVacantRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber} ({r.block}, Floor {r.floor}) — {r.type} [{r.occupancy}/{r.capacity} beds occupied • {r.capacity - r.occupancy} vacant]
                        </option>
                      ))}
                    </select>

                    {/* Room Summary Preview Badge */}
                    {selectedModalRoom && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">Room {selectedModalRoom.roomNumber}</span>
                          <span className="text-slate-400 text-[11px] ml-2 font-mono">
                            {selectedModalRoom.block} • {selectedModalRoom.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400">
                            {selectedModalRoom.capacity - selectedModalRoom.occupancy} Bed(s) Available
                          </span>
                          <p className="text-[10px] text-slate-500">₹{selectedModalRoom.basePrice?.toLocaleString()} / sem</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Allocation Mode Toggle */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-300">
                      2. Choose Allotment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalMode('NEW_STUDENT')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                          modalMode === 'NEW_STUDENT'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Fill Student Information</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalMode('EXISTING_STUDENT')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                          modalMode === 'EXISTING_STUDENT'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Select from Waiting List ({adminQueue.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* MODE A: FILL NEW STUDENT INFORMATION */}
                  {modalMode === 'NEW_STUDENT' && (
                    <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Student Information & Living Habits</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Student Full Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Aarav Patel"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Roll Number / ID *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CS23B099"
                            value={newStudent.rollNumber}
                            onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Institutional Email *
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. aarav.patel@hostel.edu"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Contact Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Lifestyle Preferences */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 block">
                          AI Roommate Matching Profile:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Study Schedule</label>
                            <select
                              value={newStudent.studySchedule}
                              onChange={(e) => setNewStudent({ ...newStudent, studySchedule: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="NIGHT_OWL">Night Owl</option>
                              <option value="EARLY_BIRD">Early Bird</option>
                              <option value="FLEXIBLE">Flexible</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Usual Bedtime</label>
                            <select
                              value={newStudent.sleepTime}
                              onChange={(e) => setNewStudent({ ...newStudent, sleepTime: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="21:30">09:30 PM</option>
                              <option value="22:30">10:30 PM</option>
                              <option value="23:30">11:30 PM</option>
                              <option value="00:30">12:30 AM</option>
                              <option value="01:30">01:30 AM</option>
                              <option value="02:30">02:30 AM</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Cleanliness (1-5)</label>
                            <select
                              value={newStudent.cleanlinessLevel}
                              onChange={(e) => setNewStudent({ ...newStudent, cleanlinessLevel: parseInt(e.target.value, 10) })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value="5">5 - Spotless</option>
                              <option value="4">4 - Neat & Organized</option>
                              <option value="3">3 - Moderate</option>
                              <option value="2">2 - Relaxed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE B: SELECT FROM REGISTERED WAITLIST */}
                  {modalMode === 'EXISTING_STUDENT' && (
                    <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                      <label className="block text-xs font-semibold text-slate-300">
                        Select Student from Waiting Queue
                      </label>
                      {adminQueue.length === 0 ? (
                        <p className="text-xs text-amber-400">No students currently in the unassigned queue.</p>
                      ) : (
                        <select
                          value={modalStudentId}
                          onChange={(e) => setModalStudentId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        >
                          {adminQueue.map((item) => (
                            <option key={item.student.id} value={item.student.id}>
                              {item.student.name} ({item.student.rollNumber}) — {item.preference?.studySchedule}, Bedtime: {item.preference?.sleepTime}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Authority Confirmation Box */}
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                    <p className="font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Warden Official Allotment Notice</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Submitting this form immediately allocates the resident to <strong>Room {selectedModalRoom?.roomNumber}</strong>, updates the residential registry, and automatically generates their semester fee invoice.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllocateModal(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={allocating}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{allocating ? 'Executing Allotment...' : 'Confirm & Allocate Room'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
            STUDENT VIEW (OFFICIAL RESIDENCE RECORD)
        ======================================================== */
        <div className="space-y-6">
          {/* Helpful Guidance Banner pointing to Warden allocation authority */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl shrink-0">ℹ️</span>
              <div>
                <p className="font-bold text-indigo-300">Looking for the option to allocate vacant rooms?</p>
                <p className="text-slate-400 text-[11px]">
                  Room allocation authority belongs to the <strong>Hostel Warden</strong>. You are currently logged in as a <strong>Student</strong> viewing your allotment card.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSwitchRole && onSwitchRole('WARDEN')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95"
            >
              <span>Switch to Warden Mode to Allocate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Student Residence Record</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">My Room Allotment Details</h1>
            <p className="text-xs text-slate-400">
              Official residential allotment card issued by the hostel warden authority.
            </p>
          </div>

          {loadingMyAlloc ? (
            <div className="py-12 text-center text-slate-400 text-xs">Retrieving your allocation record...</div>
          ) : myAllocation?.allocated ? (
            /* OFFICIAL ROOM ALLOTMENT CERTIFICATE CARD */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-white">Official Room Allotment</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE ALLOTMENT
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Reference: <strong className="text-slate-200">{myAllocation.allotmentRef}</strong> • {myAllocation.term}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Allocated By</span>
                  <p className="text-xs font-bold text-indigo-300">{myAllocation.wardenAuthority}</p>
                </div>
              </div>

              {/* Room Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Allotted Room</span>
                  <p className="text-3xl font-black text-white mt-1">Room {myAllocation.roomNumber}</p>
                  <p className="text-xs text-indigo-400 mt-1 font-medium">
                    {myAllocation.room?.block} • Floor {myAllocation.room?.floor}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Room Type & Amenities</span>
                  <p className="text-lg font-bold text-white mt-1">{myAllocation.room?.type || 'Double AC'}</p>
                  <p className="text-xs text-slate-400 mt-1">{myAllocation.room?.amenities || 'AC, High Speed WiFi, Attached Bath'}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Semester Tariff</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹{myAllocation.room?.basePrice?.toLocaleString()} / sem</p>
                  <p className="text-xs text-slate-400 mt-1">Occupancy: {myAllocation.room?.occupancy}/{myAllocation.room?.capacity} Beds Allocated</p>
                </div>
              </div>

              {/* Roommate Breakdown Card */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>My Roommate Profile & AI Lifestyle Match</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {myAllocation.roommates?.length || 0} Roommate(s) Sharing
                  </span>
                </div>

                {myAllocation.roommates && myAllocation.roommates.length > 0 ? (
                  myAllocation.roommates.map((rm) => (
                    <div key={rm.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{rm.name}</span>
                          <span className="text-xs font-mono text-slate-400">({rm.rollNumber})</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 flex items-center space-x-3">
                          <span>Email: {rm.email}</span>
                          <span>•</span>
                          <span>Phone: {rm.phone || '+91 91234 56790'}</span>
                        </p>
                        <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{rm.harmonyReason || 'High lifestyle compatibility matched by Warden.'}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Compatibility</span>
                        <p className="text-2xl font-black text-emerald-400">{rm.compatibilityScore || 94}%</p>
                        <p className="text-[10px] text-slate-500">Vector Distance</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-400 italic">
                    Single occupancy room. No roommates sharing this room.
                  </div>
                )}
              </div>

              {/* Residential Policy */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Residential Guidelines & Allotment Policy</span>
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  {(myAllocation.rules || []).map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* PENDING ALLOTMENT BANNER */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Clock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Allotment Pending Warden Review</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Your profile has been submitted to the Warden's allocation queue.
                  <br />
                  <strong className="text-indigo-300">Authority Notice:</strong> Only the Block Warden holds the official authority to allocate hostel rooms. Once processed, your complete room specifications and roommate details will appear here.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Your Submitted Profile:</span>
                <p className="text-slate-300">
                  Study: <strong className="text-white">{preferences.studySchedule}</strong> • Bedtime: <strong className="text-white">{preferences.sleepTime}</strong>
                </p>
                <p className="text-slate-300">
                  Cleanliness: <strong className="text-white">{preferences.cleanlinessLevel}/5</strong> • Preferred Floor: <strong className="text-white">Floor {preferences.preferredFloor}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

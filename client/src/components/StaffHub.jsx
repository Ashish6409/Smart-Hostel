import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Building,
  Check
} from 'lucide-react';
import api from '../services/api';

export default function StaffHub({ currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState({});

  useEffect(() => {
    fetchAssigned();
  }, []);

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints?assignedToMe=true');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    const note = resolutionNotes[id] || 'Inspected and repaired on-site.';
    try {
      await api.patch(`/complaints/${id}/status`, {
        status: 'RESOLVED',
        resolutionNotes: note
      });
      alert('Ticket marked as Resolved!');
      fetchAssigned();
    } catch (err) {
      alert('Failed to update ticket');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Technician Work Orders & Assignments</h1>
            <p className="text-xs text-slate-400">
              Logged in as: <strong className="text-white">{currentUser?.name}</strong> • HVAC & Electrical Maintenance Staff
            </p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Assigned Tickets ({complaints.length})</h2>
          <span className="text-xs text-slate-400 font-mono">Auto-routed by AI Engine</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading work orders...</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>No pending work orders! All assigned tickets are resolved.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {c.ticketNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {c.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                      Room {c.roomNumber}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  {c.rawText}
                </p>

                <p className="text-xs text-slate-400">
                  Reported by: <span className="text-slate-200 font-medium">{c.user?.name}</span> ({c.user?.email})
                </p>

                {c.status !== 'RESOLVED' && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add brief repair notes (e.g. replaced capacitor, cleaned filter)..."
                      value={resolutionNotes[c.id] || ''}
                      onChange={(e) => setResolutionNotes({ ...resolutionNotes, [c.id]: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      onClick={() => handleResolve(c.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

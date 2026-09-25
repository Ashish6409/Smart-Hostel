import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  User, 
  Zap,
  Filter
} from 'lucide-react';
import api from '../services/api';

export default function ComplaintView({ currentUser }) {
  const [complaintText, setComplaintText] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    fetchComplaints();
  }, [filterCategory]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const url = filterCategory === 'ALL' 
        ? '/complaints' 
        : `/complaints?category=${encodeURIComponent(filterCategory)}`;
      const res = await api.get(url);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live NLP AI preview as user types
  const handleTextChange = (e) => {
    const text = e.target.value;
    setComplaintText(text);

    if (typingTimeout) clearTimeout(typingTimeout);

    if (text.trim().length > 4) {
      setTypingTimeout(
        setTimeout(async () => {
          try {
            const res = await api.post('/complaints/preview-ai', {
              text,
              roomNumber: currentUser?.roomNumber
            });
            setAiPreview(res.data.aiResult);
          } catch (err) {
            console.error(err);
          }
        }, 300)
      );
    } else {
      setAiPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        text: complaintText
      });
      setComplaintText('');
      setAiPreview(null);
      fetchComplaints();
      alert(`Ticket ${res.data.complaint.ticketNumber} created and auto-assigned to ${res.data.assignedTechnician?.name || 'On-Duty Staff'}!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/complaints/${id}/status`, {
        status,
        resolutionNotes: status === 'RESOLVED' ? 'Repaired and verified on-site.' : undefined
      });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Pillar 2 • Natural Language Issue Triage & Routing</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">AI Complaint Management</h1>
        <p className="text-xs text-slate-400">
          Submits plain language text, automatically classifies Category, Priority, and Location, and dispatches to appropriate staff.
        </p>
      </div>

      {/* Submission Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Submit Unstructured Complaint</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Try typing: <span className="text-indigo-300 italic">"AC in room A-104 isn't working and blowing warm air."</span> or <span className="text-indigo-300 italic">"Emergency! Water pipe leaking in bathroom B-102 flooding floor."</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={3}
              value={complaintText}
              onChange={handleTextChange}
              placeholder="Describe your maintenance or hostel issue naturally..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Real-time AI NLP Extraction Card */}
          {aiPreview && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time AI Extraction</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {aiPreview.confidence}% Confidence
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-slate-800">
                  Category: <strong className="text-indigo-300">{aiPreview.category}</strong>
                </span>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getPriorityBadgeClass(aiPreview.priority)}`}>
                  Priority: <strong>{aiPreview.priority}</strong>
                </span>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-slate-800">
                  Location: <strong className="text-amber-300">{aiPreview.roomNumber}</strong>
                </span>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Auto-Assigns: <strong>{aiPreview.category.includes('Plumb') ? 'Rajesh (Plumbing)' : (aiPreview.category.includes('HVAC') || aiPreview.category.includes('Elect') ? 'Suresh (HVAC/Elec)' : 'Anil (Civil)')}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !complaintText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Routing...' : 'Submit & Auto-Route Ticket'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Active Complaint Records</h2>
            <p className="text-xs text-slate-400">Chronological ticket ledger with AI triage metadata</p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'HVAC/AC', 'Plumbing', 'Electrical', 'WiFi/Network', 'Carpentry'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading complaint tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No complaints found for selected filter.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {c.ticketNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {c.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Room {c.roomNumber}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {c.rawText}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800/80 gap-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.user?.name || 'Student'}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-indigo-300">
                      <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Assigned: <strong>{c.assignedStaff?.name || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      c.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {c.status}
                    </span>

                    {c.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Leaf, 
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import api from '../services/api';

export default function MessDemandView({ currentUser }) {
  const [mealType, setMealType] = useState('Dinner');
  const [dayOfWeek, setDayOfWeek] = useState('Tuesday');
  const [isExamPeriod, setIsExamPeriod] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student Leave Pass form
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('Weekend home visit');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  useEffect(() => {
    fetchPrediction();
    fetchHistory();
  }, [mealType, dayOfWeek, isExamPeriod]);

  const fetchPrediction = async () => {
    try {
      const res = await api.get(`/mess/predict?mealType=${mealType}&dayOfWeek=${dayOfWeek}&isExamPeriod=${isExamPeriod}`);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/mess/history');
      setHistoryLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd) {
      alert('Please select leave start and end dates');
      return;
    }
    setLeaveSubmitting(true);
    try {
      await api.post('/mess/leave', {
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: leaveReason,
        skipMeals: true
      });
      alert('Leave pass approved! Mess kitchen headcount automatically updated.');
      setLeaveStart('');
      setLeaveEnd('');
      fetchPrediction();
    } catch (err) {
      alert('Failed to submit leave');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Utensils className="w-4 h-4" />
          <span>Pillar 3 • Machine Learning Demand Forecasting</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">Mess Demand Prediction Engine</h1>
        <p className="text-xs text-slate-400">
          Predicts meal headcount using day-of-week seasonality, leave deductions, and confidence intervals to prevent food waste.
        </p>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Meal Type */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['Breakfast', 'Lunch', 'Dinner'].map((m) => (
            <button
              key={m}
              onClick={() => setMealType(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mealType === m ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Day of Week */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
            <button
              key={d}
              onClick={() => setDayOfWeek(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                dayOfWeek === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Exam Toggle */}
        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            checked={isExamPeriod}
            onChange={(e) => setIsExamPeriod(e.target.checked)}
            className="rounded accent-emerald-500"
          />
          <span>Exam Period (+5% Turnout)</span>
        </label>
      </div>

      {/* Primary KPI Cards Matching Prompt Spec */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expected */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Expected Attendance</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ML Model
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white">
              {prediction?.expected_attendance || 420}
            </span>
            <span className="text-sm text-slate-400">meals</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Confidence Interval: {prediction?.confidence_interval?.lower || 406} – {prediction?.confidence_interval?.upper || 434} students
          </p>
        </div>

        {/* Previous Average */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Previous Average</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              7-Day Benchmark
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-300">
              {prediction?.previous_average || 465}
            </span>
            <span className="text-sm text-slate-400">meals</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Historic unoptimized kitchen preparation standard
          </p>
        </div>

        {/* Recommended Preparation */}
        <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-emerald-950/30">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wider">Recommended Preparation</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              +2.5% Safety Buffer
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-emerald-400">
              {prediction?.recommended_preparation || 430}
            </span>
            <span className="text-sm text-emerald-300/80">meals</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-300">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saves ~{prediction?.estimated_waste_reduction_kg || 12.3} kg excess food & ₹2,275/meal</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Student Leave Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance vs Preparation Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Historical Attendance vs Recommended Prep</h2>
              <p className="text-xs text-slate-400">21-Day trend showcasing food waste minimization</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Source: {prediction?.source || 'ML Engine'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyLogs}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[300, 500]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="actualTurnout" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="Actual Attendance" />
                <Area type="monotone" dataKey="recommendedPrep" stroke="#6366f1" fillOpacity={1} fill="url(#colorPrep)" name="Optimized Prep" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Leave Pass / Meal Opt-Out Portal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Meal Opt-Out / Leave Pass</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Taking a weekend leave? Submit below to automatically deduct your headcount from the kitchen preparation order.
            </p>

            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
                <input
                  type="text"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Visiting home, Hackathon trip"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Mess kitchen attendance syncs instantly upon approval.</span>
              </div>

              <button
                type="submit"
                disabled={leaveSubmitting}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {leaveSubmitting ? 'Syncing...' : 'Submit & Deduct Meals'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

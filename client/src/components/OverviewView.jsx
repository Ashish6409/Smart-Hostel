import React, { useState, useEffect } from 'react';
import { 
  Building, 
  AlertTriangle, 
  Utensils, 
  Shield, 
  CreditCard, 
  Users, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../services/api';

export default function OverviewView({ setActiveTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/executive');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Smart Insights Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Autonomous Hostel Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hostel Operations & AI Decision Engine
          </h1>
          <p className="mt-2 text-slate-300 max-w-3xl text-sm leading-relaxed">
            Real-time multi-dimensional room allocation, automated NLP complaint triage, ML mess demand forecasting,
            and 30-day rolling predictive maintenance alerts.
          </p>

          {/* Prompt's Real-time Smart Insights Alerts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-amber-200 text-sm">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-semibold text-amber-300">Predictive Maintenance Alert</p>
                <p className="text-xs text-amber-200/80 mt-0.5">8 rooms have repeated maintenance complaints within 30 days.</p>
              </div>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-indigo-200 text-sm">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-semibold text-indigo-300">Occupancy Peak</p>
                <p className="text-xs text-indigo-200/80 mt-0.5">Block A occupancy reached 96%. Priority for Block B/C allocation.</p>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-emerald-200 text-sm">
              <span className="text-xl">🍱</span>
              <div>
                <p className="font-semibold text-emerald-300">Mess Demand Optimization</p>
                <p className="text-xs text-emerald-200/80 mt-0.5">Tuesday dinner demand is consistently lower than preparation by ~45 meals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Occupancy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Occupancy</span>
            <Building className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {analytics?.summary?.overallOccupancyRate || 64}%
            </span>
            <span className="text-xs text-slate-400">
              ({analytics?.summary?.totalOccupancy || 23} / {analytics?.summary?.totalCapacity || 36} beds)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${analytics?.summary?.overallOccupancyRate || 64}%` }}
            />
          </div>
        </div>

        {/* Predictive Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Predictive Alerts</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400">
              {analytics?.summary?.activeAlertsCount || 2}
            </span>
            <span className="text-xs text-amber-300/80">Chronic Asset Failures</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">AC in A-104 (4 failures) & Plumbing in B-102 (3 failures)</p>
        </div>

        {/* Mess Demand Forecast */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mess ML Forecast</span>
            <Utensils className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400">420</span>
            <span className="text-xs text-slate-400">Expected (Prep: 430)</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Saved ~35 meals & 12.3 kg waste vs 465 baseline</p>
        </div>

        {/* Active Visitors */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Gate Security</span>
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-400">
              {analytics?.summary?.activeVisitorsCount || 2}
            </span>
            <span className="text-xs text-slate-400">Checked-in Visitors</span>
          </div>
          <p className="mt-2 text-xs text-rose-400 font-medium">⚠️ 1 Overstay visitor flagged</p>
        </div>
      </div>

      {/* Block-wise Occupancy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Block-wise Capacity & Occupancy</h2>
              <p className="text-xs text-slate-400">Live inventory across residential hostel towers</p>
            </div>
            <button 
              onClick={() => setActiveTab('rooms')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Manage Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {(analytics?.blockStats || [
              { block: 'Block A', capacity: 18, occupancy: 17, occupancyRate: 94 },
              { block: 'Block B', capacity: 10, occupancy: 5, occupancyRate: 50 },
              { block: 'Block C', capacity: 8, occupancy: 1, occupancyRate: 13 }
            ]).map((b) => (
              <div key={b.block} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      {b.block.split(' ')[1]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{b.block}</h4>
                      <p className="text-xs text-slate-400">{b.occupancy} allocated of {b.capacity} beds</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      b.occupancyRate >= 90 ? 'text-rose-400' : (b.occupancyRate >= 60 ? 'text-amber-400' : 'text-emerald-400')
                    }`}>
                      {b.occupancyRate}%
                    </span>
                    <p className="text-[11px] text-slate-500">{b.capacity - b.occupancy} vacancies</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      b.occupancyRate >= 90 ? 'bg-rose-500' : (b.occupancyRate >= 60 ? 'bg-amber-500' : 'bg-emerald-500')
                    }`}
                    style={{ width: `${b.occupancyRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chronic Maintenance Highlights Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Chronic Failure Hotspots</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Assets triggering repeated tickets within a 30-day rolling window.
            </p>

            <div className="space-y-3">
              {(analytics?.alerts || []).map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Room {alert.roomNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {alert.complaintCount} failures / 30d
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 font-medium">{alert.category}</p>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{alert.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('maintenance')}
            className="mt-4 w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>View Full Maintenance Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feature Showcase Navigation Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Hostel Management Core Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'rooms',
              title: '1. Smart Room Allocation',
              desc: 'Vector compatibility matching (lifestyle, sleep rhythm, cleanliness) with 1-click Warden recommendations.',
              icon: Building,
              color: 'from-blue-600 to-indigo-600'
            },
            {
              id: 'complaints',
              title: '2. AI Complaint Management',
              desc: 'NLP category extraction, emergency priority classification, and automatic technician dispatch.',
              icon: AlertTriangle,
              color: 'from-purple-600 to-pink-600'
            },
            {
              id: 'mess',
              title: '3. Mess Demand Prediction',
              desc: 'ML attendance forecasting (Expected: 420, Prep: 430 vs 465 avg) minimizing kitchen food waste.',
              icon: Utensils,
              color: 'from-emerald-600 to-teal-600'
            },
            {
              id: 'maintenance',
              title: '4. Predictive Maintenance',
              desc: 'Recurrent breakdown detector (30d window) warning admins before critical asset breakdowns.',
              icon: Activity,
              color: 'from-amber-600 to-orange-600'
            },
            {
              id: 'security',
              title: '5. Smart QR Security Pass',
              desc: 'Digital visitor passes, student approval gate, and guard barcode entry/exit timestamping with overstay alerts.',
              icon: Shield,
              color: 'from-cyan-600 to-blue-600'
            },
            {
              id: 'fees',
              title: '6. Smart Fee Management',
              desc: 'Automated dues calculation, late fine tracking, instant online payment simulator, and ledger statistics.',
              icon: CreditCard,
              color: 'from-violet-600 to-purple-600'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="group p-5 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

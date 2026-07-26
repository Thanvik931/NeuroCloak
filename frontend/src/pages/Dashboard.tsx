import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import MetricCard from '../components/dashboard/MetricCard';
import RecentDecisionsTable from '../components/dashboard/RecentDecisionsTable';
import EmbeddedChart from '../components/dashboard/EmbeddedChart';
import AnomalyPanel from '../components/dashboard/AnomalyPanel';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  SlidersHorizontal,
  FileCheck,
  TrendingDown,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => apiClient('/analytics/summary')
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['recent-decisions'],
    queryFn: () => apiClient('/decisions?limit=10')
  });

  const avgHealthScore = useMemo(() => {
    if (!summary) return '...';
    const score = (summary.avgComplianceRate * 40) + (summary.avgTransparencyIndex * 30) + (summary.activeFlags === 0 ? 30 : 0);
    return `${score.toFixed(1)}/100`;
  }, [summary?.avgComplianceRate, summary?.avgTransparencyIndex, summary?.activeFlags]);

  const formatPercentage = useCallback((val: number | undefined) => {
    if (val === undefined) return '...';
    return `${(val * 100).toFixed(1)}%`;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 font-sans">
      
      {/* Welcome & Quick Action Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Cognitive Digital Twin Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Governance &amp; Real-Time Audit Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5 max-w-2xl">
            Real-time oversight for black-box AI models. Extracting logic traces, monitoring demographic fairness, and auto-repairing bias in sub-2ms.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/simulate')}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Live Simulation</span>
          </button>
          <button
            onClick={() => navigate('/decisions')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin Safeguards</span>
          </button>
        </div>
      </div>

      {/* Domain Models Real-Time Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Finance Model (UCI Credit)</h4>
              <p className="text-slate-400 text-[11px]">73.67% Test Acc | 0.8264 F1</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">Active</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Healthcare Diagnostic</h4>
              <p className="text-slate-400 text-[11px]">94.33% Test Acc | 0.9587 AUC</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">Active</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Industrial Maintenance</h4>
              <p className="text-slate-400 text-[11px]">100.00% Acc | Telemetry</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">Active</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Decisions" 
          value={summary ? summary.totalDecisions : '...'} 
          icon={Activity} 
          trend="+12% today"
          tooltip="Total number of automated decisions processed by internal AI monitors."
        />
        <MetricCard 
          title="Avg Compliance" 
          value={formatPercentage(summary?.avgComplianceRate)} 
          icon={ShieldCheck} 
          tooltip="Average rate of decisions passing all ethical and safety governance rules."
        />
        <MetricCard 
          title="Avg Transparency" 
          value={formatPercentage(summary?.avgTransparencyIndex)} 
          icon={Zap} 
          tooltip="Ratio of internally interpretable reasoning steps to total steps taking place."
        />
        <MetricCard 
          title="Avg Health Score" 
          value={avgHealthScore} 
          icon={Activity} 
          trend="Stable"
          tooltip="Unified weighted health score of the monitored AI systems combining compliance, transparency, and bias alerts."
        />
      </div>

      {/* Post-Hoc Auto-Repair Fair Benchmark Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 grid md:grid-cols-3 gap-4 items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Random Forest Age Disparity</span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>5.55% → 3.06%</span>
              <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">+44.83% Better</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed of Adaptation Latency</span>
            <div className="text-lg font-black text-white">
              1.49 ms <span className="text-xs text-slate-400 font-normal">± 0.13 ms (100 trials)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy Overhead Cost</span>
            <div className="text-lg font-black text-white">
              0.00% <span className="text-xs text-slate-400 font-normal">(McNemar p = 0.7728)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmbeddedChart 
            baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
            chartId="39f78fc4-994c-48d4-895f-cd300f276115"
            height="400px"
            title="Ethical Compliance Rate (30 Days)"
          />
        </div>
        <div className="glass-panel p-6 shadow-sm flex flex-col relative z-0">
          <EmbeddedChart 
            baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
            chartId="b5c92381-0433-400a-a359-84017dfdb66c"
            height="400px"
            title="Identified Bias Distribution"
          />
        </div>
      </div>

      {/* Anomaly Alerts Row */}
      <AnomalyPanel />

      {/* Table Row */}
      <div className="glass-panel overflow-hidden shadow-sm mt-6">
        <div className="p-6 border-b border-dark-border bg-black/10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Decisions Live Feed</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time audit log of global model reasoning</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>
        <RecentDecisionsTable decisions={decisionsData?.data || []} />
      </div>
      
    </div>
  );
}

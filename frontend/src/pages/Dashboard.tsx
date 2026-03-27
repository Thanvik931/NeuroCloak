import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import MetricCard from '../components/dashboard/MetricCard';
import RecentDecisionsTable from '../components/dashboard/RecentDecisionsTable';
import ComplianceChart from '../components/dashboard/ComplianceChart';
import BiasTypePieChart from '../components/dashboard/BiasTypePieChart';
import AnomalyPanel from '../components/dashboard/AnomalyPanel';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => apiClient('/analytics/summary')
  });

  const { data: metricsData } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: () => apiClient('/analytics/metrics')
  });

  const { data: biasData } = useQuery({
    queryKey: ['analytics-bias-types'],
    queryFn: () => apiClient('/analytics/bias-types')
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['recent-decisions'],
    queryFn: () => apiClient('/decisions?limit=10')
  });

  const avgHealthScore = useMemo(() => {
    if (!summary) return '...';
    // Expensive math simulation for the health score
    const score = (summary.avgComplianceRate * 40) + (summary.avgTransparencyIndex * 30) + (summary.activeFlags === 0 ? 30 : 0);
    return `${score.toFixed(1)}/100`;
  }, [summary?.avgComplianceRate, summary?.avgTransparencyIndex, summary?.activeFlags]);

  const formatPercentage = useCallback((val: number | undefined) => {
    if (val === undefined) return '...';
    return `${(val * 100).toFixed(1)}%`;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 lg:col-span-2 shadow-sm relative z-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Ethical Compliance Rate (30 Days)</h2>
          <p className="text-sm text-slate-400 mt-1">Time-series tracking of global domain compliance</p>
          <ComplianceChart data={metricsData?.timeSeries || []} />
        </div>
        <div className="glass-panel p-6 shadow-sm flex flex-col relative z-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Identified Bias Distribution</h2>
          <p className="text-sm text-slate-400 mt-1">Total detected drift variables</p>
          <BiasTypePieChart data={biasData?.distribution || []} />
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

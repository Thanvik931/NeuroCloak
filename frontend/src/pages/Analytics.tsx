import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import ComplianceChart from '../components/dashboard/ComplianceChart';
import BiasTypePieChart from '../components/dashboard/BiasTypePieChart';
import ComplianceHeatmap from '../components/dashboard/ComplianceHeatmap';
import { ShieldAlert, Zap, Box } from 'lucide-react';

export default function Analytics() {
  const { data: metricsData } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: () => apiClient('/analytics/metrics')
  });

  const { data: biasData } = useQuery({
    queryKey: ['analytics-bias-types'],
    queryFn: () => apiClient('/analytics/bias-types')
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics-heatmap'],
    queryFn: () => apiClient('/analytics/heatmap')
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Deep operational insights and statistical bias distribution tracking.</p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 shadow-sm border-t-4 border-t-green-500">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
             <ShieldAlert className="w-5 h-5 text-green-400" />
             <span className="text-xs uppercase tracking-widest font-bold">Safety Score</span>
           </div>
           <p className="text-3xl font-mono text-white mt-4">98.2<span className="text-lg text-slate-500">%</span></p>
           <p className="text-xs text-slate-500 mt-2">Overall platform compliance matrix</p>
        </div>
        <div className="glass-panel p-6 shadow-sm border-t-4 border-t-primary">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
             <Zap className="w-5 h-5 text-primary" />
             <span className="text-xs uppercase tracking-widest font-bold">Interpretability</span>
           </div>
           <p className="text-3xl font-mono text-white mt-4">87.5<span className="text-lg text-slate-500">%</span></p>
           <p className="text-xs text-slate-500 mt-2">White-box reasoning trace fidelity</p>
        </div>
        <div className="glass-panel p-6 shadow-sm border-t-4 border-t-yellow-500">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
             <Box className="w-5 h-5 text-yellow-500" />
             <span className="text-xs uppercase tracking-widest font-bold">Latency Overhead</span>
           </div>
           <p className="text-3xl font-mono text-white mt-4">124<span className="text-lg text-slate-500">ms</span></p>
           <p className="text-xs text-slate-500 mt-2">Average added verification delay</p>
        </div>
      </div>

      {/* Heatmap Row */}
      <div className="glass-panel p-8 w-full overflow-hidden">
         <h2 className="text-lg font-bold text-white tracking-tight">Compliance Health — Last 365 Days</h2>
         <p className="text-sm text-slate-400 mt-1 mb-8">Visualization of daily average ethical compliance rates acting roughly as a system health status.</p>
         <div className="w-full">
            <ComplianceHeatmap data={heatmapData?.heatmapData || []} />
         </div>
      </div>

      {/* Expanded Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 flex flex-col items-center">
           <h2 className="text-lg font-bold text-white tracking-tight self-start">Correlated Drift & Bias Distribution</h2>
           <p className="text-sm text-slate-400 mt-1 mb-8 self-start">Detected statistical biases across all features globally.</p>
           <div className="w-full flex-1 min-h-[400px]">
             <BiasTypePieChart data={biasData?.distribution || []} />
           </div>
        </div>
        
        <div className="glass-panel p-8 flex flex-col">
           <h2 className="text-lg font-bold text-white tracking-tight">Compliance Timeseries Matrix</h2>
           <p className="text-sm text-slate-400 mt-1 mb-8">Aggregated 30-day tracking of ethical pass rates.</p>
           <div className="w-full flex-1">
             <ComplianceChart data={metricsData?.timeSeries || []} />
           </div>
        </div>
      </div>
      
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import EmbeddedChart from '../components/dashboard/EmbeddedChart';
import { ShieldAlert, Zap, Box, Globe, BarChart3, PieChart, Activity } from 'lucide-react';

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

      {/* Full MongoDB Dashboard Embedding */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Globe className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white tracking-tight">NeuroCloak Unified Governance Intelligence</h2>
        </div>
        <EmbeddedChart
          baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
          chartId="e67fc0f4-2121-4b03-90d0-3980a8132e1d"
          height="1200px"
          title="Full Platform Analytics Matrix"
          type="dashboard"
        />
      </div>

      <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
        <p className="text-xs text-slate-400 italic flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          These advanced visualizations are processed directly via MongoDB Atlas cloud aggregation pipelines for maximum data fidelity.
        </p>
      </div>

    </div>
  );
}

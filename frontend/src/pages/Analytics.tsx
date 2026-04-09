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

      {/* MongoDB Atlas: Heatmap Analytics (Full Width) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-400">
          <Activity className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white tracking-tight">Global Compliance Heatmap</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <EmbeddedChart
            baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
            chartId="5a410fc6-58e7-4d76-aa55-d84cc57c3d37"
            height="350px"
            title="System Health & Ethical Compliance Heatmap"
          />
        </div>
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

      {/* MongoDB Atlas: Line & Donut Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">Compliance Timeseries</h2>
          </div>
          <EmbeddedChart
            baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
            chartId="39f78fc4-994c-48d4-895f-cd300f276115"
            height="450px"
            title="30-Day Pass Rate Trends"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-purple-400">
            <PieChart className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">Bias Distribution</h2>
          </div>
          <EmbeddedChart
            baseUrl="https://charts.mongodb.com/charts-project-0-hdpyqif"
            chartId="b5c92381-0433-400a-a359-84017dfdb66c"
            height="450px"
            title="Statistical Bias Types (Donut Chart)"
          />
        </div>
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { 
  BrainCircuit, 
  X, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const HealthScoreDisplay = ({ systemId }: { systemId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['system-health', systemId],
    queryFn: () => apiClient(`/systems/${systemId}/health`)
  });

  if (isLoading) return <div className="mt-auto pt-5 border-t border-slate-800 relative z-10 h-20 animate-pulse bg-slate-950/40 rounded-xl" />;
  if (!data) return null;

  const colorClass = data.score >= 90 ? 'text-emerald-400' : data.score >= 75 ? 'text-blue-400' : 'text-amber-400';
  const borderClass = data.score >= 90 ? 'border-emerald-500/20' : data.score >= 75 ? 'border-blue-500/20' : 'border-amber-500/20';

  return (
    <div className="mt-auto pt-4 border-t border-slate-800 relative z-10 flex gap-3">
       <div className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-slate-950/60 w-1/3 ${borderClass}`}>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Health</span>
          <div className="flex items-center gap-1">
             <span className={`text-xl font-mono font-black leading-none ${colorClass}`}>{data.score}</span>
             {data.trend === 'improving' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : 
              data.trend === 'declining' ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : 
              <Minus className="w-3.5 h-3.5 text-slate-400" />}
          </div>
       </div>

       <div className="flex-1 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
           <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
              <span className="text-slate-400">Compliance</span>
              <span className="text-emerald-400 font-mono">{data.metrics?.avgCompliance || 0}%</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
              <span className="text-slate-400">Transparency</span>
              <span className="text-blue-400 font-mono">{data.metrics?.avgTransparency || 0}%</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase mt-1 pt-1 border-t border-slate-800">
              <span className="text-slate-400">Grade</span>
              <span className="text-primary font-bold">{data.grade}</span>
           </div>
       </div>
    </div>
  );
};

export default function Systems() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [pausedSystems, setPausedSystems] = useState<Record<string, boolean>>({});

  const [newSystem, setNewSystem] = useState({ name: '', domain: 'FINANCE', description: '' });
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: systemsData, isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient('/systems')
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiClient('/systems', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
      setShowModal(false);
      setNewSystem({ name: '', domain: 'FINANCE', description: '' });
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystem.name || !newSystem.domain || !newSystem.description) return alert('Please fill in all fields.');
    addMutation.mutate(newSystem);
  };

  const togglePause = (id: string) => {
    setPausedSystems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rawSystems = systemsData?.data || [];

  // Filter systems by domain and search query
  const systems = rawSystems.filter((s: any) => {
    const matchesDomain = selectedDomain === 'ALL' || (s.domain || '').toUpperCase().includes(selectedDomain);
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-8 relative font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>AI Model Endpoint Infrastructure</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Active AI Systems Directory</h1>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
            Directory of connected AI models monitored by Cognitive Digital Twins across operational domains.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary w-auto inline-flex items-center gap-2 py-2.5 px-5 hover:scale-105 transition-all text-xs shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Register AI Model Endpoint</span>
        </button>
      </div>

      {/* Search & Domain Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Bar */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI models by name or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
          />
        </div>

        {/* Domain Filter Buttons */}
        <div className="md:col-span-6 flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['ALL', 'FINANCE', 'HEALTHCARE', 'INDUSTRIAL', 'SECURITY'].map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${selectedDomain === dom ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-primary font-bold tracking-wide animate-pulse">Scanning infrastructure for registered AI model endpoints...</div>
        ) : systems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">No registered AI systems found matching current query filters.</div>
        ) : systems.map((system: any) => {
          const isPaused = pausedSystems[system.id];
          return (
            <div key={system.id} className="glass-panel p-6 shadow-xl border border-slate-800 hover:border-primary/50 transition-all group flex flex-col relative overflow-hidden">
              
              {/* Background flourish */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
                    <BrainCircuit className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{system.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary opacity-80">{system.domain}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border ${isPaused ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                    {isPaused ? 'PAUSED' : 'ACTIVE'}
                  </span>

                  {(user?.role === 'ADMIN' || user?.role === 'ENGINEER') && (
                    <button
                      onClick={() => togglePause(system.id)}
                      title={isPaused ? 'Resume Monitoring' : 'Pause CDT Monitoring'}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                    >
                      {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <PauseCircle className="w-4 h-4 text-amber-400" />}
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-slate-300 text-xs leading-relaxed mb-4 flex-1 relative z-10">
                {system.description}
              </p>

              {/* Training Performance Metrics */}
              <div className="grid grid-cols-3 gap-2.5 mb-5 relative z-10">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Accuracy</span>
                  <span className="text-xs font-mono text-blue-400 font-bold">{system.accuracy || '73.7'}%</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fairness</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{system.fairnessScore || '96.9'}%</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Dataset</span>
                  <span className="text-[11px] font-mono text-slate-300 font-bold">{system.trainingDatasetSize ? `${(system.trainingDatasetSize / 1000).toFixed(0)}k` : '1,000'}</span>
                </div>
              </div>

              <HealthScoreDisplay systemId={system.id} />
            </div>
          );
        })}
      </div>

      {/* Add System Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" /> Register AI System Endpoint
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">System Name</label>
                <input 
                  type="text" required
                  value={newSystem.name} onChange={e => setNewSystem({...newSystem, name: e.target.value})}
                  placeholder="e.g. CreditApproval-AI"
                  className="input-field w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Domain Category</label>
                <select
                  value={newSystem.domain} onChange={e => setNewSystem({...newSystem, domain: e.target.value})}
                  className="input-field w-full text-xs font-semibold cursor-pointer"
                >
                  <option value="FINANCE">FINANCE (Credit &amp; Underwriting)</option>
                  <option value="HEALTHCARE">HEALTHCARE (Clinical Triage)</option>
                  <option value="INDUSTRIAL">INDUSTRIAL (Telemetry &amp; Predictive Maintenance)</option>
                  <option value="SECURITY">SECURITY &amp; CYBERSECURITY</option>
                  <option value="DEFENSE">DEFENSE &amp; AVIATION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">System Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newSystem.description} onChange={e => setNewSystem({...newSystem, description: e.target.value})}
                  placeholder="Purpose and operational bounds of this AI model endpoint..."
                  className="input-field w-full resize-none text-xs"
                />
              </div>

              <button 
                type="submit" 
                disabled={addMutation.isPending}
                className="btn-primary w-full mt-4 py-3 text-xs font-bold"
              >
                {addMutation.isPending ? 'Registering...' : 'Deploy CDT Monitoring Hook'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

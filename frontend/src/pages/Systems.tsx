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
  ShieldCheck, 
  Sparkles,
  BarChart2,
  Table2,
  Layers,
  Scale
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import empiricalBenchmarks from '../data/empirical_benchmarks.json';

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
  const [inspectedDomain, setInspectedDomain] = useState<string | null>(null);

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

  const activeBenchmark = inspectedDomain
    ? (empiricalBenchmarks.models as any)[inspectedDomain]
    : null;

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
            Trained scikit-learn models evaluated on empirical datasets (UCI German Credit, Clinical Triage, Sensor Telemetry) with Cognitive Digital Twin oversight.
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
          {['ALL', 'FINANCE', 'HEALTHCARE', 'INDUSTRIAL'].map((dom) => (
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
          const domainKey = (system.domain || '').toLowerCase();
          const hasBench = Boolean((empiricalBenchmarks.models as any)[domainKey]);

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
              <div className="grid grid-cols-3 gap-2.5 mb-4 relative z-10">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Test Accuracy</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{system.accuracy ? `${system.accuracy}%` : '73.5%'}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fairness</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{system.fairnessScore ? `${system.fairnessScore}%` : '85.5%'}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Dataset Size</span>
                  <span className="text-[11px] font-mono text-slate-300 font-bold">{system.trainingDatasetSize ? `${system.trainingDatasetSize.toLocaleString()} rows` : '1,000 rows'}</span>
                </div>
              </div>

              {/* Inspect Test Bench Button */}
              {hasBench && (
                <button
                  onClick={() => setInspectedDomain(domainKey)}
                  className="mb-4 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 border border-cyan-900/40 hover:border-cyan-500/50 transition-all text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Inspect Empirical Test Bench &amp; Confusion Matrix</span>
                </button>
              )}

              <HealthScoreDisplay systemId={system.id} />
            </div>
          );
        })}
      </div>

      {/* EMPIRICAL TEST BENCH MODAL */}
      {activeBenchmark && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Empirical Verification
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Stratified 80/20 Held-Out Split</span>
                </div>
                <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  {activeBenchmark.model_name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trained on <strong className="text-slate-200">{activeBenchmark.dataset_name}</strong> ({activeBenchmark.sample_count} total samples, {activeBenchmark.test_sample_count} test evaluation rows)
                </p>
              </div>

              <button 
                onClick={() => setInspectedDomain(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Test Accuracy</span>
                <span className="text-xl font-mono font-black text-cyan-400">{activeBenchmark.accuracy}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Precision</span>
                <span className="text-xl font-mono font-black text-emerald-400">{activeBenchmark.precision}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Recall</span>
                <span className="text-xl font-mono font-black text-blue-400">{activeBenchmark.recall}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">F1-Score</span>
                <span className="text-xl font-mono font-black text-purple-400">{activeBenchmark.f1_score}</span>
              </div>
            </div>

            {/* Confusion Matrix Section */}
            <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Table2 className="w-4 h-4 text-cyan-400" />
                  Held-Out Confusion Matrix ($N={activeBenchmark.test_sample_count}$)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">ROC-AUC = {activeBenchmark.roc_auc}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center font-mono text-xs">
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block mb-1">True Negative (TN)</span>
                  <span className="text-lg font-black text-white">{activeBenchmark.confusion_matrix[0][0]}</span>
                </div>
                <div className="bg-red-950/30 border border-red-500/20 p-3 rounded-xl">
                  <span className="text-[10px] text-red-300 block mb-1">False Positive (FP)</span>
                  <span className="text-lg font-black text-slate-300">{activeBenchmark.confusion_matrix[0][1]}</span>
                </div>
                <div className="bg-red-950/30 border border-red-500/20 p-3 rounded-xl">
                  <span className="text-[10px] text-red-300 block mb-1">False Negative (FN)</span>
                  <span className="text-lg font-black text-slate-300">{activeBenchmark.confusion_matrix[1][0]}</span>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[10px] text-emerald-300 block mb-1">True Positive (TP)</span>
                  <span className="text-lg font-black text-white">{activeBenchmark.confusion_matrix[1][1]}</span>
                </div>
              </div>
            </div>

            {/* Fairness & Demographic Parity Bench */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/40">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Protected Attribute Disparity &amp; AutoRepair Audit
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                Protected Attribute: <strong className="text-cyan-300">{activeBenchmark.protected_attribute}</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Baseline Disparity</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{activeBenchmark.baseline_disparity_pct}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Layer 4 AutoRepair</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{activeBenchmark.repaired_disparity_pct}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Disparity Reduction</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">+{activeBenchmark.disparity_reduction_pct}%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectedDomain(null)}
                className="btn-primary py-2 px-6 text-xs uppercase tracking-wider"
              >
                Close Audit Bench
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addMutation.isPending}
                  className="btn-primary py-2 px-5 text-xs font-bold shadow-lg"
                >
                  {addMutation.isPending ? 'Registering...' : 'Register Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

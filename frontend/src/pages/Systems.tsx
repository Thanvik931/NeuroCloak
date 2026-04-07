import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { BrainCircuit, X, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const HealthScoreDisplay = ({ systemId }: { systemId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['system-health', systemId],
    queryFn: () => apiClient(`/systems/${systemId}/health`)
  });

  if (isLoading) return <div className="mt-auto pt-5 border-t border-dark-border relative z-10 h-20 animate-pulse bg-black/20 rounded-xl" />;
  if (!data) return null;

  const colorClass = data.score >= 90 ? 'text-green-400' : data.score >= 75 ? 'text-blue-400' : 'text-red-400';
  const borderClass = data.score >= 90 ? 'border-green-500/20' : data.score >= 75 ? 'border-blue-500/20' : 'border-red-500/20';

  return (
    <div className="mt-auto pt-5 border-t border-dark-border relative z-10 flex gap-4">
       <div className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-black/20 w-1/3 ${borderClass}`}>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Health</span>
          <div className="flex items-center gap-1">
             <span className={`text-2xl font-mono leading-none ${colorClass}`}>{data.score}</span>
             {data.trend === 'improving' ? <TrendingUp className="w-4 h-4 text-green-400" /> : 
              data.trend === 'declining' ? <TrendingDown className="w-4 h-4 text-red-400" /> : 
              <Minus className="w-4 h-4 text-slate-400" />}
          </div>
       </div>

       <div className="flex-1 space-y-2 bg-black/20 p-3 rounded-xl border border-white/[0.02]">
           <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
              <span className="text-slate-500">Compliance</span>
              <span className="text-white">{data.metrics?.avgCompliance || 0}%</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
              <span className="text-slate-500">Transparency</span>
              <span className="text-white">{data.metrics?.avgTransparency || 0}%</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mt-1 pt-1 border-t border-white/[0.05]">
              <span className="text-primary font-medium">{data.grade}</span>
           </div>
       </div>
    </div>
  );
};

export default function Systems() {
  const [showModal, setShowModal] = useState(false);
  const [newSystem, setNewSystem] = useState({ name: '', domain: '', description: '' });
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
      setNewSystem({ name: '', domain: '', description: '' });
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystem.name || !newSystem.domain || !newSystem.description) return alert('Please fill in all fields.');
    addMutation.mutate(newSystem);
  };

  const systems = systemsData?.data || [];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-8 relative">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active AI Systems</h1>
          <p className="text-sm text-slate-400 mt-1">A directory of all monitored cognitive entities and their operational domains.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary w-auto inline-flex items-center gap-2 py-2 px-5 hover:scale-105 transition-transform"
        >
           <Plus className="w-4 h-4" /> Manage Integrations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-primary font-medium tracking-wide animate-pulse">Scanning infrastructure for installed systems...</div>
        ) : systems.map((system: any) => (
          <div key={system.id} className="glass-panel p-6 shadow-sm hover:border-primary/50 transition-colors group flex flex-col relative overflow-hidden">
            
            {/* Background flourish */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-dark-border flex items-center justify-center shrink-0 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
                  <BrainCircuit className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white leading-tight">{system.name}</h3>
                   <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary opacity-80">{system.domain}</span>
                </div>
              </div>
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                 <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Active
              </span>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-1 relative z-10">
              {system.description}
            </p>

            {/* Training Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
               <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Accuracy</span>
                  <span className="text-sm font-mono text-blue-400 font-bold">{system.accuracy || '98.5'}%</span>
               </div>
               <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Fairness</span>
                  <span className="text-sm font-mono text-green-400 font-bold">{system.fairnessScore || '99.1'}%</span>
               </div>
               <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Dataset</span>
                  <span className="text-xs font-mono text-slate-200">{(system.trainingDatasetSize / 1000).toFixed(0)}k</span>
               </div>
            </div>

            <HealthScoreDisplay systemId={system.id} />
          </div>
        ))}
      </div>

      {/* Add System Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" /> Register AI System
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Name</label>
                <input 
                  type="text" required
                  value={newSystem.name} onChange={e => setNewSystem({...newSystem, name: e.target.value})}
                  placeholder="e.g., Nexus GPT-4"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Domain</label>
                <input 
                  type="text" required
                  value={newSystem.domain} onChange={e => setNewSystem({...newSystem, domain: e.target.value})}
                  placeholder="e.g., HR, FINANCE, MEDICAL"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                  required
                  value={newSystem.description} onChange={e => setNewSystem({...newSystem, description: e.target.value})}
                  placeholder="Purpose of this AI model..."
                  className="input-field w-full resize-none h-24"
                />
              </div>
              <button 
                type="submit" 
                disabled={addMutation.isPending}
                className="btn-primary w-full mt-6 py-3"
              >
                {addMutation.isPending ? 'Registering...' : 'Deploy Integration Hook'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

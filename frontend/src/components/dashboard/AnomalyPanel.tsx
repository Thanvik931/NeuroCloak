import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { AlertOctagon, CheckCircle2, Siren, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';

export default function AnomalyPanel() {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);

  const { data: anomalies = [] } = useQuery({
    queryKey: ['anomalies'],
    queryFn: () => apiClient('/anomalies')
  });

  const [localAnomalies, setLocalAnomalies] = useState<any[]>([]);

  useEffect(() => {
    setLocalAnomalies(anomalies);
  }, [anomalies]);

  useEffect(() => {
    if (!token) return;
    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : window.location.origin;
    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on('anomaly_detected', (newAnomaly: any) => {
      setLocalAnomalies(prev => [newAnomaly, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const handleResolve = async (id: string) => {
    try {
      await apiClient(`/anomalies/${id}/resolve`, { method: 'PATCH' });
      setLocalAnomalies(prev => prev.filter(a => a.id !== id));
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
    } catch (error) {
      console.error('Failed to resolve anomaly', error);
    }
  };

  if (localAnomalies.length === 0) {
    return (
      <div className="glass-panel p-6 shadow-sm flex flex-col items-center justify-center text-center mt-6 min-h-[150px]">
         <ShieldCheck className="w-8 h-8 text-green-500/50 mb-3" />
         <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase">System Nominal</h3>
         <p className="text-xs text-slate-500 mt-1">No active anomalies detected across all AI endpoints.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden shadow-sm mt-6 border border-red-500/20">
      <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
             <Siren className="w-4 h-4 text-red-400 animate-pulse" />
           </div>
           <div>
             <h2 className="text-lg font-bold text-red-500 tracking-tight">Active Anomalies</h2>
             <p className="text-xs text-slate-400">Immediate auditor intervention requested</p>
           </div>
        </div>
        <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
           {localAnomalies.length} Flagged
        </span>
      </div>
      <div className="divide-y divide-dark-border/40 max-h-[300px] overflow-y-auto">
        {localAnomalies.map(anomaly => (
          <div key={anomaly.id} className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors animate-in slide-in-from-top-2">
            <div className="flex gap-4 items-start">
               <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${anomaly.severity === 'critical' ? 'text-red-500' : 'text-orange-400'}`} />
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                     {anomaly.severity}
                   </span>
                   <span className="text-[10px] font-mono text-slate-500">
                     Decision ID: {anomaly.decisionId.substring(0,8)}...
                   </span>
                 </div>
                 <p className="text-sm text-slate-300 font-medium">{anomaly.description}</p>
                 <span className="text-[10px] text-slate-500 block mt-2">
                    {new Date(anomaly.createdAt).toLocaleTimeString()}
                 </span>
               </div>
            </div>
            <button 
              onClick={() => handleResolve(anomaly.id)}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-green-400 hover:bg-green-400/10 px-3 py-1.5 rounded transition-all shrink-0 flex items-center gap-2 border border-transparent hover:border-green-400/20 mt-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

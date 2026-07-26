import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { AlertOctagon, CheckCircle2, Siren, ShieldCheck, Cpu } from 'lucide-react';
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
  const [resolvingId, setResolvingId] = useState<string | null>(null);

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
    setResolvingId(id);
    try {
      await apiClient(`/anomalies/${id}/resolve`, { method: 'PATCH' });
      setLocalAnomalies(prev => prev.filter(a => a.id !== id && a._id !== id));
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
    } catch (error) {
      console.error('Failed to resolve anomaly', error);
      // Fallback local update if offline
      setLocalAnomalies(prev => prev.filter(a => a.id !== id && a._id !== id));
    } finally {
      setResolvingId(null);
    }
  };

  if (localAnomalies.length === 0) {
    return (
      <div className="glass-panel p-6 shadow-sm flex flex-col items-center justify-center text-center mt-6 min-h-[150px] border border-emerald-500/20 bg-emerald-500/5">
        <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
        <h3 className="text-sm font-bold text-white tracking-wider uppercase">System Nominal</h3>
        <p className="text-xs text-slate-400 mt-1">All AI endpoints compliant. Zero active governance alerts.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden shadow-sm mt-6 border border-red-500/30">
      <div className="p-4 border-b border-red-500/20 bg-red-500/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Siren className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-400 tracking-tight">Active Anomalies &amp; Audit Flags</h2>
            <p className="text-xs text-slate-400">Immediate auditor intervention requested</p>
          </div>
        </div>
        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
          {localAnomalies.length} FLAGGED
        </span>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-[340px] overflow-y-auto">
        {localAnomalies.map((anomaly, idx) => {
          const alertId = anomaly.id || anomaly._id || `alert-${idx}`;
          const isCritical = (anomaly.severity || '').toLowerCase() === 'critical';
          const messageText = anomaly.message || anomaly.description || anomaly.type || 'Demographic disparity alert detected';
          const decisionId = anomaly.decisionId ? (typeof anomaly.decisionId === 'string' ? anomaly.decisionId : (anomaly.decisionId._id || '')) : '';
          const systemName = anomaly.aiSystemId?.name || anomaly.aiSystemName || 'CreditApproval-AI';

          return (
            <div 
              key={alertId} 
              className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex gap-3.5 items-start flex-1 min-w-0">
                <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {anomaly.severity || 'WARNING'}
                    </span>

                    {systemName && (
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700">
                        <Cpu className="w-3 h-3 text-primary" />
                        <span>{systemName}</span>
                      </span>
                    )}

                    {decisionId && (
                      <span className="text-[10px] font-mono text-slate-400">
                        Decision ID: {decisionId.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  {/* High-Contrast Message Description */}
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed break-words">
                    {messageText}
                  </p>

                  <span className="text-[10px] text-slate-500 block font-mono">
                    {anomaly.createdAt ? new Date(anomaly.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => handleResolve(alertId)}
                disabled={resolvingId === alertId}
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-emerald-400 bg-slate-800 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 border border-slate-700 hover:border-emerald-500/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{resolvingId === alertId ? 'Resolving...' : 'RESOLVE'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

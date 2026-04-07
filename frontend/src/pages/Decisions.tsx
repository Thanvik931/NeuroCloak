import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { BrainCircuit, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Decisions() {
  const [page, setPage] = useState(1);
  const [systemFilter, setSystemFilter] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: systemsData } = useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient('/systems')
  });
  const systems = systemsData?.data || [];

  const { data: decData, isLoading } = useQuery({
    queryKey: ['decisions', page, systemFilter],
    queryFn: () => {
      let url = `/decisions?page=${page}&limit=10`;
      if (systemFilter) url += `&aiSystemId=${systemFilter}`;
      return apiClient(url);
    }
  });

  const flagMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/decisions/${id}/flag`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-decisions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
    }
  });

  const handleFlag = (id: string) => {
    if (confirm('Are you sure you want to officially flag this AI decision for human auditor review?')) {
      flagMutation.mutate(id);
    }
  };

  const decisions = decData?.data || [];
  const meta = decData?.meta || { totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Decision Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">Historical reasoning logs for all deployed models</p>
        </div>
        
        <div className="flex items-center gap-3 bg-dark-sidebar p-2.5 rounded-xl border border-dark-border shadow-sm">
          <Filter className="w-4 h-4 text-primary ml-2" />
          <div className="relative">
            <select 
              value={systemFilter} 
              onChange={(e) => {
                setSystemFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none text-sm font-semibold tracking-wide text-white w-56 appearance-none cursor-pointer"
            >
              <option value="">All Source Systems</option>
              {systems.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-400 uppercase bg-black/30 border-b border-dark-border tracking-widest font-bold">
              <tr>
                <th className="px-6 py-5">Audit ID</th>
                <th className="px-6 py-5">Origin System</th>
                <th className="px-6 py-5 w-1/3">Final Decision Output</th>
                <th className="px-6 py-5">Compliance</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-medium tracking-wide text-primary animate-pulse">Fetching global audit logs...</td></tr>
              ) : decisions.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-medium tracking-wide text-slate-400">No records found matching current filters.</td></tr>
              ) : decisions.map((d: any) => (
                <tr key={d.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-5 font-mono text-slate-500 text-xs hover:text-primary transition-colors">
                    <Link to={`/decisions/${d.id}`} className="font-bold underline decoration-primary/50 underline-offset-4">{d.id.slice(0,8)}</Link>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <BrainCircuit className="w-4 h-4 text-primary opacity-80" />
                      <span className="font-semibold text-slate-200">{d.aiSystem.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-slate-300 truncate font-medium max-w-[300px]">{d.outputDecision}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <span className={d.ethicalComplianceRate < 0.8 ? "text-yellow-400 font-bold font-mono" : "text-green-400 font-mono"}>
                         {(d.ethicalComplianceRate * 100).toFixed(0)}%
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <Badge status={d.status} />
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-[11px] font-mono whitespace-nowrap tracking-tight">
                    {new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') ? (
                      d.status !== 'FLAGGED' ? (
                        <button 
                          onClick={() => handleFlag(d.id)}
                          className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 hover:scale-105 px-3 py-1.5 rounded border border-yellow-500/20 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <AlertTriangle className="w-3 h-3" /> Override
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3">Flagged</span>
                      )
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 px-3">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-dark-border bg-black/20 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            Showing Page <span className="text-white">{page}</span> of <span className="text-white">{meta.totalPages}</span>
            <span className="ml-2 text-xs opacity-50">({meta.total} total records)</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-dark-sidebar border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || meta.totalPages === 0}
              className="p-2 rounded-lg bg-dark-sidebar border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

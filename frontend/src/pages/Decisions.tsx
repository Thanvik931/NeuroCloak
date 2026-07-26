import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { 
  BrainCircuit, 
  Filter, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Eye,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Decisions() {
  const [page, setPage] = useState(1);
  const [systemFilter, setSystemFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: systemsData } = useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient('/systems')
  });
  const systems = systemsData?.data || [];

  const { data: decData, isLoading } = useQuery({
    queryKey: ['decisions', page, systemFilter, statusFilter, searchQuery],
    queryFn: () => {
      let url = `/decisions?page=${page}&limit=10`;
      if (systemFilter) url += `&aiSystemId=${systemFilter}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
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

  const rawDecisions = decData?.data || [];
  const meta = decData?.meta || { totalPages: 1, total: 0 };

  // Client-side search filtering
  const decisions = rawDecisions.filter((d: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.outputDecision.toLowerCase().includes(q) ||
      d.aiSystem?.name?.toLowerCase().includes(q)
    );
  });

  // Calculate summary counts
  const approvedCount = rawDecisions.filter((d: any) => d.status === 'APPROVED').length;
  const flaggedCount = rawDecisions.filter((d: any) => d.status === 'FLAGGED').length;
  const blockedCount = rawDecisions.filter((d: any) => d.status === 'BLOCKED').length;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-8 font-sans">
      
      {/* Header & Summary Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Immutable Audit Log</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Global Decision Audit Console</h1>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
            Historical reasoning traces and compliance scores for all deployed model endpoints.
          </p>
        </div>

        {/* Audit Stats Quick Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audit Logs</span>
            <span className="text-lg font-black text-white font-mono">{meta.total || rawDecisions.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Approved</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{approvedCount}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Flagged / Blocked</span>
            <span className="text-lg font-black text-amber-400 font-mono">{flaggedCount + blockedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Audit ID, system name, or decision output..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
          />
        </div>

        {/* Source System Filter */}
        <div className="md:col-span-4 relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <Filter className="w-4 h-4 text-primary shrink-0" />
            <select
              value={systemFilter}
              onChange={(e) => {
                setSystemFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none text-xs font-semibold text-white w-full appearance-none cursor-pointer"
            >
              <option value="">All Origin AI Systems</option>
              {systems.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.domain})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="md:col-span-3 flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['ALL', 'APPROVED', 'FLAGGED', 'BLOCKED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === st ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Decisions Data Table */}
      <div className="glass-panel overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Audit ID</th>
                <th className="px-6 py-4">Origin AI System</th>
                <th className="px-6 py-4 w-1/3">Final Decision Verdict</th>
                <th className="px-6 py-4">Ethical Compliance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-bold tracking-wide text-primary animate-pulse">Fetching decision audit logs from database...</td></tr>
              ) : decisions.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-medium tracking-wide text-slate-400">No decision audit records found matching current query.</td></tr>
              ) : decisions.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                    <Link to={`/decisions/${d.id}`} className="font-bold text-white hover:text-primary underline decoration-primary/50 underline-offset-4 flex items-center gap-1.5">
                      <span>{d.id.slice(0, 8)}...</span>
                      <Eye className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-primary shrink-0 opacity-80" />
                      <div>
                        <span className="font-bold text-white block">{d.aiSystem?.name || 'CreditApproval-AI'}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{d.aiSystem?.domain || 'FINANCE'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-200 font-medium max-w-[280px] truncate leading-relaxed">
                      {d.outputDecision}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden shrink-0">
                        <div 
                          className={`h-full ${d.ethicalComplianceRate >= 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                          style={{ width: `${d.ethicalComplianceRate * 100}%` }}
                        />
                      </div>
                      <span className={`font-mono font-bold text-xs ${d.ethicalComplianceRate < 0.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {(d.ethicalComplianceRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/decisions/${d.id}`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all border border-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-primary" />
                        <span>Inspect</span>
                      </Link>

                      {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') ? (
                        d.status !== 'FLAGGED' ? (
                          <button 
                            onClick={() => handleFlag(d.id)}
                            className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition-all flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" /> Flag
                          </button>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2">Flagged</span>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-400">
            Showing Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{meta.totalPages}</span>
            <span className="ml-2 text-slate-500">({meta.total} total records)</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || meta.totalPages === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

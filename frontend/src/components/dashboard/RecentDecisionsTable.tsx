import { Badge, cn } from '../ui/Badge';
import { BrainCircuit } from 'lucide-react';

interface Decision {
  id: string;
  aiSystem: { name: string; domain: string };
  outputDecision: string;
  ethicalComplianceRate: number;
  status: 'APPROVED' | 'FLAGGED' | 'BLOCKED' | 'PENDING';
  createdAt: string;
}

export default function RecentDecisionsTable({ decisions = [] }: { decisions: Decision[] }) {
  if (!decisions.length) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Loading recent decisions from database...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left relative">
        <thead className="text-[11px] text-slate-400 uppercase bg-black/20 border-b border-dark-border tracking-widest font-semibold sticky top-0 z-10 backdrop-blur-md">
          <tr>
            <th className="px-6 py-4">Audit ID</th>
            <th className="px-6 py-4">Origin System</th>
            <th className="px-6 py-4">Final Decision</th>
            <th className="px-6 py-4">Compliance Check</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border/50">
          {decisions.map((d) => {
             // Calculate if decision was created in the last 15 seconds!
             const isNew = new Date().getTime() - new Date(d.createdAt).getTime() < 15000;
             
             return (
               <tr 
                 key={d.id} 
                 className={cn(
                   "hover:bg-white/[0.04] transition-colors group cursor-pointer animate-in fade-in slide-in-from-top-4 duration-500",
                   isNew && "animate-flash-row"
                 )}
               >
                 <td className="px-6 py-4 font-mono text-slate-500 text-xs">{d.id.slice(0,8)}</td>
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-2.5">
                     <BrainCircuit className={cn("w-4 h-4 group-hover:animate-pulse", isNew ? "text-green-400" : "text-primary")} />
                     <span className="font-semibold text-slate-200">{d.aiSystem.name}</span>
                   </div>
                   <div className="text-[10px] text-primary/80 uppercase tracking-widest font-bold ml-6.5 mt-0.5">{d.aiSystem.domain}</div>
                 </td>
                 <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate font-medium">{d.outputDecision}</td>
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-24 h-1.5 bg-dark-border rounded-full overflow-hidden flex-1">
                       <div 
                         className={cn("h-full transition-all duration-1000 ease-out", isNew ? "bg-green-400" : "bg-primary")} 
                         style={{ width: `${d.ethicalComplianceRate * 100}%` }}
                       />
                     </div>
                     <span className="text-xs text-slate-400 font-mono w-8">{(d.ethicalComplianceRate * 100).toFixed(0)}%</span>
                   </div>
                 </td>
                 <td className="px-6 py-4"><Badge status={d.status} /></td>
                 <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap font-mono tracking-tight">
                   {new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                 </td>
               </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
}

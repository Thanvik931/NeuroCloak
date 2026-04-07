import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { generateAuditReport } from '../lib/pdfExport';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Download, Play, Pause, RotateCcw } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export default function DecisionDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(-1);
  const [speed, setSpeed] = useState<number>(500);

  const { data: decision, isLoading } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => apiClient(`/decisions/${id}`)
  });

  const totalSteps = decision?.reasoningTrace?.length || 0;

  useEffect(() => {
    if (decision && replayIndex === -1) {
      setReplayIndex(totalSteps);
    }
  }, [decision, totalSteps, replayIndex]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && replayIndex < totalSteps) {
      timer = setTimeout(() => {
        setReplayIndex(prev => prev + 1);
      }, speed);
    } else if (replayIndex >= totalSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, replayIndex, speed, totalSteps]);

  const handlePlayPause = () => {
    if (replayIndex >= totalSteps) {
      setReplayIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const visibleSteps = decision?.reasoningTrace
    ? [...decision.reasoningTrace].sort((a: any, b: any) => a.stepNumber - b.stepNumber).slice(0, replayIndex === -1 ? totalSteps : replayIndex)
    : [];

  if (isLoading) return <div className="p-8 text-primary animate-pulse font-bold tracking-widest text-center">Decrypting cognitive trace...</div>;
  if (!decision) return <div className="p-8 text-slate-500 text-center">Audit record not found.</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Link to="/decisions" className="text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Global Log
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
            Audit Record <span className="text-slate-500 font-mono text-sm px-2 py-1 bg-black/20 rounded-md border border-dark-border">{decision.id}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            AI System: <strong className="text-white">{decision.aiSystem?.name}</strong> • Runtime Domain: <span className="text-primary">{decision.aiSystem?.domain}</span>
          </p>
        </div>
        
        <button 
          onClick={() => generateAuditReport(decision, user?.email)} 
          className="btn-primary flex items-center gap-2 py-2 px-6 hover:scale-105 transition-transform bg-primary"
        >
          <Download className="w-4 h-4" /> Export Audit Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="glass-panel p-6 shadow-sm col-span-1 md:col-span-3">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Final System Output</h3>
           <p className="text-lg font-medium text-white bg-black/20 p-4 rounded-xl border border-dark-border">{decision.outputDecision}</p>
         </div>
         <div className="glass-panel p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Resolution</h3>
            <Badge status={decision.status} />
         </div>
      </div>

      {/* METRICS ROW */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-10 mb-4 border-b border-dark-border pb-2">Cognitive Verification Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Confidence", val: (decision.confidenceScore * 100).toFixed(1) + '%' },
          { label: "Consistency", val: (decision.cognitiveConsistency * 100).toFixed(1) + '%' },
          { label: "Transparency", val: (decision.transparencyIndex * 100).toFixed(1) + '%' },
          { label: "Ethical Match", val: (decision.ethicalComplianceRate * 100).toFixed(1) + '%' },
          { label: "Latency", val: decision.adaptationSpeed + 'ms' },
        ].map((m, i) => (
          <div key={i} className="glass-panel p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
            <p className="text-xl font-mono text-white">{m.val}</p>
          </div>
        ))}
      </div>

      {/* REASONING TRACE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 mb-4 border-b border-dark-border pb-2 gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Reasoning Trace</h3>
        
        {/* REPLAY CONTROLS */}
        <div className="flex items-center gap-4 bg-dark-bg/80 px-4 py-2 rounded-lg border border-dark-border shadow-inner">
          <button onClick={handlePlayPause} className="text-primary hover:text-white transition-colors" title={isPlaying ? "Pause Replay" : "Play/Restart Replay"}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button onClick={() => { setIsPlaying(false); setReplayIndex(totalSteps); }} className="text-slate-500 hover:text-white transition-colors" title="Skip to End">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-slate-700 mx-1" />
          
          <div className="flex gap-1 text-[10px] font-bold tracking-widest uppercase">
            {[{ label: 'x0.5', val: 1500 }, { label: 'x1', val: 500 }, { label: 'x2', val: 150 }].map(s => (
              <button 
                key={s.label} 
                onClick={() => setSpeed(s.val)}
                className={`px-2 py-1 rounded transition-colors ${speed === s.val ? 'bg-primary border border-primary/50 text-white' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <span className="text-[10px] font-mono font-bold text-slate-400 w-12 text-center">
             {replayIndex === -1 ? totalSteps : replayIndex} / {totalSteps}
          </span>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-slate-400 uppercase bg-black/30 border-b border-dark-border tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Step</th>
              <th className="px-6 py-4">Layer</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40">
            {visibleSteps.map((step: any) => (
               <tr key={step.id} className="hover:bg-white/[0.02] animate-in fade-in slide-in-from-left-2 duration-300">
                 <td className="px-6 py-4 font-mono text-primary font-bold">{step.stepNumber}</td>
                 <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{step.layer}</td>
                 <td className="px-6 py-4 text-slate-300 font-medium">{step.description}</td>
                 <td className="px-6 py-4 font-mono text-xs text-slate-500">{step.durationMs}ms</td>
               </tr>
            ))}
            {visibleSteps.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">Awaiting simulation payload...</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

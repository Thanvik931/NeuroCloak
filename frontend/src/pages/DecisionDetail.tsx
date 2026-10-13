import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { generateAuditReport } from '../lib/pdfExport';
import { useAuthStore } from '../store/authStore';
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { MarkdownContent } from '../components/chat/MarkdownContent';

export default function DecisionDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(-1);
  const [speed, setSpeed] = useState<number>(500);

  // Gemini Governance AI state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [auditVerified, setAuditVerified] = useState<boolean | null>(null);

  const { data: decision, isLoading } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => apiClient(`/decisions/${id}`),
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

  const handleAuditWithAI = async () => {
    if (!id || isAuditing) return;
    setIsAuditing(true);
    try {
      const res = await apiClient(`/decisions/${id}/verify`, { method: 'POST' });
      setAuditReport(res.explanation || res.data?.commentary || 'Audit analysis complete.');
      setAuditVerified(res.verified ?? true);
    } catch (e: any) {
      setAuditReport(
        '⚠️ **Audit Engine Notice:** Live Gemini analysis failed to connect to backend telemetry. ' +
        'Please verify that your NeuroCloak server is running.'
      );
      setAuditVerified(false);
    } finally {
      setIsAuditing(false);
    }
  };

  const visibleSteps = decision?.reasoningTrace
    ? [...decision.reasoningTrace]
        .sort((a: any, b: any) => a.stepNumber - b.stepNumber)
        .slice(0, replayIndex === -1 ? totalSteps : replayIndex)
    : [];

  if (isLoading)
    return (
      <div className="p-8 text-cyan-400 animate-pulse font-bold tracking-widest text-center">
        Decrypting cognitive trace...
      </div>
    );
  if (!decision)
    return <div className="p-8 text-slate-500 text-center">Audit record not found.</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Link
        to="/decisions"
        className="text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Global Log
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
            Audit Record{' '}
            <span className="text-slate-500 font-mono text-sm px-2 py-1 bg-black/20 rounded-md border border-dark-border">
              {decision.id}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            AI System: <strong className="text-white">{decision.aiSystem?.name}</strong> • Runtime
            Domain: <span className="text-cyan-400">{decision.aiSystem?.domain}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAuditWithAI}
            disabled={isAuditing}
            className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 border border-cyan-400/40 disabled:opacity-50"
          >
            {isAuditing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            )}
            {isAuditing ? 'Auditing Trace...' : 'Audit with Gemini AI'}
          </button>

          <button
            onClick={() => generateAuditReport(decision, user?.email)}
            className="btn-primary flex items-center gap-2 py-2 px-5 hover:scale-105 transition-transform bg-primary text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* GEMINI AI AUDIT REPORT CARD */}
      {auditReport && (
        <div className="glass-panel p-6 border border-cyan-500/30 bg-slate-950/80 shadow-[0_10px_40px_rgba(6,182,212,0.15)] rounded-2xl animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Gemini Neuro-Symbolic Governance Audit
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 border ${
                  auditVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {auditVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED COMPLIANT
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> VERIFICATION WARNING
                  </>
                )}
              </span>
            </div>
            <button
              onClick={() => setAuditReport(null)}
              className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Dismiss audit card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <MarkdownContent content={auditReport} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 shadow-sm col-span-1 md:col-span-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Final System Output
          </h3>
          <p className="text-lg font-medium text-white bg-black/20 p-4 rounded-xl border border-dark-border">
            {decision.outputDecision}
          </p>
        </div>
        <div className="glass-panel p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Resolution
          </h3>
          <Badge status={decision.status} />
        </div>
      </div>

      {/* METRICS ROW */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-10 mb-4 border-b border-dark-border pb-2">
        Cognitive Verification Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Confidence', val: (decision.confidenceScore * 100).toFixed(1) + '%' },
          { label: 'Consistency', val: (decision.cognitiveConsistency * 100).toFixed(1) + '%' },
          { label: 'Transparency', val: (decision.transparencyIndex * 100).toFixed(1) + '%' },
          { label: 'Ethical Match', val: (decision.ethicalComplianceRate * 100).toFixed(1) + '%' },
          { label: 'Latency', val: decision.adaptationSpeed + 'ms' },
        ].map((m, i) => (
          <div key={i} className="glass-panel p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {m.label}
            </p>
            <p className="text-xl font-mono text-white">{m.val}</p>
          </div>
        ))}
      </div>

      {/* REASONING TRACE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 mb-4 border-b border-dark-border pb-2 gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Reasoning Trace
        </h3>

        {/* REPLAY CONTROLS */}
        <div className="flex items-center gap-4 bg-dark-bg/80 px-4 py-2 rounded-lg border border-dark-border shadow-inner">
          <button
            onClick={handlePlayPause}
            className="text-primary hover:text-white transition-colors"
            title={isPlaying ? 'Pause Replay' : 'Play/Restart Replay'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setReplayIndex(totalSteps);
            }}
            className="text-slate-500 hover:text-white transition-colors"
            title="Skip to End"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <div className="flex gap-1 text-[10px] font-bold tracking-widest uppercase">
            {[
              { label: 'x0.5', val: 1500 },
              { label: 'x1', val: 500 },
              { label: 'x2', val: 150 },
            ].map(s => (
              <button
                key={s.label}
                onClick={() => setSpeed(s.val)}
                className={`px-2 py-1 rounded transition-colors ${
                  speed === s.val
                    ? 'bg-primary border border-primary/50 text-white'
                    : 'border border-transparent text-slate-500 hover:text-slate-300'
                }`}
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
              <tr
                key={step.id || step.stepNumber}
                className="hover:bg-white/[0.02] animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{step.stepNumber}</td>
                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {step.layer}
                </td>
                <td className="px-6 py-4 text-slate-300 font-medium">{step.description}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{step.durationMs}ms</td>
              </tr>
            ))}
            {visibleSteps.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                  Awaiting simulation payload...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

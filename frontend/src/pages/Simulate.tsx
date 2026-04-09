import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Play, Loader2, CheckCircle2, AlertTriangle, XCircle, BrainCircuit, Swords, Trophy } from 'lucide-react';
import { Badge, cn } from '../components/ui/Badge';

export default function Simulate() {
  const [selectedSystem, setSelectedSystem] = useState('');
  const [inputData, setInputData] = useState('{\n  "age": 45,\n  "history": "clean",\n  "amount_requested": 50000\n}');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);

  // Feature 1: Battle Mode State
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [biasSlider, setBiasSlider] = useState(50);
  const [battleResults, setBattleResults] = useState<any[]>([]);
  const [battleTick, setBattleTick] = useState(0);
  const [isBattlePending, setIsBattlePending] = useState(false);

  // Fetch systems
  const { data: systemsData } = useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient('/systems')
  });
  const systems = systemsData?.data || [];

  // Standard Mutation
  const simulateMutation = useMutation({
    mutationFn: async (payload: any) => apiClient('/decisions/simulate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: (data) => {
      setSimulationResult(data);
      setVisibleSteps(0);
    }
  });

  // Regular Stagger Effect
  useEffect(() => {
    if (!isBattleMode && simulationResult && simulationResult.reasoningTrace) {
      if (visibleSteps < simulationResult.reasoningTrace.length) {
        const timer = setTimeout(() => {
          setVisibleSteps(prev => prev + 1);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [simulationResult, visibleSteps, isBattleMode]);

  // Battle Mode Stagger Effect (150ms)
  useEffect(() => {
    if (isBattleMode && battleResults.length === 3 && battleResults.every(r => r !== null)) {
      const maxSteps = Math.max(...battleResults.map(r => r.reasoningTrace.length));
      if (battleTick < maxSteps) {
        const timer = setTimeout(() => {
          setBattleTick(prev => prev + 1);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [battleResults, battleTick, isBattleMode]);

  // Handlers
  const handleSimulate = () => {
    if (!selectedSystem) return alert('Select an AI System to audit first.');
    try {
      const parsed = JSON.parse(inputData);
      setSimulationResult(null); // Reset for animation
      simulateMutation.mutate({ aiSystemId: selectedSystem, inputData: parsed });
    } catch(e) {
      alert('Invalid JSON in Input Data.');
    }
  };

  const handleBattleRun = async () => {
    if (systems.length < 3) return alert("Need at least 3 systems registered for Battle Mode.");
    try {
      const parsed = JSON.parse(inputData);
      // inject bias setting for backend dynamics if applicable
      parsed._bias_injection_probability = biasSlider / 100;
      
      setBattleResults([]);
      setBattleTick(0);
      setIsBattlePending(true);
      
      const targetSystems = systems.slice(0, 3);
      const promises = targetSystems.map((s: any) => 
         apiClient('/decisions/simulate', { method: 'POST', body: JSON.stringify({ aiSystemId: s.id, inputData: parsed }) })
      );
      
      const results = await Promise.all(promises);
      setBattleResults(results);
    } catch(e) {
      alert('Invalid JSON in Input Data.');
    } finally {
      setIsBattlePending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'APPROVED': return <CheckCircle2 className="w-8 h-8 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-full shrink-0" />;
      case 'FLAGGED': return <AlertTriangle className="w-8 h-8 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] rounded-full shrink-0" />;
      case 'BLOCKED': return <XCircle className="w-8 h-8 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] rounded-full shrink-0" />;
      default: return <BrainCircuit className="w-8 h-8 text-slate-400 shrink-0" />;
    }
  };

  // Winners Logic
  const battleFinished = isBattleMode && battleResults.length === 3 && battleTick >= Math.max(...battleResults.map(r => r.reasoningTrace.length));
  let mostEthical = { name: '', score: -1 };
  let fastest = { name: '', time: 9999999 };
  let mostTransparent = { name: '', score: -1 };

  if (battleFinished) {
    battleResults.forEach((r, i) => {
      const sysName = systems[i].name;
      const totalMs = r.reasoningTrace.reduce((acc: number, step: any) => acc + step.durationMs, 0);
      if (r.ethicalComplianceRate > mostEthical.score) { mostEthical = { name: sysName, score: r.ethicalComplianceRate }; }
      if (totalMs < fastest.time) { fastest = { name: sysName, time: totalMs }; }
      if (r.transparencyIndex > mostTransparent.score) { mostTransparent = { name: sysName, score: r.transparencyIndex }; }
    });
  }

  // Render Battle Column
  const renderBattleColumn = (sys: any, result: any) => {
    return (
      <div key={sys.id} className="glass-panel p-4 flex flex-col h-full bg-slate-900/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
          <div>
            <h3 className="font-bold text-white tracking-tight">{sys.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{sys.domain}</span>
          </div>
          <BrainCircuit className="w-5 h-5 text-primary opacity-50" />
        </div>

        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {isBattlePending ? (
              <>
                 <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                 <span className="text-primary font-bold tracking-widest uppercase text-xs">Simulating Cognitive Load...</span>
              </>
            ) : (
              <>
                 <BrainCircuit className="w-10 h-10 text-slate-600 mb-4 opacity-30" />
                 <span className="text-slate-400 text-sm font-medium">Awaiting engagement.</span>
                 <span className="text-slate-500 text-xs mt-2">Click <strong>Run Battle Analysis</strong> above to execute inference on this model.</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 relative">
             <div className="flex items-center justify-between mb-2">
               <Badge status={result.status} />
               <span className="text-xs font-mono text-slate-400">Confidence: {(result.confidenceScore * 100).toFixed(0)}%</span>
             </div>

             <div className="space-y-3 pl-3 border-l border-slate-700">
                {result.reasoningTrace.slice(0, battleTick).map((step: any) => (
                  <div key={step.id || step.stepNumber} className="relative animate-in slide-in-from-left-2 fade-in duration-300">
                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-dark-bg" />
                    <div className="bg-slate-800/80 rounded p-2 text-[11px] text-slate-300">
                      <span className="text-primary font-bold mr-1">[{step.stepNumber}]</span>
                      {step.description}
                    </div>
                  </div>
                ))}
             </div>

             {battleTick >= result.reasoningTrace.length && (
               <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 animate-in fade-in duration-500">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                      <span className="text-slate-400">Compliance</span>
                      <span className="text-green-400">{(result.ethicalComplianceRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${result.ethicalComplianceRate * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                      <span className="text-slate-400">Transparency</span>
                      <span className="text-blue-400">{(result.transparencyIndex * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${result.transparencyIndex * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                     <span className="text-[10px] font-bold uppercase text-red-400">Bias Flags</span>
                     <span className="font-mono text-red-400 font-bold">{result.biasFlags?.length || 0}</span>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("gap-8", isBattleMode ? "flex flex-col mb-16" : "grid grid-cols-1 lg:grid-cols-2 h-full min-h-[800px] lg:min-h-0")}>
      
      {/* Configuration Header / Column */}
      <div className={cn("glass-panel p-6 flex", isBattleMode ? "flex-col gap-4 shrink-0" : "flex-col h-full overflow-y-auto custom-scrollbar")}>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 w-full col-span-full gap-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" /> Configuration
          </h2>
          
          {/* FEATURE 1: Battle Mode Toggle */}
          <button 
            onClick={() => setIsBattleMode(!isBattleMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-xs font-bold uppercase tracking-widest",
              isBattleMode 
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300"
            )}
          >
            <Swords className="w-4 h-4" /> Battle Mode {isBattleMode ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className={cn("flex flex-1 gap-6", isBattleMode ? "flex-col lg:flex-row items-center w-full" : "flex-col")}>
          
          {!isBattleMode && (
            <div className="space-y-2 w-full">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Target AI System</label>
              <div className="relative">
                <select 
                  value={selectedSystem} 
                  onChange={(e) => {
                     setSelectedSystem(e.target.value);
                     setSimulationResult(null); 
                  }}
                  className="input-field appearance-none cursor-pointer bg-dark-bg transition-colors hover:border-primary/50 w-full"
                >
                  <option value="" disabled>-- Select System to Audit --</option>
                  {systems.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.domain})</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          )}

          <div className={cn("space-y-2 flex flex-col", isBattleMode ? "flex-1" : "flex-1 pt-4")}>
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Inference Scenario (JSON)</label>
            <textarea 
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className={cn("input-field font-mono text-sm leading-relaxed w-full resize-none bg-dark-bg/50 border-dark-border/80 focus:bg-dark-bg focus:border-primary", isBattleMode ? "h-32" : "flex-1 min-h-[300px]")}
              spellCheck="false"
            />
          </div>

          {isBattleMode && (
            <div className="space-y-4 w-1/3 flex flex-col justify-center px-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex justify-between">
                <span>Bias Probability</span>
                <span className="text-primary">{biasSlider}%</span>
              </label>
              <input 
                type="range" min="0" max="100" 
                value={biasSlider} onChange={(e) => setBiasSlider(Number(e.target.value))}
                className="w-full accent-primary bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        <button 
          onClick={isBattleMode ? handleBattleRun : handleSimulate}
          disabled={(isBattleMode ? isBattlePending : simulateMutation.isPending) || (!isBattleMode && !selectedSystem)}
          className={cn("btn-primary text-lg py-3.5 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20 disabled:shadow-none disabled:opacity-50", isBattleMode ? "w-64 self-end shrink-0" : "w-full mt-8")}
        >
          {(isBattleMode ? isBattlePending : simulateMutation.isPending) ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isBattleMode ? (
            <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          ) : (
            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
          <span className="font-semibold tracking-wide">
             {(isBattleMode ? isBattlePending : simulateMutation.isPending) 
                 ? 'Processing...' 
                 : isBattleMode ? 'Run Battle Analysis' : 'Run Diagnostics'}
          </span>
        </button>
      </div>

      {/* Output Area */}
      {isBattleMode ? (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
             {systems.map((sys: any, idx: number) => renderBattleColumn(sys, battleResults[idx]))}
          </div>

          {/* Winner Banner */}
          {battleFinished && (
            <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-600/20 to-yellow-900/40 border border-yellow-500/50 rounded-xl p-4 flex justify-between items-center shadow-[0_0_30px_rgba(234,179,8,0.15)] animate-in slide-in-from-bottom-8 duration-700 shrink-0">
              <div className="flex items-center gap-4">
                <Trophy className="w-10 h-10 text-yellow-500" />
                <div>
                  <h3 className="text-yellow-500 font-bold tracking-widest uppercase text-sm">Battle Results</h3>
                  <p className="text-yellow-200/80 text-xs">Simultaneous multi-model inference completed.</p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest mb-1">Most Ethical</p>
                  <p className="text-white font-semibold text-sm">{mostEthical.name}</p>
                  <p className="text-green-400 font-mono text-xs">{(mostEthical.score * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest mb-1">Fastest Speculation</p>
                  <p className="text-white font-semibold text-sm">{fastest.name}</p>
                  <p className="text-blue-400 font-mono text-xs">{fastest.time}ms</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest mb-1">Translucency Leader</p>
                  <p className="text-white font-semibold text-sm">{mostTransparent.name}</p>
                  <p className="text-purple-400 font-mono text-xs">{(mostTransparent.score * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-6 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between tracking-tight">
            <span>Live Inference Trace</span>
            <div className="h-6">
              {simulationResult && <Badge status={simulationResult.status} />}
            </div>
          </h2>

          {!simulationResult && !simulateMutation.isPending && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-dark-border/50 rounded-xl bg-black/10">
               <BrainCircuit className="w-16 h-16 mb-6 opacity-30" />
               <p className="font-medium tracking-wide">Awaiting simulation payload...</p>
             </div>
          )}

          {simulateMutation.isPending && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
              <div className="relative">
                <BrainCircuit className="w-20 h-20 opacity-20 absolute inset-0 animate-ping" />
                <BrainCircuit className="w-20 h-20 relative z-10" />
              </div>
              <p className="mt-8 font-semibold tracking-widest uppercase text-sm animate-pulse">Initializing Context...</p>
            </div>
          )}

          {simulationResult && (
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar pb-6 relative">
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase sticky top-0 bg-dark-card/90 backdrop-blur pb-2 z-10">
                  Cognitive Execution Steps
                </h3>
                <div className="space-y-4 relative pl-5 border-l-2 border-slate-700/50 ml-2">
                  {simulationResult.reasoningTrace.slice(0, visibleSteps).map((step: any) => (
                    <div key={step.id || step.stepNumber} className="relative animate-in slide-in-from-left-8 fade-in duration-500">
                      <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-dark-card shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                      <div className="bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors rounded-xl p-4 text-sm text-slate-300 shadow-sm leading-relaxed">
                        <span className="font-mono text-primary font-semibold mr-3">[{String(step.stepNumber).padStart(2, '0')}]</span>
                        {step.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {visibleSteps >= simulationResult.reasoningTrace.length && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards space-y-6 pt-6 border-t border-slate-700/50 mt-8">
                  <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">System Resolution</h3>
                  <div className="bg-black/30 rounded-2xl p-6 border border-slate-700/50 flex items-start gap-5 shadow-inner">
                    <div className="mt-1 shrink-0 animate-in zoom-in duration-500 delay-500">
                      {getStatusIcon(simulationResult.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-white mb-4 leading-tight">{simulationResult.outputDecision}</p>
                      <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-700/50">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Model Confidence</p>
                          <p className="text-2xl font-mono text-white">{(simulationResult.confidenceScore * 100).toFixed(1)}<span className="text-sm text-slate-500">%</span></p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl hidden sm:block">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Ethical Alignment</p>
                          <p className="text-2xl font-mono text-green-400">{(simulationResult.ethicalComplianceRate * 100).toFixed(1)}<span className="text-sm text-green-900">%</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {simulationResult.biasFlags?.length > 0 && (
                    <div className="space-y-3 mt-6 animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-backwards">
                      <h3 className="text-[11px] font-bold tracking-[0.2em] text-red-500 uppercase flex items-center gap-2">
                         <AlertTriangle className="w-3.5 h-3.5" /> Detected Drift / Bias
                      </h3>
                      <div className="space-y-3">
                        {simulationResult.biasFlags.map((flag: any, i: number) => (
                          <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm">
                             <span className="font-medium leading-relaxed">{flag.description}</span>
                             <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-80 shrink-0 bg-red-500/20 px-2.5 py-1 rounded-full">{flag.severity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

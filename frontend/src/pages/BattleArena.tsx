import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

export default function BattleArena() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/stitch_battle_mode.html';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 bg-[#070d1f]">
      {/* Top action sub-bar */}
      <div className="h-10 px-4 bg-[#0c1324] border-b border-[#1f293d] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Adversarial Resilience • Battle Arena HUD
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Adversarial Stress Suite & Cross-Domain Benchmarking</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Arena</span>
          </button>
          <a
            href="/stitch_battle_mode.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Standalone</span>
          </a>
        </div>
      </div>

      {/* Main iframe view */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          ref={iframeRef}
          src="/stitch_battle_mode.html"
          title="NeuroCloak Battle Mode Arena"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

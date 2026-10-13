import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

export default function TacticalHud() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/stitch_dashboard.html';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 bg-[#070d1f]">
      {/* Top action sub-bar */}
      <div className="h-10 px-4 bg-[#0c1324] border-b border-[#1f293d] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Stitch Generated • Tactical HUD Interface
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Layer 4 AutoRepair Active (θ = 0.4910)</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload HUD</span>
          </button>
          <a
            href="/stitch_dashboard.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
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
          src="/stitch_dashboard.html"
          title="NeuroCloak Tactical HUD"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

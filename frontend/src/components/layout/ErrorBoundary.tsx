import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught UI error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900/80 p-8 rounded-2xl border border-red-500/20 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.05)] space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-400" />
            
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertOctagon className="w-8 h-8 text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Something went wrong</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                NeuroCloak encountered an unexpected UI error. The problem has been logged.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/60 p-4 rounded-xl border border-slate-800 text-left overflow-x-auto shadow-inner">
                <p className="text-xs text-red-400/80 font-mono whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

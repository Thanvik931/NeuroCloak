import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  Shield, 
  Zap, 
  Search, 
  ArrowRight, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Sliders, 
  Sparkles,
  ChevronRight,
  Database,
  FileCheck,
  Terminal,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Play
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'perception' | 'audit'>('reasoning');

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-800/80">
          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold mb-8 tracking-wide">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>MongoDB Atlas Integrated AI Oversight Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight max-w-4xl">
              Real-Time AI Auditing &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Cognitive Digital Twin Oversight
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 max-w-3xl mb-10 leading-relaxed font-normal">
              Attach an independent Cognitive Digital Twin (CDT) to your AI models. Extract human-readable decision traces, monitor demographic parity, and enforce legal compliance before predictions are finalized.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
              <button
                onClick={handleCTA}
                className="group px-7 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 text-sm"
              >
                <span>{token ? 'Enter Dashboard' : 'Open Security Portal'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/about"
                className="px-7 py-3.5 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 text-slate-200 font-semibold transition-all text-sm"
              >
                About Cognitive Twin
              </Link>

              <Link
                to="/how-it-works"
                className="px-7 py-3.5 text-slate-400 hover:text-white font-medium transition-colors text-sm flex items-center gap-1"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Clean UI Code & Live CDT Telemetry Component (Replaces 3D AI Image) */}
            <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">cdt-observer.neurocloak.ai // live-stream</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'reasoning' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Reasoning Trace
                  </button>
                  <button
                    onClick={() => setActiveTab('perception')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'perception' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vector Perception
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'audit' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Atlas Audit Stream
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="p-6 font-mono text-xs space-y-4 bg-slate-900/90 min-h-[300px]">
                {activeTab === 'reasoning' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                      <span className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> DECISION #8941 — PASSED (Ethical Score: 98/100)
                      </span>
                      <span className="text-[11px] text-slate-500">Latency: 4.1ms</span>
                    </div>

                    <div className="space-y-2 text-slate-300">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-primary font-bold">Step 1 [Perception]:</span> Extracted 14 tabular features (Risk Score: 0.18, Credit Ratio: 3.2).
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-purple-400 font-bold">Step 2 [Neuro-Symbolic Deduce]:</span> Applied Rule #104 (Income to debt within threshold &gt; 2.5x).
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-emerald-400 font-bold">Step 3 [Governance Verification]:</span> Zero demographic disparity detected across protected attributes.
                        </div>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                          COMPLIANT
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'perception' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="text-slate-400 border-b border-slate-800/80 pb-2 flex justify-between">
                      <span className="text-primary font-bold">MODEL FEATURE IMPORTANCE WEIGHTS</span>
                      <span className="text-slate-500">RandomForestClassifier Engine</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Transaction Velocity (x1)</span>
                          <span className="text-primary font-bold">34.2%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[34.2%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Debt-to-Income Ratio (x2)</span>
                          <span className="text-blue-400 font-bold">28.5%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full w-[28.5%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Historical Repayment (x3)</span>
                          <span className="text-emerald-400 font-bold">21.8%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[21.8%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Demographic Sensitivity Shield</span>
                          <span className="text-slate-500 font-bold">0.0% (EXCLUDED)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-slate-600 h-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="text-slate-400 border-b border-slate-800/80 pb-2 flex justify-between">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Database className="w-4 h-4" /> MONGODB ATLAS TELEMETRY LOGS
                      </span>
                      <span className="text-slate-500">Auto-Index Sync: ACTIVE</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="text-slate-400">[11:29:04] INFO mongo_audit_stream: Connected to cluster0.neurocloak.mongodb.net</div>
                      <div className="text-slate-300">[11:29:12] RECORD inserted _id: 66a3d902e1 ... system_id: "fin-loan-v4"</div>
                      <div className="text-emerald-400">[11:29:22] VERIFY rule_check passed: "EU AI Act Transparency Compliance"</div>
                      <div className="text-slate-400">[11:29:30] SYNC aggregated metrics: cognitive_consistency=98.4%, latency=4.2ms</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="container mx-auto px-6 py-20 border-b border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Built for Enterprise Reliability & Governance
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Wrap AI decision engines in continuous oversight without sacrificing execution performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Auditable Logic Trees</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Translates non-linear neural weights into plain-English reasoning paths so compliance teams can audit decisions line-by-line.
                </p>
              </div>
              <Link to="/about" className="text-primary font-bold text-xs flex items-center gap-1">
                <span>Learn about reasoning traces</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Bias Guards</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Calculates demographic disparity metrics across sensitive attributes (age, race, gender) and flags anomalies prior to final output.
                </p>
              </div>
              <Link to="/how-it-works" className="text-blue-400 font-bold text-xs flex items-center gap-1">
                <span>View architecture specs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">MongoDB Atlas Storage</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Persists immutable document logs and metrics to MongoDB Atlas with fast index aggregation for dashboard analytics.
                </p>
              </div>
              <Link to="/contact" className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <span>Contact technical team</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="py-16 container mx-auto px-6">
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Get Started with NeuroCloak
            </h2>
            <p className="text-slate-400 max-w-lg mb-6 text-xs md:text-sm">
              Try out the decision simulator, inspect diagnostic charts, or schedule a custom enterprise compliance audit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCTA}
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>{token ? 'Enter Dashboard' : 'Login to Security Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
              >
                Contact Support / Sales
              </Link>
            </div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Home;

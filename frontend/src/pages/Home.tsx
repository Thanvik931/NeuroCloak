import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Swords, 
  Terminal, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Scale,
  BrainCircuit,
  Eye,
  FileCheck
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<'l1' | 'l2' | 'l3' | 'l4'>('l4');

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-200 selection:bg-primary/20 selection:text-primary flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        {/* Hero Section with Tactical Cyber Ambiance */}
        <section className="relative pt-16 pb-24 border-b border-[#23293c] overflow-hidden">
          <div className="container mx-auto px-6 flex flex-col items-center text-center relative z-10">
            
            {/* Live Node Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#151b2d] border border-[#23293c] text-primary text-xs font-mono font-bold mb-6 hud-edge-glow shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
              <span>NODE // CDT-09 • LAYER 4 AUTOREPAIR ACTIVE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight max-w-5xl font-mono">
              Real-Time Cognitive Digital Twin for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-300 to-secondary">
                AI Governance &amp; AutoRepair
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
              Continuous neuro-symbolic oversight for black-box machine learning models. 
              Extract deterministic logic traces, audit statutory policy compliance, and eliminate demographic disparities in under 2 milliseconds.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 font-mono">
              <button
                onClick={handleCTA}
                className="group px-7 py-3.5 bg-primary hover:bg-primary-hover text-slate-950 rounded-xl font-bold text-sm shadow-[0_0_24px_rgba(78,222,163,0.35)] transition-all flex items-center space-x-2 active:scale-[0.98]"
              >
                <span>{token ? 'ENTER CDT-HUD' : 'LAUNCH TWIN INSPECTOR'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/arena"
                className="px-7 py-3.5 rounded-xl border border-secondary/50 hover:bg-secondary/10 text-secondary font-bold text-sm transition-all flex items-center space-x-2 hud-edge-glow shadow-[0_0_16px_rgba(76,215,246,0.15)]"
              >
                <Swords className="w-4 h-4" />
                <span>ADVERSARIAL ARENA</span>
              </Link>

              <Link
                to="/systems"
                className="px-6 py-3.5 rounded-xl bg-[#151b2d] border border-[#23293c] hover:border-slate-600 text-slate-300 hover:text-white font-medium transition-all text-sm flex items-center space-x-1.5"
              >
                <Cpu className="w-4 h-4 text-primary" />
                <span>Model Nodes</span>
              </Link>
            </div>

            {/* Interactive Live 4-Layer Preview Bento */}
            <div className="w-full max-w-4xl rounded-2xl bg-[#0c1324] border border-[#23293c] text-left overflow-hidden shadow-2xl hud-edge-glow">
              {/* Box Top Bar */}
              <div className="bg-[#151b2d] px-6 py-3.5 border-b border-[#23293c] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-dot"></span>
                  <span className="font-bold text-white uppercase tracking-wider">
                    Interactive CDT Architecture Visualizer
                  </span>
                  <span className="text-slate-500 hidden sm:inline">|</span>
                  <span className="text-primary hidden sm:inline">UCI Statlog German Credit</span>
                </div>

                {/* Layer Switcher Tabs */}
                <div className="flex items-center space-x-1 font-mono text-xs bg-[#070d1f] p-1 rounded-lg border border-[#23293c]">
                  {[
                    { id: 'l1', label: 'L1 Perception' },
                    { id: 'l2', label: 'L2 Reasoning' },
                    { id: 'l3', label: 'L3 Symbolic' },
                    { id: 'l4', label: 'L4 AutoRepair' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1 rounded font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Layer Content Panel */}
              <div className="p-6 font-mono text-xs space-y-4 bg-[#0c1324]">
                {activeTab === 'l1' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#23293c]">
                      <span className="text-secondary font-bold flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Layer 1: Dense Vector Ingestion &amp; Normalization
                      </span>
                      <span className="text-slate-400">22 Extracted Features</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#151b2d] border border-[#23293c] rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Checking Account Status:</span>
                        <span className="text-white font-bold text-sm">&gt; 200 DM (Good Credit)</span>
                      </div>
                      <div className="p-3 bg-[#151b2d] border border-[#23293c] rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Loan Duration:</span>
                        <span className="text-white font-bold text-sm">18 Months (Normalized 0.22)</span>
                      </div>
                      <div className="p-3 bg-[#151b2d] border border-[#23293c] rounded-lg">
                        <span className="text-slate-400 block text-[10px]">Protected Cohort:</span>
                        <span className="text-primary font-bold text-sm">Age: 26 yrs (Younger Applicant)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'l2' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#23293c]">
                      <span className="text-primary font-bold flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Layer 2: Transparent Feature Attribution Waterfall
                      </span>
                      <span className="text-emerald-400 font-bold">SHAP Weights Computed</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-[#151b2d] border border-[#23293c] rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Checking Status [A14]: +0.48 Likelihood</span>
                        <span className="text-primary font-bold">+48% Favorable Impact</span>
                      </div>
                      <div className="p-3 bg-[#151b2d] border border-[#23293c] rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Duration Months [18]: -0.31 Likelihood</span>
                        <span className="text-rose-400 font-bold">-31% Adverse Impact</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'l3' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#23293c]">
                      <span className="text-amber-400 font-bold flex items-center gap-2">
                        <Scale className="w-4 h-4" /> Layer 3: Symbolic Policy &amp; Legal Compliance Checker
                      </span>
                      <span className="text-slate-400">9 MongoDB Policies Active</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-[#151b2d] border border-emerald-500/30 rounded-lg flex justify-between items-center">
                        <span className="text-slate-200">Statutory Term Limit Code (Duration ≤ 72 months)</span>
                        <span className="text-emerald-400 font-bold">COMPLIANT</span>
                      </div>
                      <div className="p-3 bg-[#151b2d] border border-amber-500/30 rounded-lg flex justify-between items-center">
                        <span className="text-slate-200">Demographic Parity Guard (Younger Applicant Variance)</span>
                        <span className="text-amber-400 font-bold">AUTOREPAIR TRIGGERED</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'l4' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#23293c]">
                      <span className="text-primary font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary fill-current" /> Layer 4: Metacognitive AutoRepair Dynamic Recalibration
                      </span>
                      <span className="text-primary font-bold">+29.86% Parity Restored</span>
                    </div>
                    <div className="p-4 bg-[#151b2d] border border-[#23293c] rounded-xl space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Optimal Decision Boundary:</span>
                        <span className="text-primary font-bold font-mono">θ_OOF = 0.4910 (Equalized Odds)</span>
                      </div>
                      <div className="w-full bg-[#070d1f] h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-400 to-primary h-full" style={{ width: '49.1%' }}></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                        <span>Baseline Raw Disparity: <strong className="text-rose-400">6.27%</strong></span>
                        <span>Repaired Disparity: <strong className="text-emerald-400">4.40%</strong></span>
                        <span>McNemar Significance: <strong className="text-secondary">p = 0.0391</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box Footer Strip */}
              <div className="px-6 py-3 bg-[#070d1f] border-t border-[#23293c] flex justify-between items-center font-mono text-[11px] text-slate-400">
                <span>Deterministic Proof: ISO-42001 &amp; EU AI Act Verified</span>
                <Link to="/dashboard" className="text-primary hover:underline flex items-center space-x-1 font-bold">
                  <span>Enter Full Console</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* 3 Pillars Feature Grid */}
        <section className="py-20 border-b border-[#23293c]">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 font-mono">
              <span className="text-xs text-primary uppercase tracking-widest font-bold block mb-2">Governance Pillars</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Comprehensive Neuro-Symbolic Governance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Pillar 1 */}
              <div className="p-6 rounded-2xl bg-[#151b2d]/80 border border-[#23293c] hud-edge-glow hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">100% Explainable Traces</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Every inference produces a deterministic reasoning waterfall with directional SHAP impact weights and Gemini generative explanations.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#23293c] text-[11px] text-primary flex items-center space-x-1">
                  <span>Zero Black-Box Obfuscation</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-2xl bg-[#151b2d]/80 border border-[#23293c] hud-edge-glow hover:border-secondary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sub-2ms AutoRepair</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Dynamic threshold recalibration continuously shifts decision boundaries to eliminate demographic disparities while preserving raw predictive performance.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#23293c] text-[11px] text-secondary flex items-center space-x-1">
                  <span>+29.86% Parity Mitigation</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-2xl bg-[#151b2d]/80 border border-[#23293c] hud-edge-glow hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Immutable Audit Trails</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Tamper-evident logs recorded in MongoDB with one-click exportable PDF compliance dossiers for EU AI Act, HIPAA, and Basel III auditing.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#23293c] text-[11px] text-primary flex items-center space-x-1">
                  <span>Audit Dossier Export Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <PublicFooter />
    </div>
  );
};

export default Home;

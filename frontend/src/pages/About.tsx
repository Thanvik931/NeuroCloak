import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  BrainCircuit, 
  ShieldCheck, 
  Eye, 
  Cpu, 
  Scale, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Banner */}
        <section className="relative py-20 overflow-hidden border-b border-slate-800/80">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/15 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cognitive Digital Twin Architecture</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Demystifying Black-Box AI with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Cognitive Digital Twins
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              NeuroCloak was built to bridge the gap between powerful non-linear Machine Learning models and human-verifiable ethical compliance. We wrap AI systems in an independent oversight layer that monitors decision-making in real-time.
            </p>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="py-20 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-primary font-bold text-sm tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Why NeuroCloak Matters</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Modern AI is ultra-fast, but fundamentally silent on its mistakes.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                When an automated algorithm approves a credit score, denies a medical diagnosis, or prioritizes candidate resumes, traditional AI provides raw probability numbers without readable justification.
              </p>
              <p className="text-slate-400 leading-relaxed">
                NeuroCloak’s **Cognitive Digital Twin (CDT)** acts as an autonomous shadow engine. It observes the neural inputs, generates symbolic deduction paths, flags demographic biases, and alerts human compliance managers before non-compliant decisions reach production.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                Active Governance Loop
              </div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>The 4-Layer Cognitive Loop</span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Neural Perception Layer</h4>
                    <p className="text-xs text-slate-400 mt-1">Ingests multi-modal raw feature vectors and normalizes model inputs.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Symbolic Deduction Engine</h4>
                    <p className="text-xs text-slate-400 mt-1">Converts numerical weights into plain-English reasoning trees.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Ethics & Compliance Verifier</h4>
                    <p className="text-xs text-slate-400 mt-1">Evaluates rules against demographic bias, fairness, and legal frameworks.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Meta-Cognitive Observer</h4>
                    <p className="text-xs text-slate-400 mt-1">Streams real-time WebSocket telemetry and logs immutable MongoDB Atlas audits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section className="py-20 bg-slate-900/40 border-y border-slate-800/80">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Core Technology Principles</h2>
              <p className="text-slate-400">Built for enterprise reliability, high-throughput model auditing, and full algorithmic transparency.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-primary/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Explainable Inference</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Translates high-dimensional vector embeddings into step-by-step human explanations so regulators and developers understand every output.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Automated Bias Detection</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Continuously calculates parity metrics across protected attributes (age, gender, ethnicity) to prevent systemic discrimination.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Atlas Data Pipeline</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Uses MongoDB Atlas for high-speed indexing, flexible document storage, and real-time dashboard analytics across system deployments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Capabilities List */}
        <section className="py-20 container mx-auto px-6">
          <div className="glass-panel p-10 md:p-14 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-2xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-white mb-6">Designed for Regulators, Engineers & Ethics Boards</h2>
              <ul className="space-y-4">
                {[
                  "Real-time WebSocket streaming of live AI decision reasoning traces",
                  "Automated risk scoring and warning triggers for compliance violations",
                  "Interactive simulation sandbox to test edge-case prompts and model behavior",
                  "Multi-system governance supporting Financial, Medical, and HR AI models",
                  "MongoDB Atlas schema storage with historical decision auditing logs"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-slate-300 text-sm md:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/contact"
                  className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center space-x-2"
                >
                  <span>Contact Our Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-8 py-3.5 rounded-full border border-slate-700 hover:bg-slate-800/60 text-slate-300 font-semibold text-sm transition-all"
                >
                  Explore Technical Specs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
};

export default About;

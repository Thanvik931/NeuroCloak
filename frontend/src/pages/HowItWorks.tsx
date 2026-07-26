import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  Eye, 
  Brain, 
  Shield, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight, 
  Database,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        <main className="container mx-auto px-6 py-12 space-y-20 max-w-6xl">
          {/* Top Navigation Back Link */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Cognitive Engine v2.4</span>
            </div>
          </div>

          {/* SECTION 1 — Hero */}
          <section className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Neuro-Symbolic Operational Specs</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              How NeuroCloak Audits AI
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              A Cognitive Digital Twin attaches directly to your model's prediction pipeline — extracting plain-English deduction steps, validating governance constraints, and logging audit trails in real time.
            </p>
          </section>

          {/* SECTION 2 — The Problem */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">The Black Box Challenge in AI Today</h2>
              <p className="text-base text-slate-400 leading-relaxed">
                Modern AI models make thousands of automated judgments every minute — approving credit loans, prioritizing ER triage patients, or flagging fraud. However, when an error or demographic skew occurs, traditional neural networks offer zero human explanation.
              </p>
              <ul className="space-y-3">
                {[
                  "Regulators cannot inspect the intermediate inference math",
                  "Domain experts cannot verify if medical rules were respected",
                  "Engineers spend weeks isolating silent bias anomalies"
                ].map((point, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-6 shadow-2xl">
              <div className="w-full max-w-sm p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 space-y-2">
                <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-2">
                  <span>INPUT_VECTOR</span>
                  <span>PREDICTION_OUTPUT</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>[0.82, 45, 0.12, 1]</span>
                  <span className="text-rose-400 font-bold">REJECT (0.872)</span>
                </div>
                <div className="pt-2 text-[11px] text-slate-500 italic text-center border-t border-slate-800/80">
                  ⚠️ Black Box Output: Reasoning missing or unreadable
                </div>
              </div>

              <div className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full text-xs font-bold border border-rose-500/20">
                Traditional AI: No Human Reasoning Trace
              </div>
            </div>
          </section>

          {/* SECTION 3 — The Solution */}
          <section className="space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-3">The NeuroCloak Cognitive Loop</h2>
              <p className="text-slate-400 text-base">Four continuous, real-time layers of automated AI oversight.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', title: '1. Perceive', desc: 'The Neural Perception Module normalizes incoming features and captures vector embeddings.' },
                { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', title: '2. Reason', desc: 'The Neuro-Symbolic Engine parses numeric weights into human-readable rule execution trees.' },
                { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: '3. Verify', desc: 'The Knowledge Base tests the reasoning path against legal, ethical, and safety constraints.' },
                { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', title: '4. Monitor', desc: 'The Meta-Cognitive Observer streams live WebSocket alerts and flags demographic bias.' }
              ].map((step, i) => (
                <div key={i} className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-5`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4 — The 5 Metrics explained */}
          <section className="space-y-10">
            <h2 className="text-3xl font-bold text-white text-center">Core Telemetry & Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: RefreshCw, title: 'Cognitive Consistency', desc: "Measures how accurately the CDT mirrors the AI's internal logic. A score > 95% indicates high fidelity." },
                { icon: Eye, title: 'Transparency Index', desc: "Percentage of reasoning steps explainable in plain English for non-technical auditors." },
                { icon: ShieldCheck, title: 'Ethical Compliance Rate', desc: "Percentage of governance policies satisfied. Values below 75% trigger instant review flags." },
                { icon: Zap, title: 'Adaptation Latency', desc: "Time required for the CDT to recalibrate when processing novel feature distributions (sub-5ms)." },
                { icon: Wrench, title: 'Self-Repair Efficiency', desc: "Percentage of detected demographic bias anomalies automatically mitigated prior to output." }
              ].map((metric, i) => (
                <div key={i} className={`bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex gap-4 ${i === 4 ? 'md:col-span-2 md:w-2/3 md:mx-auto' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-primary flex items-center justify-center shrink-0">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{metric.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 — Machine Learning Models */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white text-center">Model Pipeline & Datasets</h2>
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
              <p className="text-slate-300 text-base leading-relaxed">
                NeuroCloak is pre-tested against production-grade tabular models trained using <code className="text-primary bg-slate-950 px-2 py-0.5 rounded font-mono text-sm">scikit-learn</code> and <code className="text-primary bg-slate-950 px-2 py-0.5 rounded font-mono text-sm">RandomForestClassifier</code> / <code className="text-primary bg-slate-950 px-2 py-0.5 rounded font-mono text-sm">HistGradientBoosting</code>:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-primary font-bold text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" /> Medical Triage
                  </div>
                  <p className="text-slate-400 text-xs">
                    1,500 patient diagnostic profiles evaluating vital urgency vs. demographic fairness.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-blue-400 font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Credit & Fraud
                  </div>
                  <p className="text-slate-400 text-xs">
                    2,000 transaction velocity records auditing credit approval parity across age groups.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Threat Classification
                  </div>
                  <p className="text-slate-400 text-xs">
                    1,000 sensor telemetry entries ensuring strict rules of engagement compliance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6 — Call to action */}
          <section className="py-10 border-t border-slate-800 text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Ready to inspect NeuroCloak live?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/simulate" 
                className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <span>Launch Interactive Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/" 
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <span>Return to Home Page</span>
              </Link>
            </div>
          </section>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
};

export default HowItWorks;

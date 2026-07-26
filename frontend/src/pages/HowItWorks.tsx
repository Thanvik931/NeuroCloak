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
  PlusCircle, 
  TrendingUp, 
  ArrowRight, 
  Database,
  ArrowLeft,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        <main className="container mx-auto px-6 py-12 space-y-16 max-w-5xl">
          {/* Top Navigation Back Link */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              Simple Guide
            </span>
          </div>

          {/* SECTION 1 — Hero */}
          <section className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>How It Works</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              How NeuroCloak Helps You Check AI
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed">
              NeuroCloak runs quietly alongside your AI system. It translates AI decision steps into plain English, checks for fairness, and warns you if anything is wrong.
            </p>
          </section>

          {/* SECTION 2 — The Problem */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Why AI Needs a Checker</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Modern AI algorithms can make thousands of choices every minute — like evaluating credit applications, prioritizing hospital triage, or reviewing job applications.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                However, when an AI rejects an application, it usually doesn't give a clear reason. This makes it impossible for normal people or managers to know if the choice was fair or just a mistake.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-500 font-bold border-b border-slate-800 pb-2">
                  <span>INPUT DETAILS</span>
                  <span>AI DECISION</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Applicant Information</span>
                  <span className="text-rose-400 font-bold">REJECTED</span>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 italic text-center border-t border-slate-800">
                  ❌ Without NeuroCloak: No explanation given!
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-500 font-bold border-b border-slate-800 pb-2">
                  <span>WITH NEUROCLOAK</span>
                  <span>RESULT & REASON</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>Clear Explanation</span>
                  <span>PASSED (100% Fair)</span>
                </div>
                <div className="pt-2 text-[11px] text-slate-300 text-center border-t border-slate-800">
                  ✅ Simple English: "Savings cover payments. No age bias found."
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 — 4 Steps */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-2">The 4 Simple Steps</h2>
              <p className="text-slate-400 text-sm">How NeuroCloak double-checks every AI decision.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', title: '1. Read Data', desc: 'Reads the basic facts given to the AI system.' },
                { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', title: '2. Explain Reason', desc: 'Translates AI code into simple English sentences.' },
                { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: '3. Check Rules', desc: 'Verifies safety, fairness, and legal rules.' },
                { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', title: '4. Live Alerts', desc: 'Displays real-time warnings if any rule is broken.' }
              ].map((step, i) => (
                <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center mx-auto mb-3`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4 — What We Check */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-white text-center">What We Measure & Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {[
                { icon: RefreshCw, title: 'Accuracy Score', desc: "Measures how accurately NeuroCloak understands what the AI is doing." },
                { icon: Eye, title: 'Clarity Index', desc: "Shows what percentage of the decision is written in easy-to-read English." },
                { icon: ShieldCheck, title: 'Fairness Rate', desc: "Checks if the decision follows all fairness and anti-bias guidelines." },
                { icon: Zap, title: 'Response Speed', desc: "Checks decisions instantly in less than 0.01 seconds without slowing down the AI." }
              ].map((metric, i) => (
                <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-primary flex items-center justify-center shrink-0">
                    <metric.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{metric.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 — Real Examples */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-white text-center">Where This Helps in Real Life</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <PlusCircle className="w-7 h-7 text-primary mb-2" />
                <h3 className="text-base font-bold text-white">Healthcare & Hospitals</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Helps doctors see why an AI recommended a medical treatment so they can confirm it is safe.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <TrendingUp className="w-7 h-7 text-blue-400 mb-2" />
                <h3 className="text-base font-bold text-white">Banks & Banking</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Proves that credit approvals or loan denials are based strictly on financial facts, not age or gender.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
                <Shield className="w-7 h-7 text-emerald-400 mb-2" />
                <h3 className="text-base font-bold text-white">Job Hiring & HR</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ensures recruitment tools evaluate candidates fairly based on skills and experience.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-8 border-t border-slate-800 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Want to try it out live?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/simulate" 
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <span>Try the Live Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link 
                to="/" 
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-full transition-colors"
              >
                Go Back to Home
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

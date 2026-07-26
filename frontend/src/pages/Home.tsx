import React from 'react';
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
  CheckCircle, 
  Lock, 
  Sliders, 
  Sparkles,
  ChevronRight,
  Database,
  FileCheck
} from 'lucide-react';
import heroVisual from '../assets/hero-visual.png';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          {/* Glowing Ambient Backgrounds */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/20 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold mb-8 uppercase tracking-widest animate-fade-in shadow-lg shadow-primary/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official MongoDB Atlas Integrated Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight max-w-4xl">
              AI Audited.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Ethical Oversight Guaranteed.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
              NeuroCloak attaches an independent **Cognitive Digital Twin (CDT)** to your artificial intelligence models. Extract real-time human reasoning traces, block demographic bias, and ensure regulatory compliance before decisions reach your users.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <button
                onClick={handleCTA}
                className="group px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white rounded-full font-bold shadow-xl shadow-primary/25 transition-all flex items-center gap-3 text-base"
              >
                <span>{token ? 'Go to Dashboard' : 'Launch Demo Portal'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/about"
                className="px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 text-slate-200 font-semibold transition-all text-base"
              >
                Learn About CDT AI
              </Link>

              <Link
                to="/contact"
                className="px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors text-base flex items-center gap-1.5"
              >
                <span>Contact Sales / Audit</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Platform Feature Stats Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-16">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-slate-400 mt-1">Audit Traceability</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">&lt; 5ms</div>
                <div className="text-xs text-slate-400 mt-1">Inference Latency</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-2xl font-black text-blue-400">4-Layer</div>
                <div className="text-xs text-slate-400 mt-1">Cognitive Loop</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-2xl font-black text-primary">Atlas</div>
                <div className="text-xs text-slate-400 mt-1">Real-Time Sync</div>
              </div>
            </div>

            {/* Hero Visual Preview */}
            <div className="relative max-w-5xl w-full">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[80px] -z-10 opacity-30" />
              <div className="glass-panel p-2 rounded-2xl overflow-hidden border-slate-700/60 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                <img
                  src={heroVisual}
                  alt="NeuroCloak Cognitive Digital Twin Dashboard Preview"
                  className="rounded-xl w-full object-cover shadow-inner"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section className="relative z-10 container mx-auto px-6 py-24 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Autonomous Governance for Critical AI
            </h2>
            <p className="text-slate-400 text-base">
              Whether deploying high-stakes medical diagnostic tools or automated financial scoring, NeuroCloak protects your operations against algorithmic failure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-primary/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Audit the Unauditable</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Capture every neural inference step in real-time. Turn complex matrices into transparent, human-readable logic trees.
                </p>
              </div>
              <Link to="/about" className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore reasoning trace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Bias Guards</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Detect demographic discrepancies (age, race, gender) and automatically flag non-compliant predictions before outputting results.
                </p>
              </div>
              <Link to="/how-it-works" className="text-blue-400 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>See architecture specs</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">MongoDB Atlas Native</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Built to scale with MongoDB Atlas, enabling sub-millisecond document indexing and aggregation pipelines for visual diagnostics.
                </p>
              </div>
              <Link to="/contact" className="text-emerald-400 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Request Enterprise Setup</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick CTA Banner */}
        <section className="py-20 container mx-auto px-6">
          <div className="glass-panel p-10 md:p-14 rounded-3xl border border-slate-800 bg-gradient-to-r from-primary/20 via-slate-900 to-blue-900/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Started with NeuroCloak Today
            </h2>
            <p className="text-slate-300 max-w-xl mb-8 text-sm md:text-base">
              Test out the simulation sandbox, explore decision logs, or get in touch with our AI compliance engineering team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCTA}
                className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
              >
                <span>{token ? 'Enter Dashboard' : 'Login to Demo Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/contact"
                className="px-8 py-3.5 rounded-full border border-slate-700 hover:bg-slate-800/80 text-slate-200 font-semibold text-sm transition-all"
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

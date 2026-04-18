import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Zap, Search, ArrowRight, Github } from 'lucide-react';
import heroVisual from '../assets/hero-visual.png';

const Home: React.FC = () => {
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
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NeuroCloak</span>
        </div>
        <div className="flex items-center space-x-8">
          <a href="https://github.com/Thanvik931/NeuroCloak" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <button 
            onClick={handleCTA}
            className="px-5 py-2 rounded-full border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
          >
            {token ? 'Go to Dashboard' : 'Login'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center pt-20 pb-32 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-widest animate-fade-in">
          <span>Official MongoDB Atlas Integrated Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight max-w-4xl">
          AI Audited. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Problem Solved.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The first governance platform for Cognitive AI Digital Twins. 
          Real-time compliance monitoring, ethical anomaly detection, and transparent reasoning traces.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button 
            onClick={handleCTA}
            className="group px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold shadow-xl shadow-primary/20 transition-all flex items-center"
          >
            {token ? 'Go to Dashboard' : 'Get Started Now'}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigate('/how-it-works')}
            className="px-8 py-4 text-slate-300 hover:text-white font-medium transition-colors"
          >
            See how it works
          </button>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-24 relative max-w-5xl w-full">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[80px] -z-10 opacity-30" />
          <div className="glass-panel p-2 overflow-hidden border-slate-700/50 shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
            <img 
              src={heroVisual} 
              alt="NeuroCloak Platform UI Preview" 
              className="rounded-2xl w-full object-cover shadow-inner"
            />
          </div>
        </div>
      </main>

      {/* The 3 Pillars */}
      <section className="relative z-10 container mx-auto px-6 py-32 border-t border-slate-800/50">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-500">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Audit the Unauditable</h3>
            <p className="text-slate-400 leading-relaxed">
              Capture every multi-layer inference step in real-time. No black boxes, just clear governance.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors duration-500">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Detection</h3>
            <p className="text-slate-400 leading-relaxed">
              Spot ethical drifts and compliance anomalies instantly with our automated detection engine.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-500">
              <Search className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Atlas Integrated</h3>
            <p className="text-slate-400 leading-relaxed">
              Seamlessly connected to MongoDB Atlas for high-performance analytics and visual charts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-20 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
          <div className="flex items-center space-x-2 mb-8 md:mb-0">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-400 text-xs">
              N
            </div>
            <span className="font-semibold text-slate-400">NeuroCloak © 2026</span>
          </div>
          <div className="flex space-x-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="https://github.com/Thanvik931/NeuroCloak" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Source</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

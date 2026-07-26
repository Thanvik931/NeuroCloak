import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Github, Shield, Mail, ArrowUpRight } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-slate-800/80 bg-[#0B1120] text-slate-400">
      {/* Top Banner CTA */}
      <div className="border-b border-slate-800/60 bg-gradient-to-r from-slate-900/80 via-primary/5 to-slate-900/80">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to audit your AI systems?</h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Attach a Cognitive Digital Twin to inspect perception, meta-cognitive reasoning, and bias in real-time.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              <span>Schedule Enterprise Audit</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 text-slate-200 text-sm font-semibold transition-all"
            >
              Access Demo Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Col */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-primary/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">NeuroCloak</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            The next-generation Cognitive Digital Twin platform for continuous AI oversight, bias detection, and explainable inference auditing.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href="https://github.com/Thanvik931/NeuroCloak"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <Link
              to="/contact"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition-colors">Overview</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">About Cognitive Digital Twin</Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-white transition-colors">Architecture & Reasoning</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">Contact & Support</Link>
            </li>
          </ul>
        </div>

        {/* Governance & Features */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Governance</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">Demographic Bias Inspection</span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">Real-time Anomaly Rules</span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">Symbolic Deduction Traces</span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">MongoDB Atlas Integration</span>
            </li>
          </ul>
        </div>

        {/* Compliance & Trust */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Compliance & Trust</h4>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>EU AI Act & Ethical Ready</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides verifiable, human-auditable logs meeting international artificial intelligence risk frameworks.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/60 py-6 bg-slate-950/80">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NeuroCloak CDT Platform. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-slate-300 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact Support</Link>
            <a href="https://github.com/Thanvik931/NeuroCloak" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

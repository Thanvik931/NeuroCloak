import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Github, Shield, Mail, ArrowUpRight } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#0B1120] text-slate-400 font-sans">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Want to make sure your AI is fair and clear?</h3>
            <p className="text-slate-400 text-sm max-w-xl">
              NeuroCloak explains why your AI makes choices and alerts you if anything looks wrong or unfair.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow transition-all flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white">NeuroCloak</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Helping everyone understand AI decisions in simple words. Safe, transparent, and easy for anyone to use.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href="https://github.com/Thanvik931/NeuroCloak"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Github className="w-4 h-4" />
            </a>
            <Link
              to="/contact"
              className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Main Pages</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* What We Do */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Key Benefits</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-white">Simple Explanations</span></li>
            <li><span className="hover:text-white">Fairness & Bias Checking</span></li>
            <li><span className="hover:text-white">Live Warnings & Alerts</span></li>
            <li><span className="hover:text-white">Saved Records</span></li>
          </ul>
        </div>

        {/* Trust */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Built for Trust</h4>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>Safe & Clear AI</span>
            </div>
            <p className="text-xs text-slate-400">
              Designed so non-technical users and experts alike can easily check AI fairness.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 py-5 bg-slate-950">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} NeuroCloak. All rights reserved.</p>
          <div className="flex space-x-5">
            <Link to="/about" className="hover:text-slate-300">About</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
            <a href="https://github.com/Thanvik931/NeuroCloak" target="_blank" rel="noreferrer" className="hover:text-slate-300">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

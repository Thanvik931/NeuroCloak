import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Terminal,
  HelpCircle,
  Sparkles,
  Users
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
        <section className="relative pt-16 pb-20 border-b border-slate-800">
          <div className="container mx-auto px-6 flex flex-col items-center text-center">
            
            {/* Small Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Easy AI Oversight for Everyone</span>
            </div>

            {/* Main Headline in Simple Words */}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight max-w-4xl">
              Understand Why Your AI Makes Choices in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Simple English
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p className="text-base md:text-lg text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
              NeuroCloak acts as a smart helper that watches your AI system. It explains every AI decision in plain words, checks for unfair bias, and warns you instantly if something looks wrong.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
              <button
                onClick={handleCTA}
                className="group px-7 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-bold shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <span>{token ? 'Go to Dashboard' : 'Sign In / Try Demo'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/about"
                className="px-7 py-3.5 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold transition-all text-sm"
              >
                About Us
              </Link>

              <Link
                to="/how-it-works"
                className="px-7 py-3.5 text-slate-400 hover:text-white font-medium transition-colors text-sm flex items-center gap-1"
              >
                <span>See How It Works</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Live Demo Preview Box */}
            <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 text-left overflow-hidden shadow-2xl">
              {/* Box Top Bar */}
              <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">Live AI Decision Checker</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      activeTab === 'reasoning' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Simple Explanation
                  </button>
                  <button
                    onClick={() => setActiveTab('perception')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      activeTab === 'perception' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Main Factors
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                      activeTab === 'audit' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recent Activity Logs
                  </button>
                </div>
              </div>

              {/* Content Panel */}
              <div className="p-6 text-sm space-y-4 bg-slate-900/90">
                {activeTab === 'reasoning' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Example AI Result: Loan Approved (Safety Score: 98/100)
                      </span>
                      <span className="text-xs text-slate-500">Checked in 0.01 seconds</span>
                    </div>

                    <div className="space-y-2 text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-primary">Step 1:</strong> Read the user's financial details (Income and monthly savings).
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <strong className="text-purple-400">Step 2:</strong> Verified that monthly savings easily cover the requested loan payment.
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <div>
                          <strong className="text-emerald-400">Step 3:</strong> Checked for fairness. No age or gender bias found.
                        </div>
                        <span className="px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                          FAIR & SAFE
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'perception' && (
                  <div className="space-y-3">
                    <div className="text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
                      <span className="text-white font-bold">What influenced the AI's choice?</span>
                      <span className="text-xs text-slate-500">Simple Breakdown</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Monthly Income & Savings</span>
                          <span className="text-primary font-bold">High Importance (45%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[45%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>On-Time Bill Payment History</span>
                          <span className="text-blue-400 font-bold">High Importance (35%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full w-[35%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Requested Loan Amount</span>
                          <span className="text-emerald-400 font-bold">Medium Importance (20%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[20%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Age, Race, or Gender</span>
                          <span className="text-slate-500 font-bold">0% (Blocked to prevent bias)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-600 h-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-2 text-xs">
                    <div className="text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
                      <span className="text-emerald-400 font-bold">Saved Activity Log History</span>
                      <span className="text-slate-500">Updated Automatically</span>
                    </div>

                    <div className="space-y-2 text-slate-300 font-mono text-xs">
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-400">
                        • 11:34 AM — Connected securely to your AI application.
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                        • 11:34 AM — AI processed loan request for Applicant #104.
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                        • 11:34 AM — NeuroCloak checked logic and confirmed decision is 100% fair.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* 3 Main Benefits */}
        <section className="container mx-auto px-6 py-16 border-b border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Why Everyone Loves NeuroCloak
            </h2>
            <p className="text-slate-400 text-sm">
              Simple features designed so anyone can understand and trust AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Clear & Simple Words</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  No complicated math formulas. NeuroCloak turns complex AI code into step-by-step sentences anyone can read.
                </p>
              </div>
              <Link to="/about" className="text-primary font-bold text-xs flex items-center gap-1">
                <span>Read more about us</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Automatic Fairness Checks</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  It double-checks decisions to make sure people are treated fairly, regardless of age, background, or gender.
                </p>
              </div>
              <Link to="/how-it-works" className="text-blue-400 font-bold text-xs flex items-center gap-1">
                <span>See how it works</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Permanent Saved History</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Every check is saved securely in a database so you can look back at past decisions whenever you need to.
                </p>
              </div>
              <Link to="/contact" className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <span>Ask us any questions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 container mx-auto px-6">
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to see how easy AI checking can be?
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              Sign in to use our live simulator or contact our friendly team today.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleCTA}
                className="px-7 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>{token ? 'Enter Dashboard' : 'Sign In Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/contact"
                className="px-7 py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
              >
                Contact Us
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

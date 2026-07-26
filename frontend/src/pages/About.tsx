import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Heart,
  HelpCircle,
  Sparkles,
  Users
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative py-16 border-b border-slate-800">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-6">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span>Our Mission</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Making AI Clear, Fair, and Easy to Understand for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Everyone
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed">
              We built NeuroCloak because AI is used everywhere today — but nobody wants AI to make secret choices or treat people unfairly. Our goal is to make every AI decision transparent in simple English.
            </p>
          </div>
        </section>

        {/* What We Solve */}
        <section className="py-16 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>The Big Problem</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Most AI systems don't explain why they choose something.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Imagine applying for a loan or seeing a doctor, and a computer says "No" or "Approved" without giving you any clear reason. That creates confusion and fear.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                NeuroCloak acts like a friendly assistant. It watches the AI, writes down the exact steps the AI took, checks if the decision followed all rules, and translates everything into simple words you can understand.
              </p>
            </div>

            {/* The 4 Simple Steps Card */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>The 4 Steps NeuroCloak Follows</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Read the Details</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Collects the basic information given to the AI system.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Write Simple Explanations</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Turns complex code into plain English sentences.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Check for Fairness</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Verifies that nobody is discriminated against based on age or gender.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Show Live Alerts</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Sends instant warnings if any rule or safety guideline is broken.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-16 bg-slate-900/60 border-y border-slate-800">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Who Can Use NeuroCloak?</h2>
              <p className="text-slate-400 text-sm">Designed to be simple for everyone — no technical experience required!</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Everyday Users</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Understand why an AI approved or denied your application in plain, friendly language.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Managers & Owners</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Make sure your business's AI stays fair, follows all laws, and never makes embarrassing mistakes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Students & Auditors</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Easily inspect AI models, view historical decision records, and test real-time simulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 container mx-auto px-6 text-center">
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-white">Have Any Questions?</h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Our team is always here to help you understand how NeuroCloak keeps AI clear and fair.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow transition-all flex items-center gap-2"
              >
                <span>Contact Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
};

export default About;

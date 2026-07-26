import React, { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'Enterprise Audit',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "How does NeuroCloak integrate with existing AI models?",
      a: "NeuroCloak connects via lightweight REST or gRPC middleware wrappers. It observes model predictions in parallel without injecting latency into your inference pipeline."
    },
    {
      q: "Can I request a custom Cognitive Digital Twin for my sector?",
      a: "Yes! We support specialized rule engines for healthcare diagnostics, credit risk assessment, autonomous scoring, and recruitment screening."
    },
    {
      q: "Is NeuroCloak compliant with global privacy & AI governance laws?",
      a: "NeuroCloak is engineered to meet EU AI Act, NIST AI Risk Management Framework, and SOC2 auditability standards with full document tracing."
    },
    {
      q: "What datasets are supported out of the box?",
      a: "Our backend comes pre-seeded with medical, financial loan approval, and algorithmic bias benchmarking datasets."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden border-b border-slate-800/80">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-primary/15 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Contact the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                NeuroCloak Team
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed">
              Have questions about Cognitive Digital Twins, AI audits, or enterprise setup? Reach out to our engineers and compliance experts.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-16 container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-8 md:p-10 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl relative">
                {submitted ? (
                  <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Thank You for Reaching Out!</h3>
                    <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
                      We have received your message regarding <span className="text-primary font-semibold">"{formData.inquiryType}"</span>. Our technical compliance team will respond within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', organization: '', inquiryType: 'Enterprise Audit', message: '' });
                      }}
                      className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-2 text-white font-bold text-lg border-b border-slate-800 pb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span>Send Us a Message</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Your Full Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Jane Doe"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@organization.ai"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Neuro Tech Corp"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Inquiry Type
                        </label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                        >
                          <option value="Enterprise Audit">Enterprise AI Audit Request</option>
                          <option value="Research Partnership">Research & Academic Partnership</option>
                          <option value="Technical Support">Technical Integration Support</option>
                          <option value="General Inquiry">General Question</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Message Detail <span className="text-primary">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your AI models, auditing requirements, or target governance goals..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Info & FAQ Sidebar Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Info Cards */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Direct Contact Email</h4>
                    <p className="text-slate-400 text-xs mt-1">support@neurocloak.ai</p>
                    <p className="text-slate-400 text-xs">audits@neurocloak.ai</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Response Guarantee</h4>
                    <p className="text-slate-400 text-xs mt-1">Under 24 hours SLA for enterprise inquiries & technical support.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Research Lab & HQ</h4>
                    <p className="text-slate-400 text-xs mt-1">Cognitive AI Governance Lab</p>
                    <p className="text-slate-400 text-xs">Atlas Cloud Integrated Node</p>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h3>

                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full px-4 py-3 text-left font-medium text-xs md:text-sm text-slate-200 hover:text-white flex justify-between items-center transition-colors"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

export default Contact;

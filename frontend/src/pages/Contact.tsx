import React, { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  Building2, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'General Question',
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
      q: "Is NeuroCloak easy for non-technical people to use?",
      a: "Yes! NeuroCloak translates complex AI logic into simple English sentences so anyone can easily understand and check AI choices."
    },
    {
      q: "Does NeuroCloak slow down my AI system?",
      a: "Not at all. It checks decisions in less than 0.01 seconds, so your AI stays fast and smooth."
    },
    {
      q: "How does it check for fairness?",
      a: "NeuroCloak double-checks that decisions are based only on facts (like savings or skills) and blocks unfair bias based on age, gender, or background."
    },
    {
      q: "Can I save historical records of AI checks?",
      a: "Yes, every check is saved automatically in a secure database so you can view past decision records anytime."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 flex flex-col justify-between font-sans">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative py-14 border-b border-slate-800">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Contact Us</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              We Are Here to Help
            </h1>

            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Have questions about how NeuroCloak works, or need help setting up AI checks? Send us a message below!
            </p>
          </div>
        </section>

        {/* Main Form & FAQ Grid */}
        <section className="py-12 container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Thank You for Contacting Us!</h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-sm mx-auto">
                      We received your message about <span className="text-primary font-bold">"{formData.inquiryType}"</span>. Our team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', organization: '', inquiryType: 'General Question', message: '' });
                      }}
                      className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center space-x-2 text-white font-bold text-base border-b border-slate-800 pb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Send Us a Message</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Your Full Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Alex Smith"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Company / School Name
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Organization Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          What is this regarding?
                        </label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-primary"
                        >
                          <option value="General Question">General Question</option>
                          <option value="AI Safety & Fairness Setup">AI Safety & Fairness Setup</option>
                          <option value="Demo Request">Demo & Walkthrough Request</option>
                          <option value="Technical Support">Technical Support</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Your Message <span className="text-primary">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your question or request here..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow transition-all flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message Now</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar FAQ & Info */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Email Us Directly</h4>
                    <p className="text-slate-400 mt-0.5">support@neurocloak.ai</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Fast Reply SLA</h4>
                    <p className="text-slate-400 mt-0.5">We usually answer within 24 hours on business days.</p>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h3>

                <div className="space-y-2">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full px-3.5 py-2.5 text-left font-semibold text-xs text-slate-200 hover:text-white flex justify-between items-center"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-3.5 pb-2.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
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

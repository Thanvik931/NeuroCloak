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
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const TARGET_EMAIL = "thanvikreddy2@gmail.com";
const TARGET_PHONE_RAW = "918790505507";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    inquiryType: 'General Question',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const formatMessageText = () => {
    return (
      `Hello NeuroCloak Team,\n\n` +
      `New Message from Website:\n` +
      `• Name: ${formData.name}\n` +
      `• Email: ${formData.email}\n` +
      `• Phone: ${formData.phone || 'Not Provided'}\n` +
      `• Organization: ${formData.organization || 'N/A'}\n` +
      `• Subject: ${formData.inquiryType}\n` +
      `• Message: ${formData.message}`
    );
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`NeuroCloak Inquiry: ${formData.inquiryType}`);
    const body = encodeURIComponent(formatMessageText());
    return `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
  };

  const getWhatsAppUrl = () => {
    return `https://wa.me/${TARGET_PHONE_RAW}?text=${encodeURIComponent(formatMessageText())}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Asynchronously log contact payload to backend
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          recipientEmail: TARGET_EMAIL, 
          recipientPhone: TARGET_PHONE_RAW 
        })
      }).catch(() => {});
    } catch (err) {}

    setSubmitted(true);

    // Open user's default email client / WhatsApp dispatch window
    window.location.href = getMailtoUrl();
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
                  <div className="text-center py-10 space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">Thank You for Contacting Us!</h3>
                      <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
                        Your message regarding <span className="text-primary font-bold">"{formData.inquiryType}"</span> has been received. Our team will review your inquiry and get back to you shortly.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={getMailtoUrl()}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email App</span>
                      </a>

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-700"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Send via WhatsApp</span>
                      </a>
                    </div>

                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', organization: '', inquiryType: 'General Question', message: '' });
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-white underline pt-4 block mx-auto"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2 text-white font-bold text-base">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Send Us a Message</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                        Direct Team Support
                      </span>
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
                          placeholder="John Doe"
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
                          placeholder="john@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Your phone number"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Organization Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Subject / Topic
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
                      className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 group"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span>Send Message Now</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Contact Info Cards */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Direct Support Inquiry</h4>
                    <p className="text-slate-400 mt-0.5">Fill out the contact form to reach our core support team immediately.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Email Support Dispatch</h4>
                    <p className="text-slate-400 mt-0.5">Inquiries submitted here are routed directly to our support inbox.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Fast Reply Guarantee</h4>
                    <p className="text-slate-400 mt-0.5">We review all incoming messages promptly and reply within 24 hours.</p>
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

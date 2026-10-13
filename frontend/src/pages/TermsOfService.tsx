import { Scale, CheckCircle2, AlertOctagon, Cpu, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function TermsOfService() {
  const lastUpdated = "October 13, 2026";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO OVERVIEW</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>ENTERPRISE SERVICE TERMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-400 font-mono">
            Effective Date: {lastUpdated} | Document Reference: NC-LEGAL-TOS-2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white font-mono">1. Acceptance of Terms</h2>
            </div>
            <p className="mb-3">
              By accessing the NeuroCloak web portal, invoking our REST/WebSocket APIs, or deploying our Cognitive Digital Twin agent runtime, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a corporate entity, you represent that you possess legal authority to bind that entity.
            </p>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-mono">2. Scope of Service & Operational Boundaries</h2>
            </div>
            <p className="mb-3">
              NeuroCloak provides automated AI governance, SHAP-driven explainability, demographic parity auditing, and runtime policy defense. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Cognitive Twin Telemetry:</strong> NeuroCloak acts as an independent auditor and defensive overlay. Ultimate regulatory accountability for deployed AI models remains with the model owner.
              </li>
              <li>
                <strong className="text-white">Auto-Repair Mechanisms:</strong> Autonomous mitigation actions (such as dynamic threshold adjustments and policy blocking) are executed in accordance with client-configured governance rules.
              </li>
              <li>
                <strong className="text-white">Service Level Target:</strong> We aim for 99.9% uptime on production telemetry endpoints, excluding scheduled maintenance windows announced in advance.
              </li>
            </ul>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-mono">3. Acceptable Use Policy</h2>
            </div>
            <p className="mb-3">
              Users and enterprise clients may not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Circumvent API rate limits, authentication barriers, or cryptographic access controls.</li>
              <li>Submit malicious payloads designed to corrupt database indexes or exploit model extraction vectors.</li>
              <li>Attempt unauthorized penetration tests or denial-of-service simulations without written authorization from NeuroCloak Security Operations.</li>
              <li>Deploy NeuroCloak telemetry in weaponized systems or prohibited international jurisdictions.</li>
            </ul>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white font-mono">4. Limitation of Liability</h2>
            </div>
            <p className="mb-3">
              To the maximum extent permitted by applicable law, NeuroCloak shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or operational downtime arising from third-party model inference decisions.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 text-xs text-slate-400">
            <p>
              Inquiries regarding enterprise service licensing or customized SLA terms should be directed to:
              <span className="text-primary font-mono ml-1 font-semibold">legal@neurocloak.com</span>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

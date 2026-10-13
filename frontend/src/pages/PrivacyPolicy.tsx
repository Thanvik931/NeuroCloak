import { Shield, Lock, Eye, Server, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function PrivacyPolicy() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>ENTERPRISE DATA GOVERNANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400 font-mono">
            Effective Date: {lastUpdated} | Document Reference: NC-SEC-PRIV-2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white font-mono">1. Information We Collect</h2>
            </div>
            <p className="mb-3">
              NeuroCloak collects only information strictly required to operate, monitor, and safeguard our cognitive digital twin telemetry platform:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Account Information:</strong> Work email address, enterprise organization name, authentication credentials, and role assignments (Administrator, Auditor, Viewer).
              </li>
              <li>
                <strong className="text-white">Cognitive Telemetry & Inferences:</strong> Decision payloads submitted to the NeuroCloak runtime for explainability, parity audits, and adversarial defense analysis.
              </li>
              <li>
                <strong className="text-white">System Diagnostics:</strong> Server response latency, anonymized client user agent, and API call rate metrics for DDoS protection.
              </li>
            </ul>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white font-mono">2. Cryptographic Protection & Data Isolation</h2>
            </div>
            <p className="mb-3">
              We enforce strict multi-tenant isolation and cryptographic standards across all telemetry tiers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Encryption at Rest & in Transit:</strong> All database volumes utilize AES-256 encryption at rest. All API endpoints and WebSocket streams mandate TLS 1.3 encryption.
              </li>
              <li>
                <strong className="text-white">Zero Model Training on Customer Telemetry:</strong> NeuroCloak never trains public or foundation AI models on proprietary customer input vectors or decision logs.
              </li>
              <li>
                <strong className="text-white">Password Security:</strong> User credentials are encrypted using salted bcrypt hashing with high work factors. Raw credentials are never stored.
              </li>
            </ul>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-mono">3. Purpose of Data Processing</h2>
            </div>
            <p className="mb-3">
              Data collected is processed exclusively for the following contractual and operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Executing 4-layer Cognitive Digital Twin runtime checks (SHAP explanations, Equalized Odds fairness audits, governance rules, and dynamic auto-repair).</li>
              <li>Detecting out-of-distribution adversarial drift and triggering anomalous alerts.</li>
              <li>Maintaining immutable audit logs for compliance with EU AI Act, HIPAA, and financial fairness mandates.</li>
              <li>Preventing unauthorized API access, automated bot intrusions, and rate limit abuse.</li>
            </ul>
          </section>

          <section className="glass-panel p-6 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white font-mono">4. Compliance & Your Legal Rights</h2>
            </div>
            <p className="mb-3">
              NeuroCloak complies with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Enterprise users have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Request an export of all logged decision telemetry and audit traces associated with their tenant.</li>
              <li>Request permanent deletion of non-regulatory historical logs upon tenant termination.</li>
              <li>Restrict specific algorithmic telemetry checks by updating tenant governance policies.</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-slate-800 bg-slate-900/20 text-xs text-slate-400">
            <p>
              For data protection inquiries or to submit an audit compliance request, contact our security office at:
              <span className="text-primary font-mono ml-1 font-semibold">security@neurocloak.com</span> or via our{' '}
              <Link to="/contact" className="text-primary underline hover:text-primary-hover">
                Contact Desk
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

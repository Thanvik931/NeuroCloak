import { Eye, Brain, Shield, Activity, RefreshCw, ShieldCheck, Zap, Wrench, PlusCircle, TrendingUp, ArrowRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-24 py-12 px-6">
      
      {/* SECTION 1 — Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">How NeuroCloak Works</h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          A Cognitive Digital Twin watches every AI decision in real-time — detecting bias, verifying ethics, and explaining its reasoning in plain English.
        </p>
      </section>

      {/* SECTION 2 — The Problem */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">The Problem with AI Today</h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Modern AI systems make thousands of decisions per second — approving loans, diagnosing patients, classifying threats. But when something goes wrong, no one can explain why. The reasoning process is invisible. Regulators cannot audit it. Doctors cannot trust it. Engineers cannot fix it.
          </p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900/0 to-slate-900/0 pointers-events-none"></div>
          <div className="w-48 h-32 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative z-10 shadow-2xl">
            <span className="text-white font-mono flex items-center gap-2"><Brain className="w-5 h-5 text-slate-500" /> AI System</span>
          </div>
          <div className="flex gap-12 w-full justify-center relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm mb-2 font-mono">Input</span>
              <ArrowRight className="text-slate-500 w-6 h-6" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm mb-2 font-mono">Decision</span>
              <ArrowRight className="text-slate-500 w-6 h-6" />
            </div>
          </div>
          <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-medium border border-red-500/20 relative z-10">
            Why? Unknown.
          </div>
        </div>
      </section>

      {/* SECTION 3 — The Solution */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">The NeuroCloak Solution</h2>
          <p className="text-slate-400 text-lg">Four continuous layers of cognitive oversight.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Step 1 — Perceive', desc: 'The Neural Perception Module reads raw input data and extracts meaningful features, just like how your brain processes what you see.' },
            { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10', title: 'Step 2 — Reason', desc: 'The Neuro-Symbolic Reasoning Engine combines learned patterns with structured rules to form a decision — and records every step.' },
            { icon: Shield, color: 'text-teal-400', bg: 'bg-teal-400/10', title: 'Step 3 — Verify', desc: 'The Symbolic Knowledge Base checks the reasoning against governance rules, ethics constraints, and legal requirements.' },
            { icon: Activity, color: 'text-coral-400 text-rose-400', bg: 'bg-rose-400/10', title: 'Step 4 — Monitor', desc: 'The Meta-Cognitive Monitor watches all three layers simultaneously, detects bias, and auto-corrects errors before the decision is finalized.' }
          ].map((step, i) => (
            <div key={i} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all hover:-translate-y-1 duration-300">
              <div className={`w-12 h-12 rounded-lg ${step.bg} flex items-center justify-center mb-6`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — The 5 Metrics explained */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white text-center">What We Measure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: RefreshCw, title: 'Cognitive Consistency', desc: "How accurately the CDT mirrors the AI's internal reasoning. 95% means the CDT understands what the AI is doing." },
            { icon: Eye, title: 'Transparency Index', desc: "What percentage of reasoning steps can be explained in plain English. 100% means every step is human-readable." },
            { icon: ShieldCheck, title: 'Ethical Compliance Rate', desc: "What percentage of governance rules the decision satisfies. Below 75% triggers a flag for human review." },
            { icon: Zap, title: 'Adaptation Speed', desc: "How quickly the CDT recalibrates when the environment changes. Measured in milliseconds." },
            { icon: Wrench, title: 'Self-Repair Efficiency', desc: "What percentage of detected bias patterns were automatically corrected before the decision was finalized." }
          ].map((metric, i) => (
            <div key={i} className={`bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 flex gap-4 ${i === 4 ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                <metric.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{metric.title}</h3>
                <p className="text-slate-400 text-sm">{metric.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Machine Learning Models */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white text-center">Under the Hood: Model Training</h2>
        <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700 max-w-4xl mx-auto space-y-6">
          <p className="text-slate-300 leading-relaxed text-lg">
            NeuroCloak oversees real Machine Learning models trained on robust, domain-specific tabular datasets. Here is exactly what happens during our model training phase:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Database className="w-5 h-5" /> 1. The Datasets</h3>
              <p className="text-slate-400 text-sm">
                We generate high-quality proprietary data for three domains: <strong>Healthcare</strong> (1,500 patient triage profiles), <strong>Finance</strong> (2,000 transaction velocity logs), and <strong>Industrial Defense</strong> (1,000 sensor telemetry records).
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Brain className="w-5 h-5" /> 2. The Algorithm</h3>
              <p className="text-slate-400 text-sm">
                Using <code>scikit-learn</code>, we one-hot encode the categorical values and train a <strong>RandomForestClassifier</strong>. A Random Forest uses ensemble learning (combining multiple decision trees) to achieve high accuracy without overfitting.
              </p>
            </div>
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Shield className="w-5 h-5" /> 3. NeuroCloak Integration</h3>
              <p className="text-slate-400 text-sm">
                Once the <code>.pkl</code> models are compiled, NeuroCloak's Cognitive Digital Twin wraps around them. When the Random Forest outputs a prediction, NeuroCloak extracts its decision boundaries, converts them into human-readable steps, and checks for demographic biases that the Random Forest inherently couldn't catch on its own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Real World Applications */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white text-center">Where This Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: PlusCircle, title: 'Healthcare', desc: "A radiology AI flags a tumor. NeuroCloak shows exactly which image features triggered the flag, which guidelines were consulted, and whether any demographic bias was detected and corrected." },
            { icon: TrendingUp, title: 'Finance', desc: "A credit AI declines a loan application. NeuroCloak produces a full audit trail proving the decision complied with fair lending laws and was not influenced by protected attributes." },
            { icon: Shield, title: 'Defense', desc: "An autonomous system classifies a threat. NeuroCloak verifies ROE compliance, assesses collateral risk, and requires human override confirmation before any action is taken." }
          ].map((domain, i) => (
            <div key={i} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
              <domain.icon className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-4">{domain.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{domain.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — Call to action */}
      <section className="py-12 border-t border-slate-800 text-center space-y-8">
        <h2 className="text-2xl font-bold text-white">Experience NeuroCloak Live</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/simulate" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            Try the Simulator
          </Link>
          <Link to="/" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            View Live Dashboard
          </Link>
        </div>
      </section>
      
    </div>
  );
};

export default HowItWorks;

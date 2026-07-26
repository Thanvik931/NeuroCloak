import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Sliders, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  Download, 
  Cpu, 
  Key, 
  Save, 
  Power,
  UserCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'rules' | 'system' | 'logs'>('users');

  // Admin Config State
  const [config, setConfig] = useState({
    minComplianceThreshold: 75,
    maxBiasTolerance: 5.0,
    autoRepairEnabled: true,
    emergencyOverride: false,
    requireAuditorSignoff: true,
    logRetentionDays: 90
  });

  // User Management Mock Data / State
  const [users, setUsers] = useState([
    { id: '1', email: 'admin@neurocloak.ai', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2 minutes ago' },
    { id: '2', email: 'auditor@hospital.org', role: 'ETHICS_AUDITOR', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: '3', email: 'engineer@ai-corp.com', role: 'MODEL_ENGINEER', status: 'ACTIVE', lastLogin: '3 hours ago' },
    { id: '4', email: 'viewer@bank.com', role: 'VIEWER', status: 'ACTIVE', lastLogin: '1 day ago' }
  ]);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: 'GLOBAL_RULE_UPDATE', user: 'admin@neurocloak.ai', detail: 'Set compliance threshold to 75%', time: '10 mins ago' },
    { id: '2', action: 'ROLE_PROMOTION', user: 'admin@neurocloak.ai', detail: 'Promoted auditor@hospital.org to ETHICS_AUDITOR', time: '1 hour ago' },
    { id: '3', action: 'MODEL_REGISTERED', user: 'engineer@ai-corp.com', detail: 'Deployed CreditRiskModel-v4', time: '4 hours ago' },
    { id: '4', action: 'SYSTEM_BACKUP', user: 'SYSTEM', detail: 'Completed Atlas MongoDB automated backup', time: '12 hours ago' }
  ]);

  const [saveSuccess, setSaveSuccess] = useState('');

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setSaveSuccess(`User role updated to ${newRole}`);
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('Global AI Safety settings saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Admin & Control Console
              <span className="px-2.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold uppercase">
                Admin Exclusive
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Manage system users, global AI safety thresholds, model overrides, and database operations.
            </p>
          </div>
        </div>

        {/* Global Emergency Override Button */}
        <button
          onClick={() => setConfig({ ...config, emergencyOverride: !config.emergencyOverride })}
          className={`px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 ${
            config.emergencyOverride 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-slate-800 hover:bg-red-900/40 text-slate-300 border border-slate-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{config.emergencyOverride ? 'EMERGENCY OVERRIDE ACTIVE' : 'Global AI Pause Override'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-bold">
        {[
          { id: 'users', label: 'User Roles & Access', icon: Users },
          { id: 'rules', label: 'AI Safety & Thresholds', icon: Sliders },
          { id: 'system', label: 'Database & Services', icon: Database },
          { id: 'logs', label: 'Admin Audit Stream', icon: ShieldCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-primary border-t-2 border-primary border-x border-slate-800 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" /> {saveSuccess}
        </div>
      )}

      {/* TAB 1: User Roles & Access */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Registered System Users</h2>
              <p className="text-xs text-slate-400">Promote users, assign access roles, or suspend access.</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {users.length} Users Enrolled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="ETHICS_AUDITOR">ETHICS_AUDITOR</option>
                        <option value="MODEL_ENGINEER">MODEL_ENGINEER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{u.lastLogin}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AI Safety & Thresholds */}
      {activeTab === 'rules' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Global AI Safety & Bias Configuration</h2>
            <p className="text-xs text-slate-400">Set enforcement strictness for all connected AI models.</p>
          </div>

          <form onSubmit={handleConfigSave} className="space-y-6 text-xs">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block font-bold text-white">
                  Minimum Compliance Threshold (%)
                </label>
                <p className="text-slate-400 text-[11px]">Decisions scoring below this value are automatically flagged for auditor review.</p>
                <div className="flex items-center gap-4 pt-2">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={config.minComplianceThreshold}
                    onChange={(e) => setConfig({ ...config, minComplianceThreshold: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded border border-primary/30">
                    {config.minComplianceThreshold}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block font-bold text-white">
                  Maximum Demographic Disparity Tolerance (%)
                </label>
                <p className="text-slate-400 text-[11px]">Maximum allowed statistical skew across protected groups (age, race, gender).</p>
                <div className="flex items-center gap-4 pt-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={config.maxBiasTolerance}
                    onChange={(e) => setConfig({ ...config, maxBiasTolerance: Number(e.target.value) })}
                    className="flex-1 accent-blue-400"
                  />
                  <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1 rounded border border-blue-500/30">
                    {config.maxBiasTolerance}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Auto-Repair Bias Mitigation Engine</h4>
                  <p className="text-slate-400 text-[11px]">Automatically adjusts feature weighting if demographic skew is detected.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoRepairEnabled}
                  onChange={(e) => setConfig({ ...config, autoRepairEnabled: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Require Auditor Sign-off for High-Risk Overrides</h4>
                  <p className="text-slate-400 text-[11px]">Forces 2-person verification before releasing flagged decision holds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.requireAuditorSignoff}
                  onChange={(e) => setConfig({ ...config, requireAuditorSignoff: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Admin Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Database & Services */}
      {activeTab === 'system' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Database & Infrastructure Status</h2>
            <p className="text-xs text-slate-400">Monitor MongoDB Atlas indexing, cache workers, and seed state.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> MongoDB Atlas
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">Document Store: cluster0.neurocloak</p>
              <p className="text-xs text-slate-500 font-mono">Ping: 12ms | Replicas: 3</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Redis Cache
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">In-memory telemetry aggregation</p>
              <p className="text-xs text-slate-500 font-mono">Memory: 42MB / 512MB</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" /> ML Inference Workers
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded">
                  4 ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">scikit-learn Random Forest Nodes</p>
              <p className="text-xs text-slate-500 font-mono">Avg Latency: 4.2ms</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4">
            <button
              onClick={() => {
                setSaveSuccess('Triggered automated database re-index & seed verification!');
                setTimeout(() => setSaveSuccess(''), 3000);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-Index Database</span>
            </button>

            <button
              onClick={() => {
                setSaveSuccess('Generated audit compliance report export (JSON/PDF).');
                setTimeout(() => setSaveSuccess(''), 3000);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Data Log</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Admin Audit Stream */}
      {activeTab === 'logs' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Administrative Action Logs</h2>
            <p className="text-xs text-slate-400">Immutable trail of administrative changes and system overrides.</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary border border-primary/30 rounded font-bold">
                      {log.action}
                    </span>
                    <span className="text-white font-bold">{log.user}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{log.detail}</p>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

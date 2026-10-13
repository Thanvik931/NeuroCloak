import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  BrainCircuit, 
  Database, 
  BarChart3, 
  ShieldAlert, 
  Swords, 
  SlidersHorizontal,
  X,
  Layers,
  FileCheck,
  Zap,
  Terminal
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useThemeStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Twin Inspector', path: '/dashboard', icon: Layers, badge: 'ACTIVE' },
    { name: 'Battle Arena', path: '/arena', icon: Swords, badge: 'STRESS' },
    { name: 'Live Simulator', path: '/simulate', icon: Zap },
    { name: 'Decision Logs', path: '/decisions', icon: FileCheck },
    { name: 'Model Nodes', path: '/systems', icon: Database },
    { name: 'Analytics Suite', path: '/analytics', icon: BarChart3 },
    { name: 'Safeguards & Admin', path: '/admin', icon: ShieldAlert },
  ];

  const handleAutoRepair = () => {
    navigate('/simulate?autorepair=true');
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Lateral Telemetry Rail (Fixed on desktop, drawer on mobile) */}
      <aside
        className={`fixed top-0 left-0 z-50 md:z-40 w-64 h-full bg-[#070d1f]/95 backdrop-blur-2xl border-r border-[#23293c] flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shadow-2xl`}
      >
        {/* Top Node Branding & Status Box */}
        <div className="p-4 border-b border-[#23293c] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(78,222,163,0.3)]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-sm font-black text-white tracking-wider block">NEUROCLOAK</span>
                <span className="font-mono text-[9px] text-primary tracking-widest block uppercase">CDT // GOVERNANCE</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 md:hidden"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Node Status Badge */}
          <div className="p-2.5 rounded bg-[#151b2d] border border-[#23293c] flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
              <span className="font-bold text-white tracking-wider">NODE // CDT-09</span>
            </div>
            <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded">
              DETERMINISTIC
            </span>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto font-sans">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Cognitive Telemetry
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-primary/15 text-primary border-l-2 border-primary font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-[#151b2d] hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#191f31] border border-[#23293c] text-secondary">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Callout & Footer Telemetry */}
        <div className="p-4 border-t border-[#23293c] space-y-3 shrink-0">
          {/* Quick AutoRepair Action */}
          <button
            onClick={handleAutoRepair}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono text-xs font-bold shadow-[0_0_16px_rgba(78,222,163,0.3)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>ENGAGE AUTOREPAIR</span>
          </button>

          {/* Telemetry Indicator */}
          <div className="p-2.5 rounded bg-[#151b2d]/80 border border-[#23293c] text-[10px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Layer 4 AutoRepair:</span>
              <span className="text-primary font-bold">θ = 0.4910</span>
            </div>
            <div className="flex justify-between">
              <span>Disparity Delta:</span>
              <span className="text-secondary font-bold">+29.86% Parity</span>
            </div>
          </div>

          {/* User Account / Profile */}
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-[#151b2d] transition-colors group"
          >
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-mono text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                {user?.email || 'auditor@neurocloak.ai'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">Cognitive Twin Auditor</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

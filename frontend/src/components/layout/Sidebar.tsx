import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Activity, Database, BarChart3, HelpCircle, Github } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Simulate', path: '/simulate', icon: Activity },
    { name: 'Decisions', path: '/decisions', icon: BrainCircuit },
    { name: 'Systems', path: '/systems', icon: Database },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-dark-sidebar border-r border-dark-border h-full flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-dark-border shrink-0">
        <BrainCircuit className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg text-white tracking-wide">NeuroCloak</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border space-y-4">
        <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <Github className="w-5 h-5 mr-3 shrink-0" />
          GitHub Repo
        </a>
        <div className="flex items-center space-x-3 bg-white/[0.03] hover:bg-white/5 transition-colors p-3 rounded-lg border border-white/5 cursor-default">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
            <span className="text-primary font-semibold text-sm text-center leading-none">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email || 'Unknown User'}</p>
            <p className="text-[11px] text-primary/80 uppercase font-semibold tracking-wider truncate mt-0.5">{user?.role || 'VIEWER'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

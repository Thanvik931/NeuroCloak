import React, { useState } from 'react';
import { Bell, LogOut, Search, Menu, Sun, Moon, User, BrainCircuit, Activity, ShieldAlert, Zap, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useSocketStore } from '../../store/socketStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useThemeStore();
  const socketStatus = useSocketStore((state) => state.status);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => apiClient('/analytics/summary')
  });
  
  const activeFlags = summary?.activeFlags || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/decisions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-[#0c1324]/85 backdrop-blur-xl border-b border-[#23293c] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors w-full">
      {/* Left Menu Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-[#151b2d] hover:bg-[#191f31] text-slate-200 border border-[#23293c] transition-all flex items-center justify-center md:hidden"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4 text-primary" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-primary font-bold hidden sm:inline">CDT-HUD //</span>
          <h1 className="text-sm md:text-base font-black text-white tracking-wide uppercase font-mono">
            {title}
          </h1>
        </div>
      </div>

      {/* Center Search (Tactical ⌘K style) */}
      <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-[#070d1f]/90 border border-[#23293c] rounded-lg px-3 py-1.5 w-72 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary/40 transition-all">
        <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Query cognitive telemetry..." 
          className="bg-transparent border-none p-0 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
        />
        <span className="text-[10px] font-mono text-slate-500 bg-[#151b2d] px-1.5 py-0.5 rounded border border-[#23293c]">
          ↵
        </span>
      </form>

      {/* Right Tactical Action Utilities */}
      <div className="flex items-center space-x-2 md:space-x-3">
        
        {/* Live WebSocket Telemetry Indicator */}
        <div 
          className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold tracking-wider transition-colors ${
            socketStatus === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : socketStatus === 'reconnecting'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-800/60 border-[#23293c] text-slate-400'
          }`}
          title={`Telemetry Stream: ${socketStatus.toUpperCase()}`}
        >
          <span 
            className={`w-2 h-2 rounded-full ${
              socketStatus === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : socketStatus === 'reconnecting'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-500'
            }`} 
          />
          <span>
            {socketStatus === 'connected'
              ? 'TELEMETRY LIVE'
              : socketStatus === 'reconnecting'
              ? 'RECONNECTING'
              : 'OFFLINE'}
          </span>
        </div>

        {/* Simulate Drift Quick Action */}
        <button
          onClick={() => navigate('/arena')}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#151b2d] hover:bg-[#191f31] border border-secondary/40 text-secondary text-xs font-mono font-semibold transition-all active:scale-[0.98]"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulate Drift</span>
        </button>

        {/* Emergency Stop / Audit Alert Action */}
        <button
          onClick={() => navigate('/decisions?status=FLAGGED')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-semibold transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Safety Gate</span>
          {activeFlags > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFlags}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#151b2d] border border-[#23293c] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#151b2d] border border-[#23293c] transition-colors relative"
            aria-label="Audit Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeFlags > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0c1324] border border-[#23293c] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-[#23293c] flex justify-between items-center font-mono">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audit Telemetry</h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                  {activeFlags} Pending
                </span>
              </div>
              {activeFlags > 0 ? (
                <div 
                  onClick={() => { setShowNotifications(false); navigate('/decisions?status=FLAGGED'); }}
                  className="p-4 hover:bg-[#151b2d] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Compliance Attention Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {activeFlags} decisions were flagged for human auditor review under 4-Layer symbolic governance.
                  </p>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs font-mono text-slate-500">
                  Zero anomalous telemetry detected. System nominal.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#151b2d] border border-[#23293c] transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

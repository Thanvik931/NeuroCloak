import { useState } from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => apiClient('/analytics/summary')
  });
  
  const activeFlags = summary?.activeFlags || 0;

  return (
    <header className="h-16 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search AI Systems..." 
            className="bg-black/20 border border-dark-border rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-primary/50 transition-colors w-64"
          />
        </div>

        <div className="flex items-center gap-2 relative">
          
          {/* Interactive Bell Dropdown Container */}
          <div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {activeFlags > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-dark-bg" />
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-12 mt-2 w-80 bg-[#0F172A] border border-dark-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-3 border-b border-dark-border mb-2 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white tracking-wide">Alert Center</h3>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">{activeFlags} New</span>
                </div>
                {activeFlags > 0 ? (
                  <div 
                    onClick={() => { setShowNotifications(false); navigate('/decisions'); }}
                    className="px-5 py-4 hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-4 group"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 mt-1.5 shrink-0 group-hover:animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <div>
                      <p className="text-sm text-slate-200 font-semibold mb-1 group-hover:text-white transition-colors">Action Required</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        There are <strong className="text-red-400">{activeFlags}</strong> AI decisions currently FLAGGED for human auditor review. Click to investigate.
                      </p>
                    </div>
                  </div>
                ) : (
                   <div className="px-5 py-8 text-center text-sm text-slate-500 font-medium">
                     You are all caught up!
                   </div>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-dark-border mx-2" />
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

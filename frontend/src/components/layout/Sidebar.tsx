import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Activity, Database, BarChart3, HelpCircle, Github, X, Sun, Moon, User, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme } = useThemeStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Simulate', path: '/simulate', icon: Activity },
    { name: 'Decisions', path: '/decisions', icon: BrainCircuit },
    { name: 'Systems', path: '/systems', icon: Database },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Admin Console', path: '/admin', icon: ShieldAlert },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 bg-dark-sidebar border-r border-dark-border h-full flex flex-col transition-transform duration-300 transform shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border shrink-0">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-white tracking-wide">NeuroCloak</span>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)] font-bold' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border space-y-3">
          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-slate-700/60 transition-all"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
              Toggle
            </span>
          </button>

          <a
            href="https://github.com/Thanvik931/NeuroCloak"
            target="_blank"
            rel="noreferrer"
            className="flex items-center px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Github className="w-4 h-4 mr-3 shrink-0" />
            GitHub Repo
          </a>

          {/* User Profile Footer Card */}
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-3 bg-white/[0.03] hover:bg-white/10 transition-colors p-3 rounded-lg border border-white/5 group"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:scale-105 transition-transform">
              <span className="text-primary font-semibold text-sm text-center leading-none">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                {user?.email || 'admin@neurocloak.ai'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">Edit Profile &amp; Settings</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

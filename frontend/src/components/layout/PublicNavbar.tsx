import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { BrainCircuit, Github, Menu, X, ArrowRight, ShieldCheck, Sun, Moon, Swords, Layers } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { theme, toggleTheme } = useThemeStore();

  const navLinks = [
    { name: 'Twin Inspector', path: '/dashboard' },
    { name: 'Battle Arena', path: '/arena' },
    { name: 'Model Nodes', path: '/systems' },
    { name: 'About Us', path: '/about' },
    { name: 'Documentation', path: '/how-it-works' },
  ];

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0c1324]/85 border-b border-[#23293c] transition-colors">
      <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-primary/10 border border-primary/50 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(78,222,163,0.3)]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black tracking-wider text-white font-mono flex items-center gap-2">
              NEUROCLOAK
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-primary/15 text-primary rounded border border-primary/30">
                CDT-HUD
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Cognitive Digital Twin Oversight
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#151b2d]/80 p-1 rounded-full border border-[#23293c]">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all ${
                  active
                    ? 'bg-primary text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#191f31]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3 font-mono">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-[#151b2d] border border-[#23293c] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <a
            href="https://github.com/Thanvik931/NeuroCloak"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-[#151b2d] border border-[#23293c] text-slate-300 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          <button
            onClick={handleCTA}
            className="group px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-slate-950 text-xs font-bold shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all flex items-center space-x-1.5 active:scale-[0.98]"
          >
            <span>{token ? 'Enter CDT-HUD' : 'Launch Twin Console'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#151b2d] border border-[#23293c] text-slate-300 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#151b2d] border border-[#23293c] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1324] border-b border-[#23293c] px-6 py-6 space-y-4 font-mono">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-primary text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-[#151b2d]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#23293c] flex flex-col space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCTA();
              }}
              className="w-full py-3 rounded-lg bg-primary text-slate-950 font-bold text-sm text-center flex items-center justify-center space-x-2"
            >
              <span>{token ? 'Enter CDT-HUD' : 'Launch Twin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;

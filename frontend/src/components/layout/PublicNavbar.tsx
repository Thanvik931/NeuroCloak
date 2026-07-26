import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { BrainCircuit, Github, Menu, X, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { theme, toggleTheme } = useThemeStore();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact Us', path: '/contact' },
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/90 border-b border-slate-800 transition-colors">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              NeuroCloak
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/20 text-primary rounded border border-primary/30">
                AI Checker
              </span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Simple & Honest AI Oversight
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle, CTA & GitHub */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>

          <a
            href="https://github.com/Thanvik931/NeuroCloak"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>

          <button
            onClick={handleCTA}
            className="group px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <span>{token ? 'Go to Dashboard' : 'Sign In / Login'}</span>
            {token ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium ${
                    active
                      ? 'bg-primary text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCTA();
              }}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-center flex items-center justify-center space-x-2"
            >
              <span>{token ? 'Go to Dashboard' : 'Sign In / Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://github.com/Thanvik931/NeuroCloak"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium text-center flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>View Code on GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;

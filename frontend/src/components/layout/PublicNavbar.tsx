import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BrainCircuit, Github, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact', path: '/contact' },
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-slate-800/80">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              NeuroCloak
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary rounded border border-primary/30">
                CDT AI
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Cognitive Digital Twin & AI Oversight
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & GitHub */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://github.com/Thanvik931/NeuroCloak"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
            title="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>

          <button
            onClick={handleCTA}
            className="group px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all duration-200 flex items-center space-x-2"
          >
            <span>{token ? 'Go to Dashboard' : 'Login / Portal'}</span>
            {token ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-primary text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCTA();
              }}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-center flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
            >
              <span>{token ? 'Go to Dashboard' : 'Login / Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://github.com/Thanvik931/NeuroCloak"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-medium text-center flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>View Source on GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;

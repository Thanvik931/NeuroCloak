import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { BrainCircuit } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@neurocloak.ai', password: 'Admin123!' })
      });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="glass-panel w-full max-w-md p-8 relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">NeuroCloak</h1>
          <p className="text-slate-400 text-sm">Cognitive Digital Twin Monitor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="admin@neurocloak.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex justify-between">
              <span>Password</span>
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary tracking-wide shadow-lg shadow-primary/30"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
            <button 
              type="button" 
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-sm font-medium rounded-lg transition-all"
            >
              Login as Guest / Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

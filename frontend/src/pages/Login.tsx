import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BrainCircuit, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getIdToken
} from 'firebase/auth';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const token = await getIdToken(userCredential.user);
      setAuth({
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        role: 'ADMIN' // Default to ADMIN for this dashboard context
      }, token);

      navigate('/dashboard');
    } catch (err: any) {
      let friendlyError = 'Authentication failed';
      if (err.code === 'auth/user-not-found') friendlyError = 'Account not found. Please register first.';
      else if (err.code === 'auth/wrong-password') friendlyError = 'Incorrect password.';
      else if (err.code === 'auth/email-already-in-use') friendlyError = 'This email is already registered.';
      else if (err.code === 'auth/weak-password') friendlyError = 'Password should be at least 6 characters.';

      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);

      setAuth({
        id: result.user.uid,
        email: result.user.email || '',
        role: 'ADMIN'
      }, token);

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Firebase Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] opacity-40 animate-pulse pointer-events-none" />

      <div className="glass-panel w-full max-w-md p-10 relative z-10 border-slate-800/50 shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95 backdrop-blur-3xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center mb-5 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <BrainCircuit className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            NeuroCloak
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase opacity-70">Cognitive Digital Twin Monitor</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3 animate-in shake duration-300">
              <span className="shrink-0 text-lg">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-primary/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 focus:border-primary/50 text-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative flex items-center justify-center py-3.5 px-4 bg-primary hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isRegistering ? 'Create Security Account' : 'Sign In to Dashboard'}
              </span>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Google Identity
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

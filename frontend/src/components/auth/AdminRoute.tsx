import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert } from 'lucide-react';

export const AdminRoute = () => {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Strictly enforce Admin RBAC
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-xl max-w-md w-full border border-red-500/30 text-center">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-mono">ACCESS RESTRICTED</h2>
          <p className="text-slate-400 text-sm mb-6">
            Administrative privileges required. Your current account role is{' '}
            <span className="text-primary font-mono font-bold">{user?.role || 'VIEWER'}</span>.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;

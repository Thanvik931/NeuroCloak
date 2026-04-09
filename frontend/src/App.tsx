import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulate from './pages/Simulate';
import Decisions from './pages/Decisions';
import DecisionDetail from './pages/DecisionDetail';
import Systems from './pages/Systems';
import Analytics from './pages/Analytics';
import HowItWorks from './pages/HowItWorks';
import Layout from './components/layout/Layout';
import AssistantBot from './components/chat/AssistantBot';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

const GlobalLoader = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoader />}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/simulate" element={<ProtectedRoute><Simulate /></ProtectedRoute>} />
              <Route path="/decisions" element={<ProtectedRoute><Decisions /></ProtectedRoute>} />
              <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetail /></ProtectedRoute>} />
              <Route path="/systems" element={<ProtectedRoute><Systems /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <AssistantBot />
          </BrowserRouter>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;

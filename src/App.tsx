import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BotsList = lazy(() => import('./pages/BotsList'));
const BotSettings = lazy(() => import('./pages/BotSettings'));
const Conversations = lazy(() => import('./pages/Conversations'));
const Analytics = lazy(() => import('./pages/Analytics'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ChatWidget = lazy(() => import('./pages/ChatWidget'));

// Loading Fallback
function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Initializing Antigravity UI...</p>
      </div>
    </div>
  );
}

// Error Fallback
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-red-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4">Configuration Error</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  let user;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (err: any) {
    return <ErrorDisplay message="Auth Context failed to initialize. Did you add your Supabase URL/Key to Vercel environment variables?" />;
  }

  // Check if supabase is initialized (not placeholder)
  const isSupabaseConfigured = !window.location.hostname.includes('vercel.app') || 
    (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder'));

  if (!isSupabaseConfigured && window.location.hostname !== 'localhost') {
    return <ErrorDisplay message="Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be added to your Vercel project settings." />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage onLogin={() => window.location.href = '/login'} onSignup={() => window.location.href = '/login'} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/widget" element={<ChatWidget />} />
  
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bots" element={<BotsList />} />
          <Route path="/bots/new" element={<BotSettings />} />
          <Route path="/bots/:id" element={<BotSettings />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

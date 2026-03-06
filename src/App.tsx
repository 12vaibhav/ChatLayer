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
  const { user } = useAuth();

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

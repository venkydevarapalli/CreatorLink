import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const ChatDrawer = lazy(() => import('./components/chat/ChatDrawer'));
const ChatWidget = lazy(() => import('./components/chat/ChatWidget'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Dashboard = lazy(() => import('./pages/dashboards/Dashboard'));
const GigMarketplace = lazy(() => import('./pages/GigMarketplace'));
const BiddingManagement = lazy(() => import('./pages/BiddingManagement'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="dc-spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function ProtectedWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const suspenseFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="dc-spinner" />
    </div>
  );

  return (
    <Suspense fallback={suspenseFallback}>
      {/* Chat components – render globally for logged-in non-admin users */}
      {user && !isAdmin && <ChatDrawer />}
      {user && !isAdmin && <ChatWidget />}

      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected — wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<ProtectedWithLayout><Dashboard /></ProtectedWithLayout>} />
        <Route path="/gigs" element={<ProtectedWithLayout><GigMarketplace /></ProtectedWithLayout>} />
        <Route path="/gigs/create" element={<ProtectedWithLayout><GigMarketplace /></ProtectedWithLayout>} />
        <Route path="/gigs/:gigId" element={<ProtectedWithLayout><GigMarketplace /></ProtectedWithLayout>} />
        <Route path="/bids/manage" element={<ProtectedWithLayout><BiddingManagement /></ProtectedWithLayout>} />
        <Route path="/profile/:userId" element={<ProtectedWithLayout><PublicProfile /></ProtectedWithLayout>} />
        <Route path="/users/:userId" element={<ProtectedWithLayout><PublicProfile /></ProtectedWithLayout>} />
        <Route path="/search" element={<ProtectedWithLayout><SearchResults /></ProtectedWithLayout>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
            <div className="text-center animate-fade-in">
              <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
              <p className="text-[var(--color-muted-foreground)] mb-6">Page not found</p>
              <a href="/" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

function OAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    window.location.href = '/dashboard';
  }

  return <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-muted-foreground)]">Authenticating…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

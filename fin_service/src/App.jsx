import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';
import AppLayout from './components/layout/AppLayout';
import AICopilotDrawer from './components/aiadvisor/AICopilotDrawer';
import './App.css';

// Lazy-loaded page components for bundle size optimization
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Scenarios = lazy(() => import('./pages/Scenarios'));
const FinanceInput = lazy(() => import('./pages/FinanceInput'));
const Profile = lazy(() => import('./pages/Profile'));
const AIAdvisor = lazy(() => import('./pages/AIAdvisor'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppContent() {
  const location = useLocation();
  const isAppRoute = ['/dashboard', '/analytics', '/scenarios', '/finance-input', '/profile', '/advisor'].some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col">
      {!isAppRoute && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scenarios" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Scenarios />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance-input" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FinanceInput />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advisor" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIAdvisor />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path="*" 
              element={<NotFound />} 
            />
          </Routes>
        </Suspense>
      </main>
      <AICopilotDrawer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

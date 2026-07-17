import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scenarios" 
                element={
                  <ProtectedRoute>
                    <Scenarios />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finance-input" 
                element={
                  <ProtectedRoute>
                    <FinanceInput />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/advisor" 
                element={
                  <ProtectedRoute>
                    <AIAdvisor />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="*" 
                element={<NotFound />} 
              />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

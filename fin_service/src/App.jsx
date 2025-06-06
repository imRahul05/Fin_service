import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Scenarios from './pages/Scenarios';
import FinanceInput from './pages/FinanceInput';
import './App.css';
import Profile from './pages/Profile';
import AIAdvisor from './pages/AIAdvisor';
import NotFound from './pages/NotFound';
import ContactUsPage from './pages/ContactUsPage';

function App() {
  return (
    <Router>
     
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

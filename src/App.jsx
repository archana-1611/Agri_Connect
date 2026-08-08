import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AddResource from './pages/AddResource';
import ResourceDetails from './pages/ResourceDetails';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import ChatRoom from './pages/ChatRoom';
import MarketInsights from './pages/MarketInsights';
import SurplusPrediction from './pages/SurplusPrediction';
import SustainabilityDashboard from './pages/SustainabilityDashboard';
import DemandForecast from './pages/DemandForecast';
import ResetPassword from './pages/ResetPassword';
import TermsPrivacy from './pages/TermsPrivacy';
import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Seller Route wrapper (redirects buyers to dashboard)
const SellerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';
  if (isBuyer) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route wrapper (redirects authenticated users away from auth page)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isGuestPage = (!user && (location.pathname === '/auth' || location.pathname === '/')) || 
                     location.pathname === '/reset-password' || 
                     location.pathname === '/terms' || 
                     location.pathname === '/privacy';

  return (
    <div className={`app-layout ${isGuestPage ? 'guest-layout' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<TermsPrivacy initialTab="terms" />} />
          <Route path="/privacy" element={<TermsPrivacy initialTab="privacy" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/market-insights" element={<ProtectedRoute><MarketInsights /></ProtectedRoute>} />
          <Route path="/surplus-prediction" element={<ProtectedRoute><SurplusPrediction /></ProtectedRoute>} />
          <Route path="/sustainability" element={<ProtectedRoute><SustainabilityDashboard /></ProtectedRoute>} />
          <Route path="/demand-forecast" element={<ProtectedRoute><DemandForecast /></ProtectedRoute>} />
          <Route path="/add-resource" element={<SellerRoute><AddResource /></SellerRoute>} />
          <Route path="/resource/:id" element={<ProtectedRoute><ResourceDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isGuestPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ResourceProvider>
          <Router>
            <AppContent />
          </Router>
        </ResourceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AddResource from './pages/AddResource';
import ResourceDetails from './pages/ResourceDetails';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import ChatRoom from './pages/ChatRoom';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ResourceProvider>
        <Router>
          <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/add-resource" element={<AddResource />} />
              <Route path="/resource/:id" element={<ResourceDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat/:id" element={<ChatRoom />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </ResourceProvider>
    </AuthProvider>
  );
}

export default App;

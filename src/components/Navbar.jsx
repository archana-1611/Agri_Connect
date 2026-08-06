import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, UserCircle, LogOut, 
  MessageCircle, Home, Users, PlusCircle, User, Languages, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isTamil, toggleLanguage } = useLanguage();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    closeMobileMenu();
  };

  // Check if we are on Auth page to hide navbars if necessary
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/';

  // Apply collapsed class to body
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  if (isAuthPage && !user) return null; // Don't show nav on splash or auth if not logged in

  return (
    <>
      {/* Mobile Top Header Bar - only visible on small screens when logged in */}
      {user && (
        <header className="mobile-header">
          <button className="menu-toggle-btn" onClick={toggleMobileMenu} aria-label="Toggle Navigation">
            <Menu size={24} />
          </button>
          
          <Link to="/dashboard" className="mobile-brand">
            <img 
              src="/agriconnect_logo.png" 
              alt="AgriConnect Logo" 
              className="mobile-logo-img"
            />
            <span className="brand-name text-gradient">{isTamil ? 'உழவர்வளம்' : 'AgriConnect'}</span>
          </Link>

          <Link to="/profile" className="mobile-profile-btn">
            <UserCircle size={24} />
          </Link>
        </header>
      )}

      {/* Sidebar Overlay for mobile drawer */}
      {user && mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Persistent left sidebar (desktop) / Drawer sidebar (mobile) */}
      {user && (
        <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="sidebar-brand-wrapper">
              <img 
                src="/agriconnect_logo.png" 
                alt="AgriConnect Logo" 
                className="sidebar-logo-img"
              />
              <span className="brand-name text-gradient">{isTamil ? 'உழவர்வளம்' : 'AgriConnect'}</span>
            </div>
            
            <button className="sidebar-close-btn" onClick={closeMobileMenu}>
              <X size={20} />
            </button>
            <button className="desktop-collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Add Resource Button at the Top (Sellers/Farmers only) */}
          {user?.user_metadata?.role?.toLowerCase() !== 'buyer' && (
            <div className="sidebar-action-wrapper">
              <Link to="/add-resource" className="sidebar-add-btn" onClick={closeMobileMenu}>
                <PlusCircle size={20} />
                <span>{isTamil ? 'வளம் சேர்க்க' : 'Add Resource'}</span>
              </Link>
            </div>
          )}

          {/* Sidebar Navigation Links */}
          <nav className="sidebar-nav">
            <Link 
              to="/dashboard" 
              className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Home size={20} />
              <span>{isTamil ? 'முகப்பு' : 'Home'}</span>
            </Link>
            
            <Link 
              to="/marketplace" 
              className={`sidebar-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Users size={20} />
              <span>{isTamil ? 'சந்தை' : 'Marketplace'}</span>
            </Link>


            <Link 
              to="/messages" 
              className={`sidebar-link ${location.pathname === '/messages' || location.pathname.startsWith('/chat/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <MessageCircle size={20} />
              <span>{isTamil ? 'செய்திகள்' : 'Chats'}</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <User size={20} />
              <span>{isTamil ? 'சுயவிவரம்' : 'Profile'}</span>
            </Link>
          </nav>

          {/* Sidebar Footer Actions */}
          <div className="sidebar-footer">
            <button className="sidebar-lang-btn" onClick={toggleLanguage}>
              <Languages size={18} />
              <span>{isTamil ? 'English' : 'தமிழ்'}</span>
            </button>

            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>{isTamil ? 'வெளியேறு' : 'Logout'}</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default Navbar;

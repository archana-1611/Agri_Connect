import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, UserCircle, LayoutDashboard, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    if (user) {
      const fetchPendingCount = async () => {
        const { count, error } = await supabase
          .from('chat_requests')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
        
        if (!error) setPendingCount(count || 0);
      };

      const syncProfile = async () => {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            farm_name: user.user_metadata?.farm_name || '',
            practices: user.user_metadata?.practices || '',
            location: user.user_metadata?.location || '',
            phone: user.user_metadata?.phone || '',
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('Background sync failed:', err);
        }
      };

      syncProfile();
      fetchPendingCount();

      // Subscribe to changes
      const channel = supabase.channel('navbar-notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'chat_requests',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchPendingCount();
        })
        .subscribe();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        supabase.removeChannel(channel);
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    closeMobileMenu();
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="brand" onClick={closeMobileMenu}>
          <div className="logo-icon">
            <Sprout size={28} color="white" />
          </div>
          <span className="brand-name">AgriConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/marketplace" className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Marketplace
          </Link>
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`} style={{position: 'relative'}}>
            <MessageCircle size={18} /> Messages
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-10px',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" className="btn btn-primary login-btn" style={{padding: '0.5rem'}} title="Profile">
                <UserCircle size={24} />
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary login-btn" style={{padding: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none'}} title="Logout">
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-secondary login-btn">
              <UserCircle size={18} /> Login
            </Link>
          )}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} glass`}>
        <Link to="/" className="mobile-link" onClick={closeMobileMenu}>Home</Link>
        <Link to="/marketplace" className="mobile-link" onClick={closeMobileMenu}>Marketplace</Link>
        <Link to="/dashboard" className="mobile-link" onClick={closeMobileMenu}>Dashboard</Link>
        <Link to="/messages" className="mobile-link" onClick={closeMobileMenu} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          Messages
          {pendingCount > 0 && (
            <span style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {pendingCount}
            </span>
          )}
        </Link>
        {user ? (
          <>
            <Link to="/profile" className="mobile-link" onClick={closeMobileMenu}>Profile</Link>
            <button className="btn btn-secondary" onClick={handleLogout} style={{marginTop: '1rem', width: '100%', backgroundColor: '#fee2e2', color: '#ef4444'}}>Logout</button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={{marginTop: '1rem', width: '100%'}} onClick={closeMobileMenu}>Login</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;

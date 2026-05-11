import { ArrowRight, Sprout, ShieldCheck, TrendingUp, CheckCircle, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import './Home.css';

const Home = () => {
  const { resources, loading } = useResources();
  const location = useLocation();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const hasAddedCrop = localStorage.getItem('agri_crop_added');
    
    if (hasAddedCrop === 'true' || location.state?.showSuccess) {
      setNotification('Resource published successfully!');
      
      // Clean up both possible sources
      localStorage.removeItem('agri_crop_added');
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="home-page">
      {/* Success Notification Popup */}
      {notification && (
        <div 
          className="glass animate-fade-in" 
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <CheckCircle color="var(--color-primary)" size={24} />
          <span style={{fontWeight: '600', color: 'var(--text-main)'}}>{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem'}}
          >
            <X size={18} className="text-muted" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in stagger-1">
              Empowering the Future of <span className="text-gradient">Agriculture</span>
            </h1>
            <p className="hero-subtitle animate-fade-in stagger-2">
              Connect directly with buyers, rent modern equipment, and grow your farming business with our smart agricultural platform.
            </p>
            <div className="hero-actions animate-fade-in stagger-3">
              <Link to="/marketplace" className="btn btn-primary btn-lg">
                Explore Marketplace <ArrowRight size={20} />
              </Link>
              <Link to="/rentals" className="btn btn-secondary btn-lg glass">
                Rent Equipment
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-bg-overlay"></div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <div className="section-header text-center">
          <h2>Why Choose AgriConnect?</h2>
          <p className="text-muted">Designed specifically to meet the needs of modern farmers and buyers.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon bg-green-light">
              <Sprout size={32} color="var(--color-primary-dark)" />
            </div>
            <h3>Direct Market Access</h3>
            <p className="text-muted">Sell your produce directly to consumers and businesses without middlemen, ensuring fair prices.</p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon bg-gold-light">
              <TrendingUp size={32} color="var(--color-secondary)" />
            </div>
            <h3>Resource Sharing</h3>
            <p className="text-muted">Rent out your idle equipment or hire machinery on-demand to optimize your farm's efficiency.</p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon bg-blue-light">
              <ShieldCheck size={32} color="#3b82f6" />
            </div>
            <h3>Secure Transactions</h3>
            <p className="text-muted">Our platform guarantees secure, timely payments and verified user profiles for peace of mind.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section bg-light-green">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <h2>Fresh from the Farm</h2>
              <p className="text-muted">Discover seasonal, high-quality organic produce.</p>
            </div>
            <Link to="/marketplace" className="link-primary">See all products &rarr;</Link>
          </div>
          
          <div className="grid-cards">
            {loading ? (
              <p>Loading fresh produce...</p>
            ) : resources.length > 0 ? (
              resources.slice(0, 4).map(product => (
                <ResourceCard key={product.id} data={product} />
              ))
            ) : (
              <p className="text-muted">No products listed yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

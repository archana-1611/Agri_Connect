import { useEffect } from 'react';
import { ArrowRight, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="splash-page">
      <div className="splash-bg-overlay"></div>
      
      <div className="splash-content">
        <div className="logo-container animate-fade-in stagger-1">
          <img 
            src="/agriconnect_logo.png" 
            alt="AgriConnect Logo" 
            style={{
              width: '100px', 
              height: '100px', 
              borderRadius: '24px', 
              objectFit: 'cover',
              marginBottom: '1rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '3px solid white'
            }} 
            className="splash-logo-img hover-scale"
          />
          <h1 className="logo-text">AgriConnect</h1>
        </div>

        <div className="splash-actions animate-fade-in stagger-3" style={{ marginTop: '2.5rem' }}>
          <Link to="/auth" className="btn btn-primary btn-lg pulse-btn">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

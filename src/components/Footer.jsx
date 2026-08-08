import { Link } from 'react-router-dom';
import { Sprout, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="brand" style={{ color: 'var(--color-primary-dark)' }}>
            <Sprout size={32} color="var(--color-primary)" />
            <span className="brand-name" style={{ color: 'var(--color-primary-dark)' }}>AgriConnect</span>
          </div>
          <p className="footer-desc">
            Empowering farmers and buyers with a smart, connected agricultural marketplace and resource sharing platform.
          </p>

        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal & Support</h4>
          <ul>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Stay Updated</h4>
          <p>Get the latest market prices and farming tips directly to your inbox.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email address" required />
            <button type="submit" className="btn btn-primary"><Mail size={18} /></button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved. &bull; <Link to="/terms">Terms</Link> &bull; <Link to="/privacy">Privacy</Link></p>
      </div>
    </footer>
  );
};

export default Footer;

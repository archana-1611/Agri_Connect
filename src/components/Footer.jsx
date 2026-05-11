import { Sprout, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="brand" style={{ color: 'white' }}>
            <Sprout size={32} color="var(--color-primary-light)" />
            <span className="brand-name" style={{ color: 'white' }}>AgriConnect</span>
          </div>
          <p className="footer-desc">
            Empowering farmers and buyers with a smart, connected agricultural marketplace and resource sharing platform.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon">FB</a>
            <a href="#" className="social-icon">TW</a>
            <a href="#" className="social-icon">IG</a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><a href="/marketplace">Marketplace</a></li>
            <li><a href="/rentals">Rentals & Equipment</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Farmers Directory</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Farming Guides</a></li>
            <li><a href="#">Weather Forecast</a></li>
            <li><a href="#">Community Forum</a></li>
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
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

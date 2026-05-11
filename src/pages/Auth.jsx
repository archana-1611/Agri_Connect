import { useState } from 'react';
import { Phone, Lock, User, MapPin, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error: signInError } = await signIn({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        navigate('/dashboard');
      } else {
        const { error: signUpError } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              location,
              phone
            }
          }
        });

        if (signUpError) throw signUpError;
        alert('Check your email for the login link!');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card glass animate-fade-in">
        <h2 className="text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-muted mb-4">
          {isLogin ? 'Login to your account' : 'Join AgriConnect as a Farmer or Buyer'}
        </p>

        {error && (
          <div className="error-message" style={{backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <AlertCircle size={18} />
            <span style={{fontSize: '0.875rem'}}>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <select className="form-select" required value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">Select Role</option>
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <div className="form-group">
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input type="text" placeholder="Location (e.g. Punjab, India)" required value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" placeholder="Mobile Number (+91 9876543210)" required value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder={isLogin ? 'Password' : 'Create Password'} required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p className="text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="btn-link" onClick={() => {setIsLogin(!isLogin); setError('');}} type="button">
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

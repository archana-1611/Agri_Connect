import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isTamil } = useLanguage();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை!' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்!' : 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium reset-password-container" style={{ backgroundImage: "url('/tn_sunrise_farming.png')" }}>
      <div className="premium-auth-overlay"></div>
      <div className="container premium-auth-container flex-center">
        <div className="auth-card-panel animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="auth-card-premium white-card w-100">
            <div className="card-welcome-header mb-4 text-center">
              <img 
                src="/agriconnect_logo.png" 
                alt="AgriConnect Logo" 
                style={{ width: '80px', height: '80px', borderRadius: '16px', marginBottom: '1rem', border: '3px solid white', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }} 
              />
              <h2 className="welcome-title">
                {isTamil ? 'புதிய கடவுச்சொல்' : 'New Password'}
              </h2>
              <p className="welcome-subtitle">
                {isTamil ? 'உங்கள் புதிய கடவுச்சொல்லை உள்ளிட்டு சேமிக்கவும்' : 'Enter your new password below'}
              </p>
            </div>

            {error && (
              <div className="error-message glass-alert mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message glass-alert mb-3" style={{ borderColor: '#2e7d32', color: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <UserCheck size={16} />
                <span>{isTamil ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! உள்நுழைவு பக்கத்திற்கு செல்கிறது...' : 'Password updated successfully! Redirecting to login...'}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleResetPassword} className="auth-form flex-column gap-3">
                <div className="form-group">
                  <label className="input-label">{isTamil ? 'புதிய கடவுச்சொல்' : 'New Password'}</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={isTamil ? "புதிய கடவுச்சொல்" : "Enter new password"} 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      minLength={6} 
                      className="form-input-white"
                      style={{ paddingRight: '2.5rem' }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-eye-btn"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">{isTamil ? 'கடவுச்சொல்லை உறுதிப்படுத்தவும்' : 'Confirm New Password'}</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={isTamil ? "மீண்டும் கடவுச்சொல்" : "Confirm new password"} 
                      required 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      minLength={6} 
                      className="form-input-white"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-2 flex-center btn-lg auth-submit-btn-premium" 
                  disabled={loading}
                >
                  <span>{loading ? '...' : (isTamil ? 'கடவுச்சொல்லை மாற்று' : 'Update Password')}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

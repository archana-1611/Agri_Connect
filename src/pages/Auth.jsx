import { useState, useEffect } from 'react';
import { 
  Phone, Lock, User, MapPin, AlertCircle, Sprout, Languages, 
  ArrowRight, Sparkles, Eye, EyeOff, Users, Globe, Leaf, CloudSun, HelpCircle, UserCheck, Mail, Navigation 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import './Auth.css';
import { supabase } from '../lib/supabase';

const TAMIL_NADU_DISTRICTS = [
  { id: 'ariyalur', name: 'Ariyalur', nameTa: 'அரியலூர்' },
  { id: 'chengalpattu', name: 'Chengalpattu', nameTa: 'செங்கல்பட்டு' },
  { id: 'chennai', name: 'Chennai', nameTa: 'சென்னை' },
  { id: 'coimbatore', name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்' },
  { id: 'cuddalore', name: 'Cuddalore', nameTa: 'கடலூர்' },
  { id: 'dharmapuri', name: 'Dharmapuri', nameTa: 'தர்மபுரி' },
  { id: 'dindigul', name: 'Dindigul', nameTa: 'திண்டுக்கல்' },
  { id: 'erode', name: 'Erode', nameTa: 'ஈரோடு' },
  { id: 'kallakurichi', name: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி' },
  { id: 'kanchipuram', name: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்' },
  { id: 'kanyakumari', name: 'Kanyakumari', nameTa: 'கன்னியாகுமரி' },
  { id: 'karur', name: 'Karur', nameTa: 'கரூர்' },
  { id: 'krishnagiri', name: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி' },
  { id: 'madurai', name: 'Madurai', nameTa: 'மதுரை' },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை' },
  { id: 'nagapattinam', name: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்' },
  { id: 'namakkal', name: 'Namakkal', nameTa: 'நாமக்கல்' },
  { id: 'nilgiris', name: 'Nilgiris (Ooty)', nameTa: 'நீலகிரி (ஊட்டி)' },
  { id: 'perambalur', name: 'Perambalur', nameTa: 'பெரம்பலூர்' },
  { id: 'pollachi', name: 'Pollachi', nameTa: 'பொள்ளாச்சி' },
  { id: 'pudukkottai', name: 'Pudukkottai', nameTa: 'புதுக்கோட்டை' },
  { id: 'ramanathapuram', name: 'Ramanathapuram', nameTa: 'இராமநாதபுரம்' },
  { id: 'ranipet', name: 'Ranipet', nameTa: 'இராணிப்பேட்டை' },
  { id: 'salem', name: 'Salem', nameTa: 'சேலம்' },
  { id: 'sivaganga', name: 'Sivaganga', nameTa: 'சிவகங்கை' },
  { id: 'tenkasi', name: 'Tenkasi', nameTa: 'தென்காசி' },
  { id: 'thanjavur', name: 'Thanjavur', nameTa: 'தஞ்சாவூர்' },
  { id: 'theni', name: 'Theni', nameTa: 'தேனி' },
  { id: 'thoothukudi', name: 'Thoothukudi', nameTa: 'தூத்துக்குடி' },
  { id: 'trichy', name: 'Tiruchirappalli (Trichy)', nameTa: 'திருச்சிராப்பள்ளி (திருச்சி)' },
  { id: 'tirunelveli', name: 'Tirunelveli', nameTa: 'திருநெல்வேலி' },
  { id: 'tirupathur', name: 'Tirupathur', nameTa: 'திருப்பத்தூர்' },
  { id: 'tiruppur', name: 'Tiruppur', nameTa: 'திருப்பூர்' },
  { id: 'tiruvallur', name: 'Tiruvallur', nameTa: 'திருவள்ளூர்' },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை' },
  { id: 'tiruvarur', name: 'Tiruvarur', nameTa: 'திருவாரூர்' },
  { id: 'vellore', name: 'Vellore', nameTa: 'வேலூர்' },
  { id: 'viluppuram', name: 'Viluppuram', nameTa: 'விழுப்புரம்' },
  { id: 'virudhunagar', name: 'Virudhunagar', nameTa: 'விருதுநகர்' }
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isTamil, toggleLanguage } = useLanguage();
  
  // Form fields
  const [loginId, setLoginId] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Farmer');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // email for signup
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loginIdError, setLoginIdError] = useState('');
  
  // Email verification state
  const [verificationEmail, setVerificationEmail] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccessMessage, setResendSuccessMessage] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Location state
  const [exactLocation, setExactLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const validateEmail = (value) => {
    setEmail(value);
    if (!value) { setEmailError(''); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePhone = (value) => {
    const numValue = value.replace(/\D/g, '');
    setPhone(numValue);
    if (!numValue) { setPhoneError(''); return; }
    if (numValue.length !== 10) {
      setPhoneError(isTamil ? '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit mobile number');
    } else {
      setPhoneError('');
    }
  };

  const validateLoginId = (value) => {
    setLoginId(value);
    if (!value) { setLoginIdError(''); return; }
    const isEmail = value.includes('@');
    const isPhone = /^\d+$/.test(value);
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setLoginIdError(isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter a valid email address');
      } else {
        setLoginIdError('');
      }
    } else if (isPhone) {
      if (value.length !== 10) {
        setLoginIdError(isTamil ? '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit mobile number');
      } else {
        setLoginIdError('');
      }
    } else {
      setLoginIdError(isTamil ? 'சரியான மின்னஞ்சல் அல்லது மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid email or mobile number');
    }
  };

  // Handle resend verification link cooldown countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleGetExactLocation = () => {
    if (!navigator.geolocation) {
        alert(isTamil ? 'உங்கள் உலாவி புவி இருப்பிடத்தை ஆதரிக்கவில்லை' : 'Geolocation is not supported by your browser');
        return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setExactLocation({ lat: latitude, lng: longitude });
            setGettingLocation(false);
            alert(isTamil ? 'துல்லியமான இருப்பிடம் பெறப்பட்டது!' : 'Exact location retrieved successfully!');
        },
        (error) => {
            alert('Error getting location: ' + error.message);
            setGettingLocation(false);
        }
    );
  };

  const handleResendVerification = async (targetEmail) => {
    if (!targetEmail) return;
    setLoading(true);
    setError('');
    setResendSuccessMessage('');
    try {
      try {
        const response = await api.post('/auth/resend-verification', { email: targetEmail });
        setResendSuccessMessage(
          isTamil 
            ? 'சரிபார்ப்பு மின்னஞ்சல் வெற்றிகரமாக மீண்டும் அனுப்பப்பட்டது!' 
            : response.message || 'Verification email resent successfully! Please check your inbox.'
        );
      } catch (backendErr) {
        console.warn('Backend resend failed, falling back to native Supabase client:', backendErr);
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: targetEmail
        });
        if (resendError) throw resendError;
        setResendSuccessMessage(
          isTamil 
            ? 'சரிபார்ப்பு மின்னஞ்சல் வெற்றிகரமாக மீண்டும் அனுப்பப்பட்டது!' 
            : 'Verification email resent successfully! Please check your inbox.'
        );
      }
      setResendCooldown(60);
    } catch (err) {
      let msg = err.message || 'Failed to resend verification email';
      if (msg.toLowerCase().includes('security purposes') || msg.toLowerCase().includes('request this after')) {
        const match = msg.match(/(\d+)\s*seconds?/);
        const secs = match ? parseInt(match[1], 10) : 60;
        setResendCooldown(secs);
        msg = isTamil 
          ? `பாதுகாப்பு காரணங்களுக்காக, ${secs} வினாடிகளுக்குப் பிறகே மீண்டும் மின்னஞ்சல் கேட்க முடியும்.` 
          : `For security purposes, you can only request this after ${secs} seconds.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (emailError || phoneError || loginIdError) return;
    setLoading(true);
    setError('');
    setResendSuccessMessage('');

    try {
      if (isLogin) {
        const targetEmail = loginId.includes('@') ? loginId : `${loginId}@agriconnect.local`;
        const { error: signInError } = await signIn({
          email: targetEmail, 
          password,
        });
        
        if (signInError) {
          // Check if error is related to unconfirmed email
          if (signInError.message.toLowerCase().includes('confirm') || signInError.message.toLowerCase().includes('verify')) {
            setVerificationEmail(targetEmail);
            setResendCooldown(60);
            return;
          }
          throw signInError;
        }
        navigate('/dashboard');
      } else {
        // Try backend registration first (to use custom SMTP if configured)
        let signUpError = null;
        let requiresConfirmation = true;
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role,
                district,
                location: district,
                phone
              }
            }
          });
          console.log('Registration response:', response);
          if (response.requiresConfirmation === false) {
            requiresConfirmation = false;
          }
        } catch (backendErr) {
          console.warn('Backend registration failed/unconfigured, falling back to native Supabase client:', backendErr);
          // Fallback to client-side signUp
          const finalLocation = exactLocation 
          ? `${district}|${exactLocation.lat},${exactLocation.lng}`
          : district;

        const { error: clientError } = await signUp({
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              location: finalLocation,
              role: role
            }
          }
        });
          if (clientError) signUpError = clientError;
        }

        if (signUpError) throw signUpError;
        
        if (requiresConfirmation) {
          // Switch to verification pending display instead of alert + redirect
          setVerificationEmail(email);
          setResendCooldown(60);
        } else {
          // Switch to login form with success message
          setIsLogin(true);
          setLoginId(email);
          setPassword('');
          setMessage(isTamil ? 'பதிவு வெற்றிகரமாக முடிந்தது! இப்போது உள்நுழையவும்.' : 'Registration successful! Please log in with your credentials.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let targetEmail = forgotEmail.trim();
      if (!targetEmail) {
        setError(isTamil ? 'மின்னஞ்சல் அல்லது மொபைல் எண்ணை உள்ளிடவும்' : 'Please enter your email address or mobile number');
        setLoading(false);
        return;
      }

      let response;
      try {
        response = await api.post('/auth/forgot-password', { 
          email: targetEmail,
          redirectTo: `${window.location.origin}/reset-password`
        });
      } catch (backendErr) {
        console.warn('Backend forgot-password failed, falling back to client Supabase:', backendErr);
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) throw resetErr;
        response = { message: isTamil ? 'மின்னஞ்சலுக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Password reset link sent to your registered email!' };
      }

      setMessage(
        isTamil 
          ? 'உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரிக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு வெற்றிகரமாக அனுப்பப்பட்டது! உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.' 
          : response.message || 'Password reset link sent successfully to your registered email! Please check your inbox.'
      );
    } catch (err) {
      setError(err.message || (isTamil ? 'மின்னஞ்சல் அனுப்புவதில் தோல்வி ஏற்பட்டது' : 'Failed to send password reset email'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Attempt login with default demo account
      const { error: signInError } = await signIn({
        email: 'demo@agriconnect.local',
        password: 'password123',
      });
      
      if (signInError) {
        // If not present, create the demo account dynamically on demand
        const { error: signUpError } = await signUp({
          email: 'demo@agriconnect.local',
          password: 'password123',
          options: {
            data: {
              full_name: 'Demo Farmer',
              role: 'Farmer',
              district: 'Coimbatore',
              location: 'Coimbatore',
              phone: '9876543210'
            }
          }
        });
        
        if (signUpError) throw signUpError;

        // Try signing in again
        const { error: retryError } = await signIn({
          email: 'demo@agriconnect.local',
          password: 'password123',
        });
        if (retryError) throw retryError;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed. Please register a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium" style={{ backgroundImage: "url('/tn_sunrise_farming.png')" }}>
      {/* Background Soft Overlay */}
      <div className="premium-auth-overlay"></div>

      <div className="container premium-auth-container">
        
        {/* Main Split Layout Row */}
        <div className="auth-layout-grid">
          
          {/* Left Panel: Branding & Farmer Graphics Card */}
          <div className="auth-branding-panel animate-fade-in">
            <div className="branding-logo-wrapper">
              <img 
                src="/agriconnect_logo.png" 
                alt="AgriConnect Logo" 
                className="branding-large-logo" 
              />
              <div className="branding-meta">
                <h1 className="logo-brand-title text-gradient-gold">{isTamil ? 'உழவர்வளம்' : 'AgriConnect'}</h1>
                <p className="branding-tagline">
                  {isTamil ? 'அதிநவீன விவசாய வள மேலாண்மை தளம்' : 'Smart Agricultural Resource Management Platform'}
                </p>
              </div>
            </div>

            {/* Farmer Illustration Feature Card */}
            <div className="farmer-feature-card-wrapper mt-4">
              <div className="farmer-image-col">
                <img 
                  src="/tamil_farmer_art.png" 
                  alt="Farmer illustration" 
                  className="tamil-farmer-illustration" 
                />
              </div>
              <div className="feature-bullets-col">
                <div className="bullet-row">
                  <div className="bullet-icon-wrapper">
                    <Users size={16} />
                  </div>
                  <div>
                    <h5>{isTamil ? 'சிறந்த வாய்ப்புகள்' : 'Better Opportunities'}</h5>
                    <p>{isTamil ? 'உறுதிப்படுத்தப்பட்ட வாங்குபவர்களுடன் நேரடி தொடர்பு' : 'Connect with verified buyers'}</p>
                  </div>
                </div>

                <div className="bullet-row">
                  <div className="bullet-icon-wrapper">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <h5>{isTamil ? 'நிலையான எதிர்காலம்' : 'Sustainable Future'}</h5>
                    <p>{isTamil ? 'கழிவுகளை குறைத்து, கூடுதல் மதிப்பு காணுங்கள்' : 'Reduce waste, increase value'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: White Card Login Box */}
          <div className="auth-card-panel animate-fade-in stagger-1">
            <div className="auth-card-premium white-card w-100">
              
              {/* Language Selector in top right of card */}
              <button 
                type="button" 
                className="card-lang-toggle" 
                onClick={toggleLanguage}
              >
                <Globe size={14} />
                <span>{isTamil ? 'English' : 'தமிழ்'}</span>
              </button>

              {verificationEmail ? (
                <div className="auth-form flex-column gap-3">
                  <div className="card-welcome-header mb-4 text-center">
                    <div className="verification-icon-wrapper mb-3" style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                      <Mail size={32} />
                    </div>
                    <h2 className="welcome-title">
                      {isTamil ? 'மின்னஞ்சலைச் சரிபார்க்கவும்' : 'Verify Your Email'}
                    </h2>
                    <p className="welcome-subtitle mt-2">
                      {isTamil 
                        ? 'உங்கள் கணக்கைச் செயல்படுத்த சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டுள்ளது.'
                        : 'A verification link has been sent to activate your account.'}
                    </p>
                  </div>

                  {error && (
                    <div className="error-message glass-alert mb-3">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {resendSuccessMessage && (
                    <div className="success-message glass-alert mb-3" style={{ borderColor: '#2e7d32', color: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <UserCheck size={16} />
                      <span>{resendSuccessMessage}</span>
                    </div>
                  )}

                  <div className="glass-alert mb-4" style={{ borderColor: '#2e7d32', background: 'rgba(46, 125, 50, 0.05)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <p className="mb-2" style={{ color: '#ffffff' }}>
                      {isTamil 
                        ? 'நாங்கள் சரிபார்ப்பு இணைப்பை அனுப்பியுள்ளோம்:' 
                        : 'We sent a verification link to:'}
                    </p>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#fde047', margin: '0.5rem 0' }}>{verificationEmail}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                      {isTamil 
                        ? 'உங்கள் கணக்கைச் செயல்படுத்த உங்கள் இன்பாக்ஸில் உள்ள இணைப்பைக் கிளிக் செய்க.'
                        : 'Please check your inbox and click the link to activate your account.'}
                    </p>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleResendVerification(verificationEmail)}
                    className="btn btn-primary w-100 mt-2 flex-center btn-lg auth-submit-btn-premium" 
                    disabled={loading || resendCooldown > 0}
                  >
                    <span>
                      {resendCooldown > 0 
                        ? (isTamil ? `மீண்டும் அனுப்பவும் (${resendCooldown}s)` : `Resend Link (${resendCooldown}s)`)
                        : (isTamil ? 'மின்னஞ்சலை மீண்டும் அனுப்பவும்' : 'Resend Verification Email')}
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setVerificationEmail(null);
                        setError('');
                        setResendSuccessMessage('');
                      }} 
                      className="btn-link-green"
                    >
                      {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
                    </button>
                  </div>
                </div>
              ) : isForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="auth-form flex-column gap-3">
                  <div className="card-welcome-header mb-4">
                    <h2 className="welcome-title">
                      {isTamil ? 'கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset Password'}
                    </h2>
                    <p className="welcome-subtitle">
                      {isTamil 
                        ? 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்' 
                        : 'Enter your email address to receive a recovery link'}
                    </p>
                  </div>

                  {error && (
                    <div className="error-message glass-alert mb-3">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {message && (
                    <div className="success-message glass-alert mb-3" style={{ borderColor: '#2e7d32', color: '#2e7d32', background: 'rgba(46, 125, 50, 0.1)', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <UserCheck size={16} />
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="input-label">{isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}</label>
                    <div className="input-with-icon">
                      <Globe size={18} className="input-icon" />
                      <input 
                        type="email" 
                        placeholder={isTamil ? "மின்னஞ்சல் முகவரி" : "Enter your email address"} 
                        required 
                        value={forgotEmail} 
                        onChange={e => setForgotEmail(e.target.value)} 
                        className="form-input-white"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mt-2 flex-center btn-lg auth-submit-btn-premium" 
                    disabled={loading}
                  >
                    <span>{loading ? '...' : (isTamil ? 'இணைப்பை அனுப்பு' : 'Send Reset Link')}</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPassword(false);
                        setError('');
                        setMessage('');
                      }} 
                      className="btn-link-green"
                    >
                      {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="card-welcome-header mb-4">
                    <h2 className="welcome-title">
                      {isTamil 
                        ? (isLogin ? 'மீண்டும் வருக!' : 'கணக்கை உருவாக்கு') 
                        : (isLogin ? 'Welcome Back!' : 'Create Account')}
                    </h2>
                    <p className="welcome-subtitle">
                      {isTamil 
                        ? (isLogin ? 'உங்கள் உழவர்வளம் கணக்கில் உள்நுழையவும்' : 'உழவர்வளத்தில் இப்போதே இணையுங்கள்') 
                        : (isLogin ? 'Login to your AgriConnect account' : 'Join the smart agriculture platform')}
                    </p>
                  </div>

                  {error && (
                    <div className="error-message glass-alert mb-3">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuth} className="auth-form flex-column gap-3">
                    
                    {/* 1. Name input (Sign Up Only) */}
                    {!isLogin && (
                      <div className="form-group">
                        <label className="input-label">{isTamil ? 'முழு பெயர்' : 'Full Name'}</label>
                        <div className="input-with-icon">
                          <User size={18} className="input-icon" />
                          <input 
                            type="text" 
                            placeholder={isTamil ? "உதாரணம்: இராதாகிருஷ்ணன்" : "Enter your full name"} 
                            required 
                            value={fullName} 
                            onChange={e => setFullName(e.target.value)} 
                            className="form-input-white"
                            autoComplete="name"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. Mobile input (Sign Up Only) */}
                    {!isLogin && (
                      <div className="form-group">
                        <label className="input-label">{isTamil ? 'மொபைல் எண்' : 'Mobile Number'}</label>
                        <div className="input-with-icon">
                          <Phone size={18} className="input-icon" />
                          <input 
                            type="tel" 
                            placeholder={isTamil ? "10 இலக்க எண்" : "Enter mobile number"} 
                            required 
                            value={phone} 
                            onChange={e => validatePhone(e.target.value)} 
                            className={`form-input-white ${phoneError ? 'input-error' : ''}`}
                            maxLength={10}
                            autoComplete="tel"
                          />
                        </div>
                        {phoneError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{phoneError}</div>}
                      </div>
                    )}

                    {/* Email input (Sign Up Only) */}
                    {!isLogin && (
                      <div className="form-group">
                        <label className="input-label">{isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}</label>
                        <div className="input-with-icon">
                          <Globe size={18} className="input-icon" />
                          <input 
                            type="email" 
                            placeholder={isTamil ? "மின்னஞ்சல் முகவரி" : "Enter email address"} 
                            required 
                            value={email} 
                            onChange={e => validateEmail(e.target.value)} 
                            className={`form-input-white ${emailError ? 'input-error' : ''}`}
                            autoComplete="email"
                          />
                        </div>
                        {emailError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{emailError}</div>}
                      </div>
                    )}

                    {/* 3. District Selector (Sign Up Only) */}
                    {!isLogin && (
                      <div className="form-group">
                        <label className="input-label">{isTamil ? 'வட்டாரம் / மாவட்டம்' : 'Select District'}</label>
                        <div className="input-with-icon">
                          <MapPin size={18} className="input-icon" />
                          <select 
                            className="form-input-white form-select-white" 
                            required 
                            value={district} 
                            onChange={e => setDistrict(e.target.value)}
                            style={{ height: '44px', paddingLeft: '2.75rem' }}
                          >
                            <option value="">{isTamil ? "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்" : "Select District"}</option>
                            {TAMIL_NADU_DISTRICTS.map(dist => (
                              <option key={dist.id} value={dist.id}>
                                {isTamil ? dist.nameTa : dist.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            type="button" 
                            onClick={handleGetExactLocation}
                            disabled={gettingLocation || exactLocation !== null}
                            style={{
                              background: exactLocation ? '#e0f2fe' : 'rgba(34, 197, 94, 0.1)',
                              color: exactLocation ? '#0284c7' : 'var(--color-primary)',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: (gettingLocation || exactLocation) ? 'default' : 'pointer'
                            }}
                          >
                            <Navigation size={14} />
                            {gettingLocation 
                              ? (isTamil ? 'பெறுகிறது...' : 'Locating...') 
                              : exactLocation 
                                ? (isTamil ? 'துல்லியமான இருப்பிடம் பெறப்பட்டது' : 'Exact Location Retrieved')
                                : (isTamil ? 'துல்லியமான இருப்பிடத்தைப் பெறுக' : 'Get Exact Location')
                            }
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. Role Selection (Sign Up Only) */}
                    {!isLogin && (
                      <div className="form-group">
                        <label className="input-label mb-2">{isTamil ? 'உறுப்பினர் பங்கு' : 'Select Platform Role'}</label>
                        <div className="role-selector">
                          <label className={`role-card-white ${role === 'Farmer' ? 'active' : ''}`}>
                            <input type="radio" name="role" value="Farmer" checked={role === 'Farmer'} onChange={e => setRole(e.target.value)} required />
                            <Sprout size={18} />
                            <span>{isTamil ? 'விவசாயி' : 'Farmer'}</span>
                          </label>
                          <label className={`role-card-white ${role === 'Buyer' ? 'active' : ''}`}>
                            <input type="radio" name="role" value="Buyer" checked={role === 'Buyer'} onChange={e => setRole(e.target.value)} />
                            <User size={18} />
                            <span>{isTamil ? 'வாங்குபவர்' : 'Buyer'}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 5. Mobile / Email Login input (Login Only) */}
                    {isLogin && (
                      <div className="form-group">
                        <label className="input-label">{isTamil ? 'மொபைல் எண் / மின்னஞ்சல்' : 'Mobile Number / Email'}</label>
                        <div className="input-with-icon">
                          <User size={18} className="input-icon" />
                          <input 
                            type="text" 
                            placeholder={isTamil ? "மொபைல் எண் அல்லது மின்னஞ்சல்" : "Enter mobile number or email"} 
                            required 
                            value={loginId} 
                            onChange={e => validateLoginId(e.target.value)} 
                            className={`form-input-white ${loginIdError ? 'input-error' : ''}`}
                            autoComplete="username"
                          />
                        </div>
                        {loginIdError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{loginIdError}</div>}
                      </div>
                    )}
                    
                    {/* 6. Password Input */}
                    <div className="form-group">
                      <label className="input-label">{isTamil ? 'கடவுச்சொல்' : 'Password'}</label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder={isTamil ? "கடவுச்சொல்" : "Enter your password"} 
                          required 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          minLength={6} 
                          className="form-input-white"
                          style={{ paddingRight: '2.5rem' }}
                          autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-eye-btn"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {isLogin && (
                        <div className="text-right mt-1">
                          <button 
                            type="button" 
                            onClick={() => {
                              setIsForgotPassword(true);
                              if (loginId) {
                                setForgotEmail(loginId);
                              }
                              setError('');
                              setMessage('');
                            }}
                            className="forgot-password-link text-xxs font-bold"
                          >
                            {isTamil ? 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 mt-2 flex-center btn-lg auth-submit-btn-premium" 
                      disabled={loading}
                    >
                      <span>{loading ? '...' : (isLogin ? (isTamil ? 'உள்நுழை' : 'Login') : (isTamil ? 'பதிவு செய்' : 'Sign Up'))}</span>
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  {/* Card Switch Links */}
                  <div className="auth-footer text-center mt-4 pt-3 border-top-light">
                    <p className="switch-card-text">
                      {isLogin 
                        ? (isTamil ? "கணக்கு இல்லையா? " : "Don't have an account? ") 
                        : (isTamil ? "ஏற்கனவே கணக்கு உள்ளதா? " : "Already have an account? ")}
                      <button 
                        className="btn-link-green" 
                        onClick={() => {setIsLogin(!isLogin); setError('');}} 
                        type="button"
                      >
                        {isLogin ? (isTamil ? 'புதிய கணக்கு' : 'Sign up') : (isTamil ? 'உள்நுழைக' : 'Login')}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Panel: Smart Agriculture Services */}
        <section className="smart-highlights-section mt-5 animate-fade-in stagger-2">
          
          <div className="section-title-wrapper mb-4">
            <span className="section-subtitle-line"></span>
            <span className="section-subtitle-text uppercase">
              <Sprout size={14} className="inline-icon" /> {isTamil ? 'உழவர்வள சேவைகள்' : 'Smart Agriculture Services'}
            </span>
            <span className="section-subtitle-line"></span>
          </div>

          <h3 className="section-main-title text-center font-bold mb-4">
            {isTamil ? 'அதிநவீன வேளாண் சேவைகள்' : 'Smart Agriculture Services'}
          </h3>
          
          <div className="highlights-grid">
            
            {/* Card 1: Marketplace */}
            <div className="highlight-pill service-card-white hover-scale">
              <div className="service-icon-col">
                <Sprout size={24} />
              </div>
              <div className="service-desc-col">
                <h4>{isTamil ? 'சந்தை முற்றம்' : 'Smart Marketplace'}</h4>
                <p>{isTamil ? 'விவசாய கழிவுகளை எளிதாக வாங்கலாம் மற்றும் விற்கலாம்.' : 'Buy & sell surplus agricultural resources easily.'}</p>
              </div>
            </div>

            {/* Card 2: Nearby Buyers */}
            <div className="highlight-pill service-card-white hover-scale">
              <div className="service-icon-col">
                <MapPin size={24} />
              </div>
              <div className="service-desc-col">
                <h4>{isTamil ? 'வட்டார வாங்குபவர்கள்' : 'Nearby Buyers'}</h4>
                <p>{isTamil ? 'அருகிலுள்ள அங்கீகரிக்கப்பட்ட வாங்குபவர்களை உடனடியாக கண்டறியுங்கள்.' : 'Find verified buyers near your location instantly.'}</p>
              </div>
            </div>

            {/* Card 3: Weather Updates */}
            <div className="highlight-pill service-card-white hover-scale">
              <div className="service-icon-col">
                <CloudSun size={24} />
              </div>
              <div className="service-desc-col">
                <h4>{isTamil ? 'வானிலை தகவல்கள்' : 'Weather Updates'}</h4>
                <p>{isTamil ? 'உடனுக்குடனான வானிலை மற்றும் பயிர் பாதுகாப்பு எச்சரிக்கைகள்.' : 'Real-time weather and crop advisory alerts.'}</p>
              </div>
            </div>

            {/* Card 4: Help & Support */}
            <div className="highlight-pill service-card-white hover-scale">
              <div className="service-icon-col">
                <HelpCircle size={24} />
              </div>
              <div className="service-desc-col">
                <h4>{isTamil ? 'உதவி & ஆதரவு' : 'Help & Support'}</h4>
                <p>{isTamil ? 'உங்களுக்கு தேவையான போதெல்லாம் உதவி மற்றும் ஆலோசனை பெறலாம்.' : 'Get assistance whenever you need it.'}</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Auth;

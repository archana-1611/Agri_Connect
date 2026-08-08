import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, ArrowLeft, CheckCircle2, UserCheck, AlertTriangle, Scale, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './TermsPrivacy.css';

const TermsPrivacy = ({ initialTab = 'terms' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isTamil } = useLanguage();

  // Set active tab based on path or prop
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('privacy')) return 'privacy';
    return initialTab;
  });

  useEffect(() => {
    if (location.pathname.includes('privacy')) {
      setActiveTab('privacy');
    } else if (location.pathname.includes('terms')) {
      setActiveTab('terms');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`, { replace: true });
  };

  const handleBack = () => {
    if (window.history.length > 2 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="terms-privacy-container">
      <div className="terms-privacy-header">
        <button className="back-btn" type="button" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>{isTamil ? 'பின்செல்ல' : 'Back'}</span>
        </button>
        <div className="header-badge">
          <ShieldCheck size={20} color="var(--color-primary, #15803d)" />
          <span>{isTamil ? 'சட்ட ரீதியான மற்றும் தனியுரிமை' : 'Legal & Compliance'}</span>
        </div>
        <h1 className="header-title">
          {activeTab === 'terms' 
            ? (isTamil ? 'சேவை விதிமுறைகள் (Terms of Service)' : 'Terms of Service')
            : (isTamil ? 'தனியுரிமைக் கொள்கை (Privacy Policy)' : 'Privacy Policy')
          }
        </h1>
        <p className="header-subtitle">
          {isTamil 
            ? 'அக்ரிகனெக்ட் தளத்தை பாதுகாப்பாகவும் நேர்மையாகவும் பயன்படுத்துவதற்கான வழிகாட்டுதல்கள்.' 
            : 'Last updated: August 2026. Please read our terms and policy carefully before using AgriConnect.'
          }
        </p>

        {/* Tab Selector */}
        <div className="policy-tabs">
          <button 
            className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => handleTabChange('terms')}
          >
            <FileText size={18} />
            <span>{isTamil ? 'விதிமுறைகள் (Terms)' : 'Terms of Service'}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => handleTabChange('privacy')}
          >
            <Lock size={18} />
            <span>{isTamil ? 'தனியுரிமை (Privacy)' : 'Privacy Policy'}</span>
          </button>
        </div>
      </div>

      <div className="terms-privacy-content">
        {activeTab === 'terms' ? (
          <div className="policy-section">
            <div className="section-card">
              <div className="card-header">
                <Scale className="icon" size={24} />
                <h2>{isTamil ? '1. கணக்கு மற்றும் தளம் பயன்பாடு' : '1. Acceptance & Account Responsibilities'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'அக்ரிகனெக்ட் தளத்தில் கணக்கு உருவாக்குவதன் மூலம், விவசாயிகள் மற்றும் வாங்குபவர்கள் வழங்கும் தகவல்கள் துல்லியமாகவும் உண்மையாகவும் இருக்க வேண்டும் என்பதை ஒப்புக்கொள்கிறீர்கள்.'
                  : 'By registering and using AgriConnect, you agree to comply with all platform policies. Users must provide valid, accurate contact details and farm residue listing specifications.'}
              </p>
              <ul>
                <li><CheckCircle2 size={16} /> {isTamil ? 'விவசாயிகள் விற்பனைக்கு பதிவிடும் கழிவுகள் துல்லியமான அளவோடு இருக்க வேண்டும்.' : 'Residue quantity, moisture content, and crop details must be listed accurately.'}</li>
                <li><CheckCircle2 size={16} /> {isTamil ? 'கணக்கு கடவுச்சொல் மற்றும் பாதுகாப்பு விவரங்களை பயனரே பொறுப்பேற்க வேண்டும்.' : 'Users are responsible for preserving account security and credentials.'}</li>
                <li><CheckCircle2 size={16} /> {isTamil ? 'போலி விவரங்கள் அல்லது தவறான பட்டியல் அளித்தால் கணக்கு இடைநிறுத்தப்படும்.' : 'Fraudulent listings or dishonest pricing will result in immediate account restriction.'}</li>
              </ul>
            </div>

            <div className="section-card">
              <div className="card-header">
                <UserCheck className="icon" size={24} />
                <h2>{isTamil ? '2. விவசாயக் கழிவுகள் வர்த்தகம் மற்றும் பரிவர்த்தனை' : '2. Biomass & Crop Residue Trading Rules'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'அக்ரிகனெக்ட் விவசாயிகள் மற்றும் தொழில்துறை வாங்குபவர்களுக்கு இடையே நேரடி இணைப்பை ஏற்படுத்துகிறது.'
                  : 'AgriConnect facilitates direct communication and resource negotiation between farmers and eco-industry buyers.'}
              </p>
              <ul>
                <li><CheckCircle2 size={16} /> {isTamil ? 'பயிர்க்கழிவு தரம் மற்றும் விநியோக நேரத்தை விற்பனையாளர் மற்றும் வாங்குபவர் இருபுறமும் உறுதிசெய்ய வேண்டும்.' : 'Delivery schedules and biomass quality inspection should be verified prior to dispatch.'}</li>
                <li><CheckCircle2 size={16} /> {isTamil ? 'பயிர்க்கழிவு ஏற்றுமதி மற்றும் போக்குவரத்து செலவுகள் ஒப்புக்கொள்ளப்பட்ட அடிப்படையில் அமையும்.' : 'Transport logistics and loading costs must follow mutual buyer-seller terms.'}</li>
              </ul>
            </div>

            <div className="section-card">
              <div className="card-header">
                <AlertTriangle className="icon" size={24} />
                <h2>{isTamil ? '3. பொறுப்பு வரம்பு மற்றும் வழிகாட்டுதல்' : '3. Limitation of Liability'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'இயற்கை சீற்றங்கள், வானிலை மாற்றங்கள் அல்லது போக்குவரத்து தாமதங்களால் ஏற்படும் பாதிப்புகளுக்கு தளம் பொறுப்பாகாது.'
                  : 'AgriConnect strives to ensure high availability and market insights accuracy. However, market price fluctuations and weather interruptions are external factors.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="policy-section">
            <div className="section-card">
              <div className="card-header">
                <Eye className="icon" size={24} />
                <h2>{isTamil ? '1. சேகரிக்கப்படும் தகவல்கள்' : '1. Information We Collect'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'உங்கள் பெயர், தொலைபேசி எண், மாவட்டம், பண்ணை இருப்பிடம் மற்றும் பயிர்க்கழிவு தொடர்பான விவரங்களை மட்டுமே நாங்கள் சேகரிக்கிறோம்.'
                  : 'We collect relevant identity details including full name, phone number, district, geolocation (for transport estimates), and residue listing information.'}
              </p>
            </div>

            <div className="section-card">
              <div className="card-header">
                <Lock className="icon" size={24} />
                <h2>{isTamil ? '2. தகவல் பாதுகாப்பு மற்றும் பயன்பாடு' : '2. Data Protection & Privacy'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'உங்கள் தனிப்பட்ட தகவல்கள் மூன்றாம் நபர்களுக்கு விற்கப்படாது. விவசாயி மற்றும் வாங்குபவர் இடையே வர்த்தகத்தை எளிதாக்க மட்டுமே தகவல்கள் பயன்படுத்தப்படும்.'
                  : 'Your personal data is encrypted and secure. We strictly do NOT sell or share personal information to third-party ad networks.'}
              </p>
              <ul>
                <li><CheckCircle2 size={16} /> {isTamil ? 'தொலைபேசி எண் சரிபார்க்கப்பட்ட வர்த்தகர்களுக்கு மட்டுமே காட்டப்படும்.' : 'Phone numbers are disclosed only to matched buyers/sellers for logistics contact.'}</li>
                <li><CheckCircle2 size={16} /> {isTamil ? 'எந்த நேரத்திலும் உங்கள் கணக்கு தகவலை திருத்தவோ அல்லது நீக்கவோ முடியும்.' : 'Users retain the right to modify or request deletion of their profile data.'}</li>
              </ul>
            </div>

            <div className="section-card">
              <div className="card-header">
                <ShieldCheck className="icon" size={24} />
                <h2>{isTamil ? '3. தொடர்பு கொள்ள' : '3. Contact Us'}</h2>
              </div>
              <p>
                {isTamil
                  ? 'தனியுரிமை மற்றும் கொள்கைகள் குறித்து ஏதேனும் கேள்விகள் இருந்தால், எங்களது ஆதரவு குழுவை தொடர்பு கொள்ளவும்: support@agriconnect.com'
                  : 'For privacy inquiries or compliance questions, please contact our support team at support@agriconnect.com'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsPrivacy;

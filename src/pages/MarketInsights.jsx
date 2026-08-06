import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, TrendingDown, Info, ShieldAlert, Award, 
  MapPin, CheckCircle, HelpCircle, Thermometer, CloudRain, Wind, ChevronRight,
  RefreshCw, Check, Activity, Wifi
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MarketInsights.css';

// Government Schemes Registry
const SCHEMES_DB = [
  {
    id: 1,
    name: 'PM-KISAN Samman Nidhi',
    nameTa: 'பிரதமர் கிசான் திட்டம்',
    sponsor: 'Central Govt',
    sponsorTa: 'மத்திய அரசு',
    benefit: '₹6,000 per year (3 installments)',
    benefitTa: 'ஆண்டுக்கு ₹6,000 (3 தவணைகளில்)',
    eligibility: 'All small & marginal landholder farmer families.',
    eligibilityTa: 'அனைத்து சிறு மற்றும் குறு விவசாய குடும்பங்கள்.',
    link: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx'
  },
  {
    id: 2,
    name: 'TN Solar Powered Pump Subsidy',
    nameTa: 'தமிழக சோலார் பம்ப் மானியம்',
    sponsor: 'TN State Govt',
    sponsorTa: 'தமிழக அரசு',
    benefit: '90% subsidy for installing 5HP to 10HP solar pumps',
    benefitTa: '5HP முதல் 10HP சோலார் பம்புகளுக்கு 90% மானியம்',
    eligibility: 'Farmers having a valid well/borewell with cultivation land.',
    eligibilityTa: 'முறையான கிணறு/ஆழ்துளை கிணறு மற்றும் விவசாய நிலம் கொண்ட விவசாயிகள்.',
    link: 'https://aed.tn.gov.in/'
  },
  {
    id: 3,
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameTa: 'பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
    sponsor: 'Joint Govt',
    sponsorTa: 'கூட்டு அரசு',
    benefit: 'Financial support against crop loss due to natural calamities',
    benefitTa: 'இயற்கை சீற்றங்களால் ஏற்படும் பயிர் இழப்பிற்கு நிதியுதவி',
    eligibility: 'All farmers growing notified crops in notified areas.',
    eligibilityTa: 'அறிவிக்கப்பட்ட பகுதிகளில் அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் விவசாயிகள்.',
    link: 'https://pmfby.gov.in/'
  },
  {
    id: 4,
    name: 'TN Micro Irrigation Scheme',
    nameTa: 'துளிநீர் பாசனத் திட்டம்',
    sponsor: 'TN State Govt',
    sponsorTa: 'தமிழக அரசு',
    benefit: '100% subsidy for Small/Marginal farmers, 75% for other farmers',
    benefitTa: 'சிறு/குறு விவசாயிகளுக்கு 100% மானியம், பிறருக்கு 75% மானியம்',
    eligibility: 'Acreage under 5 acres for 100% subsidy, borewell irrigation setup.',
    eligibilityTa: '100% மானியத்திற்கு 5 ஏக்கருக்கும் குறைவான நிலம் கொண்டிருக்க வேண்டும்.',
    link: 'https://tndrip.tn.gov.in/'
  }
];

// Uzhavar Sandhai Live Prices database
const MARKET_PRICES = [
  { id: 1, crop: 'Paddy (Super Fine)', cropTa: 'நெல் (சூப்பர் ஃபைன்)', unit: 'Quintal (100kg)', priceToday: 2450, priceYesterday: 2380, trend: '+2.9%' },
  { id: 2, crop: 'Coimbatore Tomato', cropTa: 'கோவை தக்காளி', unit: 'Box (25kg)', priceToday: 650, priceYesterday: 720, trend: '-9.7%' },
  { id: 3, crop: 'Erode Turmeric', cropTa: 'ஈரோடு மஞ்சள்', unit: 'Quintal (100kg)', priceToday: 12400, priceYesterday: 12100, trend: '+2.4%' },
  { id: 4, crop: 'Pollachi Coconut', cropTa: 'பொள்ளாச்சி தேங்காய்', unit: '1000 Pieces', priceToday: 14500, priceYesterday: 14500, trend: '0.0%' },
  { id: 5, crop: 'Bellary Onion', cropTa: 'பெல்லாரி வெங்காயம்', unit: 'Bag (50kg)', priceToday: 1850, priceYesterday: 1650, trend: '+12.1%' }
];

const MarketInsights = () => {
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  // Live Price Sync states
  const [prices, setPrices] = useState(MARKET_PRICES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [lastSynced, setLastSynced] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSyncPrices = () => {
    setIsSyncing(true);
    setSyncStep(1);
    setShowSuccessToast(false);

    // Multi-stage simulated API fetch
    setTimeout(() => {
      setSyncStep(2);
      
      setTimeout(() => {
        setSyncStep(3);
        
        setTimeout(() => {
          // Perform price fluctuation calculations (simulated Live Agmarknet updates)
          const updatedPrices = prices.map(item => {
            // Fluctuate priceToday between -3% and +5%
            const pct = (Math.random() * 8 - 3) / 100;
            const newPriceToday = Math.round(item.priceToday * (1 + pct));
            const diffPct = ((newPriceToday - item.priceYesterday) / item.priceYesterday) * 100;
            const sign = diffPct > 0 ? '+' : '';
            const trendString = diffPct === 0 ? '0.0%' : `${sign}${diffPct.toFixed(1)}%`;
            
            return {
              ...item,
              priceToday: newPriceToday,
              trend: trendString
            };
          });

          setPrices(updatedPrices);
          setSyncStep(4);
          
          setTimeout(() => {
            setIsSyncing(false);
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLastSynced(timeString);
            setShowSuccessToast(true);
            
            // Auto hide success toast
            setTimeout(() => {
              setShowSuccessToast(false);
            }, 3500);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };



  // Weather Advisory Mock
  const weatherAdvisory = {
    temp: '32°C',
    humidity: '74%',
    wind: '14 km/h',
    rainAlert: isTamil 
      ? 'வியாழன் அன்று பலத்த மழை எதிர்பார்க்கப்படுகிறது. பூச்சிக்கொல்லி தெளிப்பதை தள்ளிப்போடுங்கள்.'
      : 'Heavy rainfall expected on Thursday. Defer insecticide spraying & clear drainage.'
  };



  return (
    <div className="insights-page" style={{ paddingBottom: '80px', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="page-header insights-header">
        <div className="container">
          <h1 className="animate-fade-in">
            <span className="text-gradient-gold">{isTamil ? 'சந்தை மற்றும்' : 'Market &'}</span> {isTamil ? 'அரசின் திட்டங்கள்' : 'Govt Schemes'}
          </h1>
          <p className="animate-fade-in stagger-1">
            {isTamil 
              ? 'உழவர் சந்தை நேரடி விலைகள், பயிர் ஆலோசனைகள் மற்றும் அரசு மானியங்களை ஒரே இடத்தில் பெறுங்கள்' 
              : 'Real-time Uzhavar Sandhai mandi prices, AI farming weather advisories, and Tamil Nadu subsidy tools.'}
          </p>
        </div>
      </div>

      <div className="container mt-3">

        {/* Predictive Intelligence Forecast Callout Banner */}
        <div 
          className="glass-card mb-4 predict-forecast-banner"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(219, 39, 119, 0.05) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onClick={() => navigate('/demand-forecast')}
        >
          <div className="flex align-center gap-3">
            <div className="icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={22} style={{ color: '#7c3aed' }} className="animate-pulse" />
            </div>
            <div>
              <span className="premium-tag text-xxs font-bold uppercase" style={{ color: '#a855f7', letterSpacing: '0.02em', display: 'block' }}>
                {isTamil ? '🔮 AI சந்தைக் கணிப்பு' : '🔮 AI Market Intelligence'}
              </span>
              <h4 className="font-bold text-xs" style={{ color: 'var(--color-primary-dark)', margin: '0.15rem 0 0 0' }}>
                {isTamil ? 'எதிர்கால தேவைப் போக்கு & விலை கணிப்பகம்' : 'Analyze Future Resource Demands & Expected Prices'}
              </h4>
              <p className="text-xxs text-muted mt-1" style={{ margin: 0 }}>
                {isTamil ? 'அடுத்த 6 மாதங்களில் நெல், கரும்பு, தேங்காய் கழிவுகளுக்கான தேவை மாற்றங்கள்' : 'Predict peak purchasing months across Tamil Nadu districts'}
              </p>
            </div>
          </div>
          <div className="flex align-center" style={{ color: '#7c3aed', gap: '2px' }}>
            <span className="text-xxs font-bold" style={{ fontSize: '0.7rem' }}>{isTamil ? 'ஆராய்' : 'Forecast'}</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* 1. Integrated Weather & Irrigation Advisory Card */}
        <section className="advisory-section mb-4 animate-fade-in">
          <div className="glass-card advisory-card">
            <h3 className="section-title text-sm" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldAlert size={20} color="var(--color-primary)" /> {isTamil ? 'AI பயிர் மற்றும் நீர்ப்பாசன ஆலோசனை:' : 'AI Irrigation & Weather Advisory:'}
            </h3>

            <div className="weather-stats-grid mb-3">
              <div className="weather-stat-box">
                <Thermometer size={20} className="weather-icon-temp" />
                <div>
                  <span className="label block text-xs text-muted">{isTamil ? 'வெப்பநிலை' : 'Temperature'}</span>
                  <span className="val font-bold">{weatherAdvisory.temp}</span>
                </div>
              </div>
              <div className="weather-stat-box">
                <CloudRain size={20} className="weather-icon-rain" />
                <div>
                  <span className="label block text-xs text-muted">{isTamil ? 'ஈரப்பதம்' : 'Humidity'}</span>
                  <span className="val font-bold">{weatherAdvisory.humidity}</span>
                </div>
              </div>
              <div className="weather-stat-box">
                <Wind size={20} className="weather-icon-wind" />
                <div>
                  <span className="label block text-xs text-muted">{isTamil ? 'காற்றின் வேகம்' : 'Wind Speed'}</span>
                  <span className="val font-bold">{weatherAdvisory.wind}</span>
                </div>
              </div>
            </div>

            <div className="advisory-content-box">
              <p className="text-sm font-bold text-muted mb-1">{isTamil ? 'அறிவுரை:' : 'AI Advisory Recommendation:'}</p>
              <p className="advisory-text" style={{ margin: 0 }}>{weatherAdvisory.rainAlert}</p>
            </div>
          </div>
        </section>

        {/* 2. Uzhavar Sandhai Live Price Index Table */}
        <section className="prices-section mb-4 animate-fade-in stagger-1">
          <div className="flex-between align-center mb-3 flex-wrap" style={{ gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 className="section-title mb-0">{isTamil ? 'உழவர் சந்தை தினசரி விலை நிலவரம்:' : 'Uzhavar Sandhai Mandi Index:'}</h3>
              <span className="live-pill">{isTamil ? 'நேரடி' : 'LIVE'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {lastSynced && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                  {isTamil ? `நிலை: இணைக்கப்பட்டது (${lastSynced})` : `Last Synced: ${lastSynced}`}
                </span>
              )}
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSyncPrices}
                disabled={isSyncing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-primary-light)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin-slow' : ''} style={{ color: 'var(--color-primary)' }} />
                <span>{isSyncing ? (isTamil ? 'புதுப்பிக்கப்படுகிறது...' : 'Syncing...') : (isTamil ? 'விலைகளைப் புதுப்பி' : 'Sync Live Prices')}</span>
              </button>
            </div>
          </div>

          {/* Sync Success Toast Notification */}
          {showSuccessToast && (
            <div className="glass-card mb-3 alert-success-mandi animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1.5px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <CheckCircle size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.785rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
                {isTamil 
                  ? `வெற்றி! நேரடி உழவர் சந்தை குறியீடு புதுப்பிக்கப்பட்டது (${lastSynced})` 
                  : `Success! Uzhavar Sandhai Price Index synced to latest spot rates (${lastSynced})`}
              </span>
            </div>
          )}

          {/* Sci-Fi Live Sync Dashboard Overlay */}
          {isSyncing && (
            <div className="glass-card mb-3 sync-dashboard-card animate-fade-in" style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(124, 58, 237, 0.03))',
              border: '1.5px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} className="animate-pulse" style={{ color: 'var(--color-primary)' }} />
                  {isTamil ? 'நேரடி சந்தை இணைப்பு விபரம்' : 'Spot Market Data Connection Logs'}
                </span>
                <span className="sync-percentage-pill" style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--color-primary-dark)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.65rem',
                  fontWeight: '800'
                }}>
                  {syncStep === 1 ? '25%' : syncStep === 2 ? '50%' : syncStep === 3 ? '75%' : '100%'}
                </span>
              </div>

              {/* Progress Steps Log list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: syncStep >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: syncStep >= 1 ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)' }}></div>
                  <span style={{ fontWeight: syncStep === 1 ? '700' : '400' }}>
                    {isTamil ? '1. நேரடி சந்தை சேவையகத்துடன் இணைகிறது...' : '1. Establishing secure handshake with Uzhavar APIs...'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: syncStep >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: syncStep >= 2 ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)' }}></div>
                  <span style={{ fontWeight: syncStep === 2 ? '700' : '400' }}>
                    {isTamil ? '2. கோவை மற்றும் ஈரோடு சந்தைகளின் சமீபத்திய விலைகளைப் பெறுகிறது...' : '2. Fetching real-time spot rates from local TN mandi hubs...'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: syncStep >= 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: syncStep >= 3 ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)' }}></div>
                  <span style={{ fontWeight: syncStep === 3 ? '700' : '400' }}>
                    {isTamil ? '3. வர்த்தக அளவு மற்றும் சந்தை போக்குகளை பகுப்பாய்வு செய்கிறது...' : '3. Running fluctuation analytics & verifying Mandi indexes...'}
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: syncStep === 1 ? '25%' : syncStep === 2 ? '50%' : syncStep === 3 ? '75%' : '100%',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '2px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}></div>
              </div>
            </div>
          )}

          <div className="glass-card prices-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="prices-table">
                <thead>
                  <tr>
                    <th>{isTamil ? 'பயிர் வகை' : 'Crop Breed'}</th>
                    <th>{isTamil ? 'அளவு' : 'Unit'}</th>
                    <th>{isTamil ? 'இன்றைய விலை' : 'Today (₹)'}</th>
                    <th>{isTamil ? 'விற்பனை குறியீடு' : 'Trend'}</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((item) => {
                    const isPositive = item.trend.startsWith('+');
                    const isNeutral = item.trend === '0.0%';
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="crop-name-cell">{isTamil ? item.cropTa : item.crop}</span>
                        </td>
                        <td><span className="unit-cell">{item.unit}</span></td>
                        <td><span className="price-cell font-bold">₹{item.priceToday}</span></td>
                        <td>
                          <span className={`trend-cell ${isPositive ? 'positive' : isNeutral ? 'neutral' : 'negative'}`}>
                            {isPositive ? <TrendingUp size={12} /> : isNeutral ? <Info size={12} /> : <TrendingDown size={12} />}
                            {item.trend}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>



        {/* 4. Complete Schemes Hub list */}
        <section className="schemes-directory-section mb-4 animate-fade-in stagger-3">
          <h3 className="section-title mb-3">{isTamil ? 'அரசு மானியங்கள் முழு விவரம்:' : 'Tamil Nadu Government Schemes Directory:'}</h3>

          <div className="schemes-stack">
            {SCHEMES_DB.map((scheme) => (
              <div key={scheme.id} className="scheme-full-card glass-card">
                <div className="flex-between align-center mb-2">
                  <span className="sponsor-lbl">{isTamil ? scheme.sponsorTa : scheme.sponsor}</span>
                  <Award size={18} color="var(--color-secondary)" />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{isTamil ? scheme.nameTa : scheme.name}</h4>
                
                <div className="detail-item text-xs text-muted mb-2">
                  <span className="block font-bold text-main">{isTamil ? 'உதவித்தொகை / பயன்:' : 'Benefits Provided:'}</span>
                  <p style={{ margin: '0.1rem 0 0 0' }}>{isTamil ? scheme.benefitTa : scheme.benefit}</p>
                </div>

                <div className="detail-item text-xs text-muted mb-3">
                  <span className="block font-bold text-main">{isTamil ? 'தகுதிகள்:' : 'Eligibility Requirement:'}</span>
                  <p style={{ margin: '0.1rem 0 0 0' }}>{isTamil ? scheme.eligibilityTa : scheme.eligibility}</p>
                </div>

                <a 
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm w-100 flex-center"
                  style={{ textDecoration: 'none', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}
                >
                  <CheckCircle size={14} /> {isTamil ? 'அதிகாரப்பூர்வ இணையதளம் ↗' : 'Official Portal ↗'}
                </a>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default MarketInsights;

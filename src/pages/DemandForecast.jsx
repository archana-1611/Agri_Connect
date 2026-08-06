import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, Compass, Calendar, DollarSign, Award, Sparkles, 
  ArrowRight, ShieldCheck, ChevronRight, BarChart2, Info, MapPin, AlertCircle
} from 'lucide-react';
import './DemandForecast.css';
import { useNavigate } from 'react-router-dom';

// Comprehensive crop-by-crop demand forecasting database
const FORECAST_DB = {
  paddy: {
    id: 'paddy',
    name: 'Paddy Straw',
    nameTa: 'வைக்கோல்',
    currentPrice: 2200,
    peakMonth: 'August',
    peakMonthTa: 'ஆவணி (ஆகஸ்ட்)',
    expectedPrice: 2750,
    increasePct: 25,
    districts: [
      { name: 'Thanjavur', nameTa: 'தஞ்சாவூர்', demand: 'High', demandTa: 'அதிவேகம்', score: 96, buyersCount: 14 },
      { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', demand: 'High', demandTa: 'அதிவேகம்', score: 88, buyersCount: 9 },
      { name: 'Cuddalore', nameTa: 'கடலூர்', demand: 'Medium', demandTa: 'நடுத்தரம்', score: 74, buyersCount: 6 }
    ],
    chartPoints: [45, 52, 68, 92, 80, 70], // Jun -> Nov demand levels
    advisory: 'Harvest season and biomass pellet manufacturing demand are expected to peak in August. Storing dry straw for 60 days could yield ₹550 more per ton.',
    advisoryTa: 'பயோமாஸ் எரிபொருள் தேவைகள் ஆகஸ்ட் மாதத்தில் மிக அதிகமாக இருக்கும். வைக்கோலை 60 நாட்கள் உலர வைத்து விற்கும்போது டன்னுக்கு ₹550 வரை கூடுதல் லாபம் பெறலாம்.'
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane Bagasse',
    nameTa: 'கரும்பு சக்கை',
    currentPrice: 3500,
    peakMonth: 'September',
    peakMonthTa: 'புரட்டாசி (செப்டம்பர்)',
    expectedPrice: 4200,
    increasePct: 20,
    districts: [
      { name: 'Erode', nameTa: 'ஈரோடு', demand: 'High', demandTa: 'அதிவேகம்', score: 94, buyersCount: 11 },
      { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', demand: 'High', demandTa: 'அதிவேகம்', score: 90, buyersCount: 12 },
      { name: 'Tiruppur', nameTa: 'திருப்பூர்', demand: 'Medium', demandTa: 'நடுத்தரம்', score: 68, buyersCount: 5 }
    ],
    chartPoints: [60, 65, 78, 95, 88, 72],
    advisory: 'Paper factory cycles and cogeneration boilers will experience supply shortages in September. Deliver surplus directly to mills in Erode for premium rates.',
    advisoryTa: 'காகித ஆலைகள் மற்றும் சர்க்கரை ஆலை மின் கொதிகலன்களுக்கு செப்டம்பர் மாதத்தில் சக்கை தட்டுப்பாடு ஏற்படும். ஈரோடு ஆலைகளுக்கு நேரடியாக விற்று கூடுதல் லாபம் பெறுங்கள்.'
  },
  coconut: {
    id: 'coconut',
    name: 'Coconut Husk',
    nameTa: 'தேங்காய் மட்டை',
    currentPrice: 1.5,
    peakMonth: 'October',
    peakMonthTa: 'ஐப்பசி (அக்டோபர்)',
    expectedPrice: 2.1,
    increasePct: 40,
    districts: [
      { name: 'Pollachi', nameTa: 'பொள்ளாச்சி', demand: 'High', demandTa: 'அதிவேகம்', score: 98, buyersCount: 18 },
      { name: 'Thanjavur', nameTa: 'தஞ்சாவூர்', demand: 'Medium', demandTa: 'நடுத்தரம்', score: 72, buyersCount: 8 },
      { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', demand: 'Medium', demandTa: 'நடுத்தரம்', score: 70, buyersCount: 7 }
    ],
    chartPoints: [50, 58, 62, 70, 96, 85],
    advisory: 'Coir fiber export demand to North America peaks post-monsoon in October. Collect and store husks in clean, dry sheds for an estimated 40% payout increase.',
    advisoryTa: 'பருவமழைக்குப் பின் அக்டோபர் மாதத்தில் வட அமெரிக்காவிற்கான தேங்காய் நார் ஏற்றுமதி உச்சமடையும். மட்டைகளை உலர்ந்த கொட்டகைகளில் சேமித்து விற்றால் 40% வரை கூடுதல் வருவாய் பெறலாம்.'
  },
  maize: {
    id: 'maize',
    name: 'Maize Residues',
    nameTa: 'சோளத் தட்டை',
    currentPrice: 1800,
    peakMonth: 'July',
    peakMonthTa: 'ஆடி (ஜூலை)',
    expectedPrice: 2160,
    increasePct: 20,
    districts: [
      { name: 'Perambalur', nameTa: 'பெரம்பலூர்', demand: 'High', demandTa: 'அதிவேகம்', score: 92, buyersCount: 8 },
      { name: 'Salem', nameTa: 'சேலம்', demand: 'High', demandTa: 'அதிவேகம்', score: 85, buyersCount: 7 },
      { name: 'Dharmapuri', nameTa: 'தர்மபுரி', demand: 'Medium', demandTa: 'நடுத்தரம்', score: 65, buyersCount: 4 }
    ],
    chartPoints: [65, 90, 80, 60, 55, 45],
    advisory: 'Animal feed processing plants report peak requirement in July due to dry season silage depletion. Deliver shredded stalks for quick cattle-feed payouts.',
    advisoryTa: 'கோடை காலத்தில் மாட்டுத் தீவன பற்றாக்குறையால் ஜூலை மாதத்தில் சோளத் தட்டையின் தேவை மிக அதிகமாக இருக்கும். தீவன ஆலைகளுக்கு விற்று உடனடி லாபம் பெறுங்கள்.'
  }
};

const DemandForecast = () => {
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  // Active crop filter state
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const activeCrop = FORECAST_DB[selectedCrop];

  // Forecasted Months labels
  const FORECAST_MONTHS = [
    { en: 'Jun', ta: 'ஜூன்' },
    { en: 'Jul', ta: 'ஜூலை' },
    { en: 'Aug', ta: 'ஆகஸ்ட்' },
    { en: 'Sep', ta: 'செப்டம்பர்' },
    { en: 'Oct', ta: 'அக்டோபர்' },
    { en: 'Nov', ta: 'நவம்பர்' }
  ];

  return (
    <div className="forecast-page" style={{ paddingBottom: '90px', minHeight: '100vh' }}>
      
      {/* Header with glassmorphism */}
      <div className="page-header forecast-header">
        <div className="container">
          <span className="purple-premium-tag animate-fade-in">
            <Sparkles size={14} className="sparkle-icon" />
            <span>{isTamil ? 'AI வர்த்தக கணிப்பகம்' : 'AI Market Intelligence'}</span>
          </span>
          <h1 className="animate-fade-in mt-1">
            <span className="text-gradient-purple">{isTamil ? 'ஸ்மார்ட் தேவை' : 'Smart Demand'}</span> {isTamil ? 'கணிப்பான்' : 'Forecast'}
          </h1>
          <p className="animate-fade-in stagger-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {isTamil 
              ? 'வரவிருக்கும் மாதங்களில் விவசாயக் கழிவுகளுக்கான தேவை மாற்றங்கள் மற்றும் உத்தேச விலை மாற்றக் கணிப்புகள்' 
              : 'Machine learning forecasts for residue demand trends, future pricing, and peak district activities.'}
          </p>
        </div>
      </div>

      <div className="container mt-3">

        {/* 1. CROP FILTER CHIPS */}
        <section className="crop-filters-section mb-3 animate-fade-in">
          <div className="crop-filters-scroll">
            {Object.keys(FORECAST_DB).map((key) => {
              const crop = FORECAST_DB[key];
              return (
                <button
                  key={key}
                  className={`crop-chip ${selectedCrop === key ? 'active' : ''}`}
                  onClick={() => setSelectedCrop(key)}
                >
                  <span className="chip-emoji">
                    {key === 'paddy' ? '🌾' : key === 'sugarcane' ? '🎋' : key === 'coconut' ? '🥥' : '🌽'}
                  </span>
                  <span>{isTamil ? crop.nameTa : crop.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. DYNAMIC FORECAST CHART */}
        <section className="chart-section mb-4 animate-fade-in stagger-1">
          <div className="glass-card chart-card">
            
            {/* HUD Corner Decorations */}
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>

            <div className="flex-between align-center mb-3">
              <div>
                <h3 className="section-title text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                  <TrendingUp size={18} />
                  <span>{isTamil ? 'தேவை அதிகரிப்பு கணிப்பு (6 மாதம்):' : 'Future Demand Trajectory (6-Month):'}</span>
                </h3>
                <p className="text-xs text-muted">
                  {isTamil ? `${isTamil ? activeCrop.nameTa : activeCrop.name} கழிவுகளுக்கான தேவை அளவு (%)` : `Demand index forecast for ${activeCrop.name}`}
                </p>
              </div>
              <span className="peak-badge-pill">
                🚀 {isTamil ? 'உச்ச மாதம்:' : 'Peak Month:'} <b>{isTamil ? activeCrop.peakMonthTa : activeCrop.peakMonth}</b>
              </span>
            </div>

            {/* Custom Responsive SVG Demand Graph */}
            <div className="svg-chart-container mt-4">
              <svg 
                viewBox="0 0 500 200" 
                className="svg-chart-element"
                style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
              >
                <defs>
                  {/* Purple glow gradient for forecast */}
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(0,0,0,0.04)" strokeDasharray="3,3" />
                <line x1="40" y1="65" x2="480" y2="65" stroke="rgba(0,0,0,0.04)" strokeDasharray="3,3" />
                <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(0,0,0,0.04)" strokeDasharray="3,3" />
                <line x1="40" y1="155" x2="480" y2="155" stroke="rgba(0,0,0,0.04)" strokeDasharray="3,3" />

                {/* X and Y Axis */}
                <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                <line x1="40" y1="10" x2="40" y2="170" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

                {/* Y-Axis labels (Demand Percentage) */}
                <text x="12" y="25" className="chart-text text-xs" fill="var(--text-muted)">100%</text>
                <text x="18" y="70" className="chart-text text-xs" fill="var(--text-muted)">75%</text>
                <text x="18" y="115" className="chart-text text-xs" fill="var(--text-muted)">50%</text>
                <text x="18" y="160" className="chart-text text-xs" fill="var(--text-muted)">25%</text>

                {/* Area Gradient Fill */}
                <path 
                  d={`M 50 170 
                      L 50 ${170 - (activeCrop.chartPoints[0]/100)*145} 
                      L 130 ${170 - (activeCrop.chartPoints[1]/100)*145} 
                      L 210 ${170 - (activeCrop.chartPoints[2]/100)*145} 
                      L 290 ${170 - (activeCrop.chartPoints[3]/100)*145} 
                      L 370 ${170 - (activeCrop.chartPoints[4]/100)*145} 
                      L 450 ${170 - (activeCrop.chartPoints[5]/100)*145} 
                      L 450 170 Z`} 
                  fill="url(#purpleGrad)" 
                />

                {/* Line Path */}
                <path 
                  d={`M 50 ${170 - (activeCrop.chartPoints[0]/100)*145} 
                      L 130 ${170 - (activeCrop.chartPoints[1]/100)*145} 
                      L 210 ${170 - (activeCrop.chartPoints[2]/100)*145} 
                      L 290 ${170 - (activeCrop.chartPoints[3]/100)*145} 
                      L 370 ${170 - (activeCrop.chartPoints[4]/100)*145} 
                      L 450 ${170 - (activeCrop.chartPoints[5]/100)*145}`} 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {/* Data Points */}
                {activeCrop.chartPoints.map((val, idx) => {
                  const x = 50 + idx * 80;
                  const y = 170 - (val / 100) * 145;

                  return (
                    <g key={idx}>
                      {/* X-Axis Month label */}
                      <text x={x} y="188" textAnchor="middle" className="chart-text text-xs" fill="var(--text-muted)">
                        {isTamil ? FORECAST_MONTHS[idx].ta : FORECAST_MONTHS[idx].en}
                      </text>

                      {/* Guide Value Tooltip on top of node */}
                      <text x={x} y={y - 8} textAnchor="middle" className="chart-text font-bold text-xxs" fill="#a855f7">
                        {val}%
                      </text>

                      {/* Node circle */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="4.5" 
                        fill="#a855f7" 
                        stroke="#ffffff" 
                        strokeWidth="2" 
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

          </div>
        </section>

        {/* 3. EXPECTED PRICES SECTION */}
        <section className="prices-section mb-4 animate-fade-in stagger-2">
          <div className="glass-card price-forecast-card">
            <h4 className="card-sub-title font-bold text-sm" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <DollarSign size={18} className="text-secondary" />
              <span>{isTamil ? 'விலை உயர்வு கணிப்பகம்:' : 'Future Price Estimation:'}</span>
            </h4>
            <p className="text-xs text-muted mb-3">{isTamil ? 'வரவிருக்கும் மாதங்களில் உத்தேச விலை மாற்றங்கள்' : 'Projected mandi rates during peak residue supply cycles'}</p>

            <div className="forecast-price-comparison mt-3">
              <div className="price-item glass">
                <span className="lbl text-xxs text-muted block uppercase">{isTamil ? 'இன்றைய விலை' : 'Current Rate'}</span>
                <span className="price font-bold text-muted" style={{ fontSize: '1.5rem' }}>
                  ₹{activeCrop.currentPrice} <span className="unit text-xs">/{selectedCrop === 'coconut' ? (isTamil ? 'மட்டை' : 'pc') : (isTamil ? 'டன்' : 'Ton')}</span>
                </span>
              </div>

              <div className="price-indicator animate-pulse">
                <ArrowRight className="text-secondary" size={20} />
              </div>

              <div className="price-item glass gradient-gold-border">
                <span className="lbl text-xxs text-secondary block uppercase font-bold">🔮 {isTamil ? 'கணிக்கப்பட்ட விலை' : 'Projected Payout'}</span>
                <span className="price font-bold text-gradient-gold" style={{ fontSize: '1.75rem' }}>
                  ₹{activeCrop.expectedPrice} <span className="unit text-xs" style={{ color: 'var(--text-main)' }}>/{selectedCrop === 'coconut' ? (isTamil ? 'மட்டை' : 'pc') : (isTamil ? 'டன்' : 'Ton')}</span>
                </span>
                <span className="hike-badge">+{activeCrop.increasePct}% expected</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HIGH-DEMAND DISTRICTS GRID */}
        <section className="districts-section mb-4 animate-fade-in stagger-3">
          <div className="glass-card districts-card">
            <h4 className="card-sub-title font-bold text-sm mb-1" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={18} className="text-primary-light" />
              <span>{isTamil ? 'அதிகத் தேவை உள்ள மாவட்டங்கள்:' : 'High-Demand Districts Hub:'}</span>
            </h4>
            <p className="text-xs text-muted mb-3">{isTamil ? 'வாங்குபவர் எண்ணிக்கையின் அடிப்படையில் சிறந்த மாவட்டங்கள்' : 'Top districts identified based on active B2B buyers counts'}</p>

            <div className="districts-list-stack mt-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeCrop.districts.map((dist, idx) => (
                <div key={idx} className="district-heat-row glass">
                  
                  <div className="flex-between align-center mb-1">
                    <span className="dist-name font-bold text-xs">
                      📍 {isTamil ? dist.nameTa : dist.name}
                    </span>
                    <span className={`demand-indicator-pill ${dist.demand.toLowerCase()}`}>
                      {isTamil ? dist.demandTa : dist.demand}
                    </span>
                  </div>

                  <div className="progress-heat-bar-wrap mb-1" style={{ height: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      className="heat-bar-fill" 
                      style={{ 
                        height: '100%', 
                        width: `${dist.score}%`, 
                        background: 'linear-gradient(90deg, #c084fc, #a855f7)',
                        borderRadius: '4px' 
                      }}
                    ></div>
                  </div>

                  <div className="flex-between text-xxs text-muted">
                    <span>{isTamil ? 'தேவை குறியீடு:' : 'Demand score:'} <b>{dist.score}%</b></span>
                    <span>🏢 {dist.buyersCount} {isTamil ? 'வாங்குபவர்கள் தயார்' : 'active B2B buyers'}</span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. SMART SELLING ADVISORY CARD */}
        <section className="advisory-section mb-4 animate-fade-in">
          <div className="glass-card advisory-card glow-purple">
            
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>

            <h4 className="card-sub-title font-bold text-sm text-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9333ea' }}>
              <AlertCircle size={18} />
              <span>{isTamil ? 'AI விற்பனை வழிகாட்டி ஆலோசனை:' : 'AI Smart Selling Advisory:'}</span>
            </h4>

            <p className="advisory-desc text-xs text-muted mt-2" style={{ lineHeight: 1.5, margin: 0 }}>
              {isTamil ? activeCrop.advisoryTa : activeCrop.advisory}
            </p>

            <button 
              type="button" 
              className="btn btn-primary w-100 mt-4 flex-center futuristic-glow-btn"
              onClick={() => navigate('/surplus-prediction')}
              style={{ background: '#9333ea' }}
            >
              <span>{isTamil ? 'பயிர் விளைச்சல் & உபரி கணிப்பகத்துக்குச் செல்' : 'Open AI Yield & Surplus Predictor'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DemandForecast;

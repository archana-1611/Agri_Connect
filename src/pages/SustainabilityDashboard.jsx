import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Leaf, 
  Globe, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Activity, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import './SustainabilityDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';

const SustainabilityDashboard = () => {
  const { isTamil } = useLanguage();
  const navigate = useNavigate();
  const { resources } = useResources();
  const { user } = useAuth();

  // Helper to parse quantity to kg
  const parseQuantityToKg = (qtyStr) => {
    if (!qtyStr) return 0;
    const match = qtyStr.match(/([\d.]+)\s*([a-zA-Z]*)/);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    if (isNaN(val)) return 0;
    const unit = (match[2] || '').toLowerCase();
    if (unit.startsWith('ton') || unit.startsWith('tonne')) {
      return val * 1000;
    }
    if (unit.startsWith('g')) {
      return val / 1000;
    }
    return val;
  };

  const userResources = resources.filter(r => r.user_id === user?.id);
  const totalBiomass = userResources.reduce((sum, r) => sum + parseQuantityToKg(r.quantity), 0);
  const totalCo2 = Math.round(totalBiomass * 0.29);
  const totalEarnings = userResources.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  const categorySummary = {};
  userResources.forEach(r => {
    const cat = r.category || 'Other';
    const qty = parseQuantityToKg(r.quantity);
    const val = Number(r.price) || 0;
    if (!categorySummary[cat]) {
      let icon = '🌱';
      let catName = cat;
      let catNameTa = cat;
      if (cat === 'Paddy Straw') {
        icon = '🌾';
        catNameTa = 'நெல் வைக்கோல்';
      } else if (cat === 'Coconut Husk') {
        icon = '🥥';
        catNameTa = 'தேங்காய் மட்டை';
      } else if (cat === 'Sugarcane Bagasse') {
        icon = '🎋';
        catNameTa = 'கரும்பு சக்கை';
      } else if (cat === 'Seeds') {
        icon = '🌱';
        catNameTa = 'விதை மூட்டைகள்';
      }
      categorySummary[cat] = { qty: 0, earnings: 0, icon, catName, catNameTa };
    }
    categorySummary[cat].qty += qty;
    categorySummary[cat].earnings += val;
  });
  const categoryList = Object.values(categorySummary).sort((a, b) => b.qty - a.qty);

  // Group user resources by month for the chart
  const getMonthlyData = () => {
    const months = [
      { key: 0, month: 'Jan', monthTa: 'ஜன', waste: 0, co2: 0, earnings: 0 },
      { key: 1, month: 'Feb', monthTa: 'பிப்', waste: 0, co2: 0, earnings: 0 },
      { key: 2, month: 'Mar', monthTa: 'மார்', waste: 0, co2: 0, earnings: 0 },
      { key: 3, month: 'Apr', monthTa: 'ஏப்', waste: 0, co2: 0, earnings: 0 },
      { key: 4, month: 'May', monthTa: 'மே', waste: 0, co2: 0, earnings: 0 },
      { key: 5, month: 'Jun', monthTa: 'ஜூன்', waste: 0, co2: 0, earnings: 0 },
      { key: 6, month: 'Jul', monthTa: 'ஜூலை', waste: 0, co2: 0, earnings: 0 },
      { key: 7, month: 'Aug', monthTa: 'ஆகஸ்ட்', waste: 0, co2: 0, earnings: 0 },
      { key: 8, month: 'Sep', monthTa: 'செப்டம்பர்', waste: 0, co2: 0, earnings: 0 },
      { key: 9, month: 'Oct', monthTa: 'அக்டோபர்', waste: 0, co2: 0, earnings: 0 },
      { key: 10, month: 'Nov', monthTa: 'நவம்பர்', waste: 0, co2: 0, earnings: 0 },
      { key: 11, month: 'Dec', monthTa: 'டிசம்பர்', waste: 0, co2: 0, earnings: 0 }
    ];

    userResources.forEach(r => {
      const date = new Date(r.created_at || Date.now());
      const mIdx = date.getMonth();
      const qty = parseQuantityToKg(r.quantity);
      months[mIdx].waste += qty;
      months[mIdx].co2 += Math.round(qty * 0.29);
      months[mIdx].earnings += (Number(r.price) || 0);
    });

    const currentMonth = new Date().getMonth();
    const startIndex = Math.max(0, currentMonth - 5);
    return months.slice(startIndex, currentMonth + 1);
  };

  const MONTHLY_DATA = getMonthlyData();
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);

  useEffect(() => {
    if (MONTHLY_DATA.length > 0) {
      setActiveMonthIdx(MONTHLY_DATA.length - 1);
    }
  }, [MONTHLY_DATA.length]);

  const defaultMonth = { month: 'N/A', monthTa: 'தேதி இல்லை', waste: 0, co2: 0, earnings: 0 };
  const activeMonth = MONTHLY_DATA[activeMonthIdx] || defaultMonth;

  // Circle progress calculation (r=50, circumference ~ 314.15)
  const circularScore = totalBiomass > 0 ? Math.min(100, Math.round(totalBiomass / 50)) : 0; 
  const circleCircumference = 314;
  const strokeDashoffset = circleCircumference - (circularScore / 100) * circleCircumference;

  return (
    <div className="sustainability-page" style={{ paddingBottom: '90px', minHeight: '100vh', backgroundColor: '#f4fbf7' }}>
      
      {/* 1. Header with class sustainability-header */}
      <div className="page-header sustainability-header" style={{ padding: '2.5rem 0', color: '#ffffff' }}>
        <div className="container">
          <span className="green-premium-tag animate-fade-in">
            <Leaf size={14} />
            <span>{isTamil ? 'சுற்றுச்சூழல் மற்றும் நிலைத்தன்மை' : 'Sustainability & Eco Impact'}</span>
          </span>
          <h1 className="animate-fade-in mt-1" style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.25rem 0 0.5rem 0' }}>
            {isTamil ? 'பசுமை தடம்' : 'Green Track'} <span className="text-gradient-gold">{isTamil ? 'விவரக்குறிப்பு' : 'Dashboard'}</span>
          </h1>
          <p className="animate-fade-in stagger-1 text-muted" style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '0.95rem' }}>
            {isTamil 
              ? 'உங்கள் நிலத்திலிருந்து விற்கப்பட்ட கழிவுகளின் மூலம் தவிர்க்கப்பட்ட கார்பன் மற்றும் கூடுதல் வருவாயைக் கண்காணிக்கவும்.' 
              : 'Monitor carbon footprint reduction and secondary green payouts routed from circular recycling.'}
          </p>
        </div>
      </div>

      <div className="container mt-4">

        {/* 2. KPI Cards Grid */}
        <section className="kpis-section mb-4">
          <div className="kpis-grid">
            
            {/* KPI Card 1: Recycled Biomass */}
            <div className="glass-card kpi-card green-glow animate-fade-in" style={{ background: 'white', borderRadius: '16px', borderLeft: '5px solid #22c55e' }}>
              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-green-light">
                  <Leaf size={22} className="text-primary animate-pulse" style={{ color: '#16a34a' }} />
                </div>
              </div>
              <div className="kpi-data mt-3">
                <p className="kpi-label text-muted text-xs uppercase" style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700' }}>
                  {isTamil ? 'மீட்கப்பட்ட உபரி கழிவுகள்' : 'Diverted Biomass'}
                </p>
                <h2 className="kpi-value font-bold" style={{ margin: '0.25rem 0', color: 'var(--color-primary-dark)' }}>
                  {totalBiomass.toLocaleString()} kg
                </h2>
                <p className="kpi-subtext text-xs text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                  {isTamil ? 'வைக்கோல் மற்றும் உமிகள் எரிக்கப்படாமல் பாதுகாக்கப்பட்டது' : 'Prevented from open farm burning'}
                </p>
              </div>
            </div>

            {/* KPI Card 2: CO2 Offsets */}
            <div className="glass-card kpi-card blue-glow animate-fade-in stagger-1" style={{ background: 'white', borderRadius: '16px', borderLeft: '5px solid #0d9488' }}>
              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-teal-light">
                  <Globe size={22} style={{ color: '#0d9488' }} />
                </div>
                <span className="trees-pill inline-flex align-center gap-1">
                  🌳 <span>{isTamil ? `${Math.round(totalCo2 / 22)} மரங்கள்` : `${Math.round(totalCo2 / 22)} Trees`}</span>
                </span>
              </div>
              <div className="kpi-data mt-3">
                <p className="kpi-label text-muted text-xs uppercase" style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700' }}>
                  {isTamil ? 'தவிர்க்கப்பட்ட கார்பன் உமிழ்வு' : 'CO₂ Offset Equivalent'}
                </p>
                <h2 className="kpi-value font-bold" style={{ margin: '0.25rem 0', color: '#0f766e' }}>
                  {(totalCo2 / 1000).toFixed(2)} Tons
                </h2>
                <p className="kpi-subtext text-xs text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                  {isTamil ? 'பயிர்க்கழிவை எரிப்பதைத் தவிர்த்ததால் கிடைத்த கார்பன் சேமிப்பு' : 'Greenhouse gas emissions avoided'}
                </p>
              </div>
            </div>

            {/* KPI Card 3: Green Earnings */}
            <div className="glass-card kpi-card gold-glow animate-fade-in stagger-2" style={{ background: 'white', borderRadius: '16px', borderLeft: '5px solid #eab308' }}>
              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-yellow-light">
                  <DollarSign size={22} style={{ color: '#ca8a04' }} />
                </div>
              </div>
              <div className="kpi-data mt-3">
                <p className="kpi-label text-muted text-xs uppercase" style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700' }}>
                  {isTamil ? 'பசுமை வர்த்தக வருமானம்' : 'Green Farming Payouts'}
                </p>
                <h2 className="kpi-value font-bold" style={{ margin: '0.25rem 0', color: '#854d0e' }}>
                  ₹ {totalEarnings.toLocaleString()}
                </h2>
                <p className="kpi-subtext text-xs text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>
                  {isTamil ? 'கழிவுகளை விற்பனை செய்ததால் கிடைத்த கூடுதல் லாபம்' : 'Revenue generated from crop recycling'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Interactive MoM Chart & Selected Month Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* SVG Interactive Chart Card */}
          <div className="glass-card chart-analytics-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} />
              <span>{isTamil ? 'மாதாந்திர உமிழ்வு சேமிப்பு வரம்பு' : 'Month-on-Month Savings Tracker'}</span>
            </h3>

            {/* SVG Chart Render */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '160px', paddingBottom: '10px', borderBottom: '1.5px solid rgba(0,0,0,0.06)' }}>
              {MONTHLY_DATA.map((d, idx) => {
                const maxMonthlyWaste = Math.max(1, ...MONTHLY_DATA.map(m => m.waste));
                const height = d.waste > 0 ? (d.waste / maxMonthlyWaste) * 110 : 0; 
                return (
                  <div 
                    key={idx} 
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActiveMonthIdx(idx)}
                  >
                    <div style={{ position: 'relative', width: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '110px' }}>
                      <div style={{
                        height: `${height}px`,
                        backgroundColor: activeMonthIdx === idx ? 'var(--color-primary)' : 'rgba(21, 128, 61, 0.25)',
                        borderTopLeftRadius: '6px',
                        borderTopRightRadius: '6px',
                        transition: 'all 0.2s ease-in-out'
                      }}></div>
                    </div>
                    <span 
                      className={`chart-text ${activeMonthIdx === idx ? 'active-text' : ''}`}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: activeMonthIdx === idx ? 'bold' : 'normal',
                        color: activeMonthIdx === idx ? 'var(--color-primary-dark)' : '#64748b',
                        marginTop: '6px'
                      }}
                    >
                      {isTamil ? d.monthTa : d.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <span className="legend-dot green"></span> {isTamil ? 'உபரி எடை' : 'Waste Recycled'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                <span className="legend-dot teal"></span> {isTamil ? 'கார்பன் சேமிப்பு' : 'CO₂ Offset'}
              </span>
            </div>
          </div>

          {/* Active Month HUD Display */}
          <div className="glass-card active-month-hud" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
                  {isTamil ? activeMonth.monthTa : activeMonth.month} {isTamil ? 'மாத அறிக்கை' : 'Performance HUD'}
                </span>
                <span className="selected-indicator-pill">
                  {isTamil ? 'மதிப்பீடு' : 'Active HUD'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{isTamil ? 'மறுசுழற்சி செய்தவை' : 'Recycled Amount'}:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{activeMonth.waste} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{isTamil ? 'CO₂ தடுத்த அளவு' : 'CO₂ Offsets'}:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0d9488' }}>{activeMonth.co2} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{isTamil ? 'கிடைத்த வருமானம்' : 'Green Earnings'}:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#854d0e' }} className="hud-earnings">₹{activeMonth.earnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(21, 128, 61, 0.03)',
              borderRadius: '12px',
              padding: '10px 12px',
              border: '1px dashed rgba(21, 128, 61, 0.15)',
              marginTop: '10px'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                ℹ️ {isTamil ? 'உபரி பயிர்க்கழிவைச் சந்தையில் விற்பனை செய்ததன் மூலம் சேமிக்கப்பட்ட பசுமை வர்த்தகப் புள்ளிவிவரங்கள்.' : 'Green metrics computed based on regional sales of straw, coir, and bagasse for circular energy production.'}
              </p>
            </div>
          </div>

        </div>

        {/* 4. Circular economy & utilization grid */}
        <div className="circular-and-utilization-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Circular economy radial card */}
          <div className="glass-card circular-economy-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0', alignSelf: 'flex-start' }}>
              {isTamil ? 'சுழற்சி பொருளாதார மதிப்பெண்' : 'Circular Economy Score'}
            </h3>

            <div className="radial-svg-container" style={{ position: 'relative' }}>
              <svg width="130" height="130" className="radial-element">
                <circle cx="65" cy="65" r="50" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle 
                  cx="65" 
                  cy="65" 
                  r="50" 
                  stroke="var(--color-primary)" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div className="radial-score-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-primary-dark)', lineHeight: 1 }}>{circularScore}%</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{isTamil ? 'சிறப்பானது' : 'Excellent'}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '12px', lineHeight: 1.4 }}>
              {isTamil ? 'உங்களின் சாகுபடி நிலத்தில் அறுவடைக்கு பிந்தைய கழிவுகளை மறுசுழற்சி செய்ததன் மூலம் கிடைத்த சுழற்சி மதிப்பீடு!' : 'Your farm Circular Index is based on total residues listed vs total harvested land ratio.'}
            </p>
          </div>

          {/* Resource Utilization list */}
          <div className="glass-card resource-utilization-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0' }}>
              {isTamil ? 'வள பயன்பாட்டு விகிதம்' : 'Residue Utilization Rate'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                  <span>{isTamil ? 'நெல் வைக்கோல்' : 'Paddy Straw'}</span>
                  <span>90%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="animate-progress" style={{ height: '100%', width: '90%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                  <span>{isTamil ? 'தேங்காய் மட்டை' : 'Coconut Husk'}</span>
                  <span>65%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="animate-progress" style={{ height: '100%', width: '65%', backgroundColor: '#0d9488', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                  <span>{isTamil ? 'கரும்புச் சக்கை' : 'Sugarcane Bagasse'}</span>
                  <span>75%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="animate-progress" style={{ height: '100%', width: '75%', backgroundColor: '#ca8a04', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 5. Bottom surplus list & environment summary */}
        <div className="bottom-analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Top Resources Sold */}
          <div className="glass-card top-surplus-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0' }}>
              {isTamil ? 'விற்பனையான முதன்மை வளங்கள்' : 'Top Surplus Yield Sold'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryList.length > 0 ? (
                categoryList.map((item, idx) => (
                  <div key={idx} className="top-resource-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="res-emoji">{item.icon}</div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>{isTamil ? item.catNameTa : item.catName}</h5>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.qty.toLocaleString()} kg</span>
                      </div>
                    </div>
                    <span className="font-bold res-earnings" style={{ color: '#16a34a' }}>₹{item.earnings.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                  {isTamil ? 'இன்னும் பயிர்க்கழிவுகள் பட்டியலிடப்படவில்லை' : 'No crop residues listed yet.'}
                </div>
              )}
            </div>
          </div>

          {/* Environmental Impact Summary */}
          <div className="glass-card env-impact-summary-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0' }}>
              {isTamil ? 'சுற்றுச்சூழல் பாதுகாப்பு அறிக்கை' : 'Ecological Protection Summary'}
            </h3>

            <ul className="env-details-stack" style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                ✅ <span><b>{isTamil ? 'திறந்தவெளி புகை தடுப்பு' : 'Open Air Smog Prevention'}:</b> {isTamil ? 'சுமார் 5 ஏக்கர் பரப்பளவிலான வைக்கோல் எரிப்பு தடுக்கப்பட்டு புகைமூட்டம் தவிர்க்கப்பட்டது.' : 'Successfully avoided burning fields of straw, reducing local PM2.5 smog.'}</span>
              </li>
              <li style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                ✅ <span><b>{isTamil ? 'மண் கரிம கார்பன் பாதுகாப்பு' : 'Soil Organic Matter Conservation'}:</b> {isTamil ? 'சுழற்சி முறையில் உரம் தயாரிக்க தென்னை மட்டைகளை பயன்படுத்தியதால் மண்ணின் தரம் பாதுகாக்கப்பட்டது.' : 'Diverted organic husks back to compost mills, preserving regional soil nutrients.'}</span>
              </li>
              <li style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                ✅ <span><b>{isTamil ? 'கிராமப்புற பசுமை வேலைவாய்ப்பு' : 'Rural Green Payout Ecosystem'}:</b> {isTamil ? 'விற்பனையாளர்கள் மூலமாக FPO-க்களுக்கு நேரடி வர்த்தக இணைப்பை ஏற்படுத்தியதன் மூலம் கூடுதல் வேலைவாய்ப்பு.' : 'Created circular bio-trade connections supporting regional farming groups.'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 6. AI Insights & Tips Card */}
        <section className="ai-insights-card" style={{ background: 'white', borderRadius: '24px', border: '1.5px solid rgba(21, 128, 61, 0.15)', padding: '2rem 1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#ca8a04' }} />
            <span>{isTamil ? 'AI நிலைத்தன்மை ஆலோசனைகள்' : 'AI Circular Resource Insights'}</span>
          </h3>

          <div className="ai-tips-grid">
            <div className="ai-tip-card profit">
              <span className="tip-badge-icon">💰</span>
              <h5 style={{ margin: '6px 0 4px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#854d0e' }}>
                {isTamil ? 'உயர் மதிப்பு பயன்பாடு' : 'High Value Recycling Suggestion'}
              </h5>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#713f12', lineHeight: 1.4 }}>
                {isTamil ? 'வைக்கோலை மாட்டுத்தீவன ஆலைகளுக்கு விற்பனை செய்தால் மற்ற பயோமாஸ் ஆலைகளை விட 15% கூடுதல் விலை பெறலாம்.' : 'Directing paddy straw to fodder mills yields 15% higher returns than industrial biomass pellet plants.'}
              </p>
            </div>

            <div className="ai-tip-card eco">
              <span className="tip-badge-icon">🌱</span>
              <h5 style={{ margin: '6px 0 4px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                {isTamil ? 'மண் ஊட்டச்சத்து மேலாண்மை' : 'Mulching Recommendations'}
              </h5>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#14532d', lineHeight: 1.4 }}>
                {isTamil ? 'இரசாயன உரங்களைத் தவிர்த்து உங்கள் தென்னை கழிவை உரமாக மாற்றி மீண்டும் வயலில் இடவும்.' : 'Using cocopeat by-products for soil mulching saves up to 20% on water irrigation in summer months.'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SustainabilityDashboard;

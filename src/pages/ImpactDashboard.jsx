import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Leaf, Globe, DollarSign, Award, Sparkles, 
  ArrowRight, ShieldCheck, MapPin, ChevronRight, BarChart2, Info, Activity 
} from 'lucide-react';
import './ImpactDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';

const ImpactDashboard = () => {
  const { isTamil } = useLanguage();
  const navigate = useNavigate();
  const { resources } = useResources();
  const { user } = useAuth();
  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';

  // Active Tamil Nadu district selected for the interactive map HUD
  const [selectedDistrict, setSelectedDistrict] = useState('coimbatore');

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

  // Dynamic community scale metrics
  const uniqueFarmers = new Set(resources.map(r => r.user_id)).size;
  const platformTotalBiomass = resources.reduce((sum, r) => sum + parseQuantityToKg(r.quantity), 0);
  const platformTotalBiomassTons = (platformTotalBiomass / 1000).toFixed(2);
  const platformTotalEarnings = resources.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const platformTotalEarningsLakhs = (platformTotalEarnings / 100000).toFixed(2);
  const platformTotalCo2 = Math.round(platformTotalBiomass * 0.29);
  const platformTotalCo2Tons = (platformTotalCo2 / 1000).toFixed(2);
  const platformTreesEquivalent = Math.round(platformTotalCo2 / 22);

  // Community District Metrics Database calculated dynamically
  const getDistrictImpacts = () => {
    const districts = {
      coimbatore: { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', farmers: 0, waste: 0, earnings: 0, co2: 0, activeFpos: 0 },
      erode: { name: 'Erode', nameTa: 'ஈரோடு', farmers: 0, waste: 0, earnings: 0, co2: 0, activeFpos: 0 },
      pollachi: { name: 'Pollachi (Cocotown)', nameTa: 'பொள்ளாச்சி', farmers: 0, waste: 0, earnings: 0, co2: 0, activeFpos: 0 },
      thanjavur: { name: 'Thanjavur (Delta)', nameTa: 'தஞ்சாவூர்', farmers: 0, waste: 0, earnings: 0, co2: 0, activeFpos: 0 }
    };
    
    resources.forEach(r => {
      const loc = (r.location || '').toLowerCase();
      let key = null;
      if (loc.includes('coimbatore')) key = 'coimbatore';
      else if (loc.includes('erode')) key = 'erode';
      else if (loc.includes('pollachi')) key = 'pollachi';
      else if (loc.includes('thanjavur') || loc.includes('tanjore')) key = 'thanjavur';
      
      if (key) {
        districts[key].farmers += 1;
        const qty = parseQuantityToKg(r.quantity);
        districts[key].waste += qty;
        districts[key].earnings += (Number(r.price) || 0);
        districts[key].co2 += Math.round(qty * 0.29);
      }
    });
    
    return Object.keys(districts).reduce((acc, key) => {
      const d = districts[key];
      acc[key] = {
        ...d,
        farmers: d.farmers,
        waste: d.waste > 0 ? `${(d.waste / 1000).toFixed(2)} Tons` : '0 Tons',
        wasteTa: d.waste > 0 ? `${(d.waste / 1000).toFixed(2)} டன்` : '0 டன்',
        earnings: d.earnings > 0 ? `₹ ${(d.earnings / 100000).toFixed(2)} Lakhs` : '₹ 0',
        earningsTa: d.earnings > 0 ? `₹ ${(d.earnings / 100000).toFixed(2)} லட்சம்` : '₹ 0',
        co2: d.co2 > 0 ? `${(d.co2 / 1000).toFixed(2)} Tons` : '0 Tons',
        co2Ta: d.co2 > 0 ? `${(d.co2 / 1000).toFixed(2)} டன்` : '0 டன்',
        activeFpos: d.farmers > 0 ? Math.max(1, Math.round(d.farmers / 2)) : 0
      };
      return acc;
    }, {});
  };

  const DISTRICT_IMPACTS = getDistrictImpacts();
  const activeDist = DISTRICT_IMPACTS[selectedDistrict];

  // Sustainability Achievements List
  const PLATFORM_ACHIEVEMENTS = [
    {
      id: 1,
      title: 'Clean Air Champion Award',
      titleTa: 'தூய்மையான காற்று சாதனையாளர் விருது',
      authority: 'TN Pollution Control Board',
      authorityTa: 'தமிழ்நாடு மாசு கட்டுப்பாட்டு வாரியம்',
      desc: 'Recognized for preventing open paddy straw burning across 15,000+ crop acres in Western Tamil Nadu.',
      descTa: 'மேற்கு தமிழகத்தில் 15,000 ஏக்கருக்கும் அதிகமான பரப்பளவில் வைக்கோல் திறந்தவெளியில் எரிக்கப்படுவதைத் தடுத்ததற்காக அங்கீகாரம்.',
      date: 'March 2026',
      badge: '🏆'
    },
    {
      id: 2,
      title: 'Gold Tier Carbon Registry',
      titleTa: 'தங்க தகுதி கார்பன் பதிவேடு',
      authority: 'Global Carbon Credits Standard',
      authorityTa: 'உலகளாவிய கார்பன் வரவு தரநிலை',
      desc: 'Officially certified for offsetting over 12,000 Tons of greenhouse gas emissions through circular biomass recycling.',
      descTa: 'சுழற்சி உரம் மற்றும் பயோமாஸ் மறுசுழற்சி மூலம் 12,000 டன்களுக்கும் அதிகமான பசுமைக்குடில் வாயு வெளியேற்றத்தைத் தடுத்ததற்காகச் சான்றிதழ்.',
      date: 'May 2026',
      badge: '🌍'
    }
  ];

  const RECENT_COMMUNITY_DEALS = [
    {
      fpo: 'Pollachi Coconut Co-op',
      fpoTa: 'பொள்ளாச்சி தென்னை கூட்டுறவு',
      action: 'supplied 45 Tons of Husk to EcoFert',
      actionTa: '45 டன் தென்னை மட்டைகளை ஈகோஃபெர்ட்டிற்கு வழங்கியது',
      payout: '₹ 67,500',
      co2: '620 kg offset'
    },
    {
      fpo: 'Kovai Farmers Producer Org',
      fpoTa: 'கோவை உழவர் உற்பத்தியாளர் குழு',
      action: 'delivered 120 Tons of Straw to BioFlame',
      actionTa: '120 டன் வைக்கோலை பயோஃபிளேமிற்கு வழங்கியது',
      payout: '₹ 2,64,000',
      co2: '3.6 Tons offset'
    }
  ];

  return (
    <div className="impact-page" style={{ paddingBottom: '90px', minHeight: '100vh' }}>
      
      {/* Header with glassmorphism */}
      <div className="page-header impact-header">
        <div className="container">
          <span className="gold-premium-tag animate-fade-in">
            <Award size={14} className="sparkle-icon" />
            <span>{isTamil ? 'அக்ரி-கனெக்ட் கூட்டு சாதனை' : 'AgriConnect Platform Milestones'}</span>
          </span>
          <h1 className="animate-fade-in mt-1">
            <span className="text-gradient-gold">{isTamil ? 'சமூக தாக்க' : 'Community Impact'}</span> {isTamil ? 'மதிப்பீடு' : 'Dashboard'}
          </h1>
          <p className="animate-fade-in stagger-1 text-muted">
            {isTamil 
              ? 'தமிழக விவசாயிகள் ஒன்றிணைந்து கழிவுகளை செல்வமாக மாற்றி நிகழ்த்திய சுற்றுச்சூழல் சாதனைகளின் தொகுப்பு' 
              : 'Real-time collective statistics tracking platform-wide carbon offsets and secondary rural earnings.'}
          </p>
        </div>
      </div>

      <div className="container mt-3">

        {/* 1. FOUR COMMUNITY SCALE KPI CARDS */}
        <section className="kpis-section mb-4">
          <div className="kpis-grid">
            
            {/* KPI 1: Farmers Empowered */}
            <div className="glass-card kpi-card green-glow animate-fade-in">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>
              
              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-green-light">
                  <Users size={24} className="text-primary animate-pulse" />
                </div>
              </div>
              <div className="kpi-data mt-4">
                <p className="kpi-label text-muted text-xs uppercase">{isTamil ? 'பயன்பெற்ற விவசாயிகள்' : 'Farmers Empowered'}</p>
                <h2 className="kpi-value text-gradient font-bold">{uniqueFarmers} {isTamil ? 'உழவர்கள்' : 'Farmers'}</h2>
                <p className="kpi-subtext text-xs text-muted">
                  {isTamil ? 'கூட்டுறவு மற்றும் உழவர் குழுக்கள் மூலம் இணைக்கப்பட்டவர்கள்' : 'Active landholders trading residues'}
                </p>
              </div>
            </div>

            {/* KPI 2: Waste Recycled */}
            <div className="glass-card kpi-card orange-glow animate-fade-in stagger-1">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-orange-light" style={{ background: 'rgba(249, 115, 22, 0.08)' }}>
                  <Leaf size={24} style={{ color: '#f97316' }} />
                </div>
                <span className="kpi-badge warning" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>{isTamil ? 'வட்டார சூழல்' : 'Circular'}</span>
              </div>
              <div className="kpi-data mt-4">
                <p className="kpi-label text-muted text-xs uppercase">{isTamil ? 'மறுசுழற்சி செய்த கழிவுகள்' : 'Biomass Valorized'}</p>
                <h2 className="kpi-value text-gradient-orange font-bold" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {isTamil ? `${platformTotalBiomassTons} டன்` : `${platformTotalBiomassTons} Tons`}
                </h2>
                <p className="kpi-subtext text-xs text-muted">
                  {isTamil ? 'திறந்தவெளியில் எரிக்காமல் பாதுகாக்கப்பட்ட கழிவுகள்' : 'Straw, bagasse, and husks recycled'}
                </p>
              </div>
            </div>

            {/* KPI 3: Collective Earnings */}
            <div className="glass-card kpi-card gold-glow animate-fade-in stagger-2">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-yellow-light">
                  <DollarSign size={24} className="text-secondary" />
                </div>
                <span className="kpi-badge warning">{isTamil ? 'கூடுதல் லாபம்' : 'Secondary Income'}</span>
              </div>
              <div className="kpi-data mt-4">
                <p className="kpi-label text-muted text-xs uppercase">{isTamil ? 'ஈட்டப்பட்ட கூடுதல் வருவாய்' : 'Farmers Green Payouts'}</p>
                <h2 className="kpi-value text-gradient-gold font-bold">{isTamil ? `₹ ${platformTotalEarningsLakhs} லட்சம்` : `₹ ${platformTotalEarningsLakhs} Lakhs`}</h2>
                <p className="kpi-subtext text-xs text-muted">
                  {isTamil ? 'வழக்கமான பயிர் வருவாயைத் தாண்டிய கூடுதல் லாபம்' : 'Secondary revenues routed to rural economy'}
                </p>
              </div>
            </div>

            {/* KPI 4: Carbon Reduction */}
            <div className="glass-card kpi-card blue-glow animate-fade-in stagger-3">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              <div className="flex-between align-center">
                <div className="kpi-icon-wrap bg-teal-light">
                  <Globe size={24} className="text-teal" />
                </div>
                <span className="kpi-badge info">{isTamil ? 'சான்றளிக்கப்பட்டது' : 'Certified'}</span>
              </div>
              <div className="kpi-data mt-4">
                <p className="kpi-label text-muted text-xs uppercase">{isTamil ? 'குறைக்கப்பட்ட கார்பன் அளவு' : 'Carbon Reduction'}</p>
                <h2 className="kpi-value text-gradient-teal font-bold">{isTamil ? `${platformTotalCo2Tons} டன் CO₂` : `${platformTotalCo2Tons} Tons CO₂`}</h2>
                <span className="trees-pill mt-1 inline-flex align-center gap-1">
                  🌳 <span>{isTamil ? `${platformTreesEquivalent} மரங்கள் நட்டதற்கு சமம்!` : `Equivalent to ${platformTreesEquivalent} trees planted`}</span>
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 2. INTERACTIVE REGIONAL MAP HUD */}
        <section className="map-hud-section mb-4 animate-fade-in">
          <div className="glass-card map-hud-card">
            
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>

            <div className="flex-between align-center mb-3">
              <div>
                <h3 className="section-title text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                  <MapPin size={18} />
                  <span>{isTamil ? 'மாவட்ட வாரியான தாக்க விவரங்கள்:' : 'Regional Impact Heat Map:'}</span>
                </h3>
                <p className="text-xs text-muted">{isTamil ? 'மாவட்டத்தைத் தட்டி அப் பகுதியின் கூட்டுச் சாதனையைக் காணுங்கள்' : 'Tap on districts to view localized community milestones'}</p>
              </div>
              <span className="live-hub-badge flex align-center gap-1">
                <Activity size={12} className="text-primary animate-pulse" />
                <span>{isTamil ? 'நேரடித் தரவு' : 'Live Feeds'}</span>
              </span>
            </div>

            {/* Interactive District Selector Buttons Scroll */}
            <div className="district-selectors-scroll mb-3">
              {Object.keys(DISTRICT_IMPACTS).map((key) => {
                const dist = DISTRICT_IMPACTS[key];
                return (
                  <button
                    key={key}
                    className={`district-chip ${selectedDistrict === key ? 'active' : ''}`}
                    onClick={() => setSelectedDistrict(key)}
                  >
                    <span>📍 {isTamil ? dist.nameTa : dist.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Local District HUD Analytics display */}
            <div className="district-hud-display glass mt-4 animate-pulse-subtle">
              <div className="hud-header border-bottom pb-2 mb-3 flex-between align-center">
                <span className="hud-title font-bold text-gradient-gold" style={{ fontSize: '1.1rem' }}>
                  {isTamil ? activeDist.nameTa : activeDist.name} {isTamil ? 'தாக்க அறிக்கை:' : 'Impact Report:'}
                </span>
                <span className="fpos-pill text-xxs font-bold uppercase">
                  🏢 {activeDist.activeFpos} {isTamil ? 'செயல்படும் FPO குழுக்கள்' : 'Active FPOs'}
                </span>
              </div>

              <div className="hud-stats-grid">
                <div className="hud-stat-box">
                  <span className="lbl text-xxs text-muted block uppercase">{isTamil ? 'இணைந்த விவசாயிகள்' : 'Joined Farmers'}</span>
                  <span className="val font-bold text-sm">{activeDist.farmers} {isTamil ? 'உழவர்கள்' : 'Farmers'}</span>
                </div>
                <div className="hud-stat-box">
                  <span className="lbl text-xxs text-muted block uppercase">{isTamil ? 'மறுசுழற்சி செய்த கழிவுகள்' : 'Residue Diverted'}</span>
                  <span className="val font-bold text-sm text-primary">{isTamil ? activeDist.wasteTa : activeDist.waste}</span>
                </div>
                <div className="hud-stat-box">
                  <span className="lbl text-xxs text-muted block uppercase">{isTamil ? 'ஈட்டிய கூடுதல் தொகை' : 'Cooperative Payout'}</span>
                  <span className="val font-bold text-sm text-gradient-gold">{isTamil ? activeDist.earningsTa : activeDist.earnings}</span>
                </div>
                <div className="hud-stat-box">
                  <span className="lbl text-xxs text-muted block uppercase">{isTamil ? 'தவிர்க்கப்பட்ட உமிழ்வுகள்' : 'Emissions Prevented'}</span>
                  <span className="val font-bold text-sm text-teal">{isTamil ? activeDist.co2Ta : activeDist.co2}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. PLATFORM ECO-MILESTONES & RECENT TRANSACTIONS */}
        <div className="bottom-impact-grid flex-column gap-3 mb-4">
          
          {/* Milestones / Achievements Tiers Card */}
          <div className="glass-card achievements-card animate-fade-in">
            <h4 className="card-sub-title font-bold text-sm mb-3" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={18} className="text-secondary" />
              <span>{isTamil ? 'நிலைத்தன்மை சான்றிதழ்கள் & விருதுகள்:' : 'Sustainability Certifications:'}</span>
            </h4>

            <div className="achievements-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {PLATFORM_ACHIEVEMENTS.map((ach) => (
                <div key={ach.id} className="achievement-row glass">
                  <span className="ach-badge" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{ach.badge}</span>
                  <div className="flex-1">
                    <div className="flex-between align-center mb-1 flex-wrap">
                      <span className="ach-title font-bold text-xs">{isTamil ? ach.titleTa : ach.title}</span>
                      <span className="ach-date text-xxs text-muted">{ach.date}</span>
                    </div>
                    <p className="ach-desc text-xs text-muted mb-1" style={{ margin: 0 }}>
                      {isTamil ? ach.descTa : ach.desc}
                    </p>
                    <span className="ach-authority text-xxs font-bold block mt-1" style={{ color: 'var(--color-primary-dark)' }}>
                      🛡️ {isTamil ? ach.authorityTa : ach.authority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Cooperative deals ticker */}
          <div className="glass-card community-ticker-card animate-fade-in stagger-1">
            <h4 className="card-sub-title font-bold text-sm mb-3" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={18} className="text-primary-light" />
              <span>{isTamil ? 'சமீபத்திய பசுமை வர்த்தகப் பதிவுகள்:' : 'Recent Green Trade Register:'}</span>
            </h4>

            <div className="deals-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {RECENT_COMMUNITY_DEALS.map((deal, idx) => (
                <div key={idx} className="deal-row glass">
                  <div className="flex align-center gap-2 mb-1 flex-wrap justify-between">
                    <span className="fpo-name font-bold text-xs">🏢 {isTamil ? deal.fpoTa : deal.fpo}</span>
                    <span className="deal-payout font-bold text-gradient-gold text-xs">{deal.payout}</span>
                  </div>
                  <p className="deal-action text-xs text-muted mb-1" style={{ margin: 0 }}>
                    {isTamil ? deal.actionTa : deal.action}
                  </p>
                  <span className="deal-co2 text-xxs font-bold text-teal" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    🌱 {deal.co2}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. JOIN THE CIRCULAR MOVEMENT CALL TO ACTION */}
        {!isBuyer && (
          <section className="join-circular-movement-section mb-4 animate-fade-in">
            <div className="glass-card circular-cta-card glow-green">
              
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              <h3 className="hud-title text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                <Leaf size={18} className="text-primary animate-pulse" />
                <span>{isTamil ? 'உபரி கழிவுகளை விற்கத் தயாரா?' : 'Ready to Sell Residues?'}</span>
              </h3>

              <p className="text-xs text-muted" style={{ lineHeight: 1.5, margin: 0 }}>
                {isTamil 
                  ? 'உங்கள் நிலத்திலுள்ள நெல் வைக்கோல், தென்னை மட்டை, கரும்புச் சக்கைகளை நேரடியாக FPO ஆலைகளுக்கு விற்று சமூகத் தாக்கத்தை ஏற்படுத்துங்கள்.' 
                  : 'Turn your farm wastes into secondary green income. Direct list on our marketplace to support air pollution reduction today.'}
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button 
                  type="button" 
                  className="btn btn-primary flex-1 flex-center futuristic-glow-btn"
                  onClick={() => navigate('/add-resource')}
                >
                  <span>{isTamil ? 'பயிர்க்கழிவைச் சேர்' : 'Add Waste Resource'}</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary flex-1 flex-center"
                  onClick={() => navigate('/surplus-prediction')}
                >
                  <span>{isTamil ? 'உபரியைக் கணக்கிடு' : 'Calculate Surplus'}</span>
                </button>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ImpactDashboard;

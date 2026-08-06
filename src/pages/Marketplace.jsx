import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, MessageSquare, Star, Navigation, 
  X, ChevronDown, CheckCircle2, Sparkles, MessageCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import './Marketplace.css';

// Simulated Locations for Proximity Calculation - All 38 Districts of Tamil Nadu
const SIMULATED_LOCATIONS = [
  { id: 'coimbatore', name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', lat: 11.0168, lng: 76.9558 },
  { id: 'chennai', name: 'Chennai', nameTa: 'சென்னை', lat: 13.0827, lng: 80.2707 },
  { id: 'salem', name: 'Salem', nameTa: 'சேலம்', lat: 11.6643, lng: 78.1460 },
  { id: 'erode', name: 'Erode', nameTa: 'ஈரோடு', lat: 11.3410, lng: 77.7172 },
  { id: 'madurai', name: 'Madurai', nameTa: 'மதுரை', lat: 9.9252, lng: 78.1198 },
  { id: 'trichy', name: 'Tiruchirappalli (Trichy)', nameTa: 'திருச்சிராப்பள்ளி (திருச்சி)', lat: 10.7905, lng: 78.7047 },
  { id: 'thanjavur', name: 'Thanjavur', nameTa: 'தஞ்சாவூர்', lat: 10.7870, lng: 79.1378 },
  { id: 'tiruppur', name: 'Tiruppur', nameTa: 'திருப்பூர்', lat: 11.1085, lng: 77.3411 },
  { id: 'dindigul', name: 'Dindigul', nameTa: 'திண்டுக்கல்', lat: 10.3673, lng: 77.9803 },
  { id: 'vellore', name: 'Vellore', nameTa: 'வேலூர்', lat: 12.9165, lng: 79.1325 },
  { id: 'thoothukudi', name: 'Thoothukudi', nameTa: 'தூத்துக்குடி', lat: 8.7973, lng: 78.1348 },
  { id: 'tirunelveli', name: 'Tirunelveli', nameTa: 'திருநெல்வேலி', lat: 8.7139, lng: 77.7567 },
  { id: 'kanyakumari', name: 'Kanyakumari', nameTa: 'கன்னியாகுமரி', lat: 8.1833, lng: 77.4119 },
  { id: 'dharmapuri', name: 'Dharmapuri', nameTa: 'தர்மபுரி', lat: 12.1211, lng: 78.1582 },
  { id: 'krishnagiri', name: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி', lat: 12.5186, lng: 78.2137 },
  { id: 'namakkal', name: 'Namakkal', nameTa: 'நாமக்கல்', lat: 11.2189, lng: 78.1674 },
  { id: 'karur', name: 'Karur', nameTa: 'கரூர்', lat: 10.9601, lng: 78.0766 },
  { id: 'theni', name: 'Theni', nameTa: 'தேனி', lat: 10.0104, lng: 77.4702 },
  { id: 'nilgiris', name: 'Nilgiris (Ooty)', nameTa: 'நீலகிரி (ஊட்டி)', lat: 11.4102, lng: 76.6950 },
  { id: 'pudukkottai', name: 'Pudukkottai', nameTa: 'புதுக்கோட்டை', lat: 10.3797, lng: 78.8205 },
  { id: 'ramanathapuram', name: 'Ramanathapuram', nameTa: 'இராமநாதபுரம்', lat: 9.3639, lng: 78.8395 },
  { id: 'sivaganga', name: 'Sivaganga', nameTa: 'சிவகங்கை', lat: 9.8433, lng: 78.4809 },
  { id: 'virudhunagar', name: 'Virudhunagar', nameTa: 'விருதுநகர்', lat: 9.5680, lng: 77.9624 },
  { id: 'cuddalore', name: 'Cuddalore', nameTa: 'கடலூர்', lat: 11.7480, lng: 79.7714 },
  { id: 'nagapattinam', name: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்', lat: 10.7672, lng: 79.8444 },
  { id: 'tiruvarur', name: 'Tiruvarur', nameTa: 'திருவாரூர்', lat: 10.7725, lng: 79.6361 },
  { id: 'viluppuram', name: 'Viluppuram', nameTa: 'விழுப்புரம்', lat: 11.9401, lng: 79.4861 },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை', lat: 12.2253, lng: 79.0747 },
  { id: 'kanchipuram', name: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', lat: 12.8387, lng: 79.7016 },
  { id: 'tiruvallur', name: 'Tiruvallur', nameTa: 'திருவள்ளூர்', lat: 13.1438, lng: 79.9077 },
  { id: 'perambalur', name: 'Perambalur', nameTa: 'பெரம்பலூர்', lat: 11.2342, lng: 78.8821 },
  { id: 'ariyalur', name: 'Ariyalur', nameTa: 'அரியலூர்', lat: 11.1401, lng: 79.0786 },
  { id: 'tenkasi', name: 'Tenkasi', nameTa: 'தென்காசி', lat: 8.9591, lng: 77.3139 },
  { id: 'chengalpattu', name: 'Chengalpattu', nameTa: 'செங்கல்பட்டு', lat: 12.6939, lng: 79.9757 },
  { id: 'ranipet', name: 'Ranipet', nameTa: 'இராணிப்பேட்டை', lat: 12.9275, lng: 79.3326 },
  { id: 'tirupathur', name: 'Tirupathur', nameTa: 'திருப்பத்தூர்', lat: 12.4926, lng: 78.5678 },
  { id: 'kallakurichi', name: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி', lat: 11.7383, lng: 78.9639 },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை', lat: 11.1018, lng: 79.6522 }
];

const getCoordinatesForLocation = (locationName) => {
  if (!locationName) return { lat: 11.0168, lng: 76.9558 };
  
  // Parse exact location format: "District|lat,lng"
  if (locationName.includes('|')) {
    const parts = locationName.split('|');
    const coordsStr = parts[1];
    if (coordsStr && coordsStr.includes(',')) {
      const [lat, lng] = coordsStr.split(',');
      if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
    }
  }

  const nameClean = locationName.split('|')[0].toLowerCase();
  const found = SIMULATED_LOCATIONS.find(loc => 
    nameClean.includes(loc.name.toLowerCase()) ||
    (loc.nameTa && nameClean.includes(loc.nameTa.toLowerCase()))
  );
  if (found) {
    return { lat: found.lat, lng: found.lng };
  }
  const hash = locationName.length % 10;
  return { 
    lat: 11.0168 + (hash - 5) * 0.05, 
    lng: 76.9558 + (hash - 5) * 0.05 
  };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  const dist = parseFloat(d.toFixed(1));
  if (isNaN(dist) || dist <= 0.2) return 2.4;
  return dist;
};

const calculateTransportCost = (distance) => {
  return Math.round(150 + distance * 12);
};

const getAIRecommendation = (buyer, userResources, isTamil) => {
  if (!userResources || userResources.length === 0) {
    return { recommended: false };
  }
  const match = userResources.find(res => {
    const resCat = (res.category || '').toLowerCase();
    return buyer.needs.some(need => need.toLowerCase() === resCat || need.toLowerCase().includes(resCat));
  });
  if (match) {
    return {
      recommended: true,
      reason: isTamil 
        ? `உங்களின் '${match.title}' வளத்திற்குச் சரியான பொருத்தம்! தூரம் குறைவாக இருப்பதால் போக்குவரத்துச் செலவு குறைவு.`
        : `Perfect match for your '${match.title}' listing! Low transport cost & immediate requirement.`,
      badge: isTamil ? 'நேரடி AI பொருத்தம்' : 'Direct AI Match'
    };
  }
  return { recommended: false };
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { resources, loading: resourcesLoading } = useResources();
  const { user } = useAuth();
  const { isTamil } = useLanguage();
  
  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';

  // State
  const [buyers, setBuyers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(150);
  const [callingBuyer, setCallingBuyer] = useState(null);
  const [negotiatingId, setNegotiatingId] = useState(null);
  
  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const userLocFull = user?.user_metadata?.location;
    if (userLocFull) {
      if (userLocFull.includes('|')) {
        const [dist, coordsStr] = userLocFull.split('|');
        if (coordsStr && coordsStr.includes(',')) {
          const [lat, lng] = coordsStr.split(',');
          if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            return { id: 'user_exact', name: dist, nameTa: dist, lat: parseFloat(lat), lng: parseFloat(lng), isExact: true };
          }
        }
      }
      
      const userLoc = userLocFull.split('|')[0];
      const found = SIMULATED_LOCATIONS.find(loc => 
        loc.name.toLowerCase() === userLoc.toLowerCase() ||
        loc.nameTa === userLoc ||
        userLoc.toLowerCase().includes(loc.name.toLowerCase())
      );
      if (found) return found;
    }
    return SIMULATED_LOCATIONS[0];
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setBuyersLoading(true);
        let data = await api.get('/profiles/all').catch(() => null);
        if (!data) {
          const { data: sbData } = await supabase.from('profiles').select('*');
          data = (sbData || []).map(p => ({
            ...p,
            role: p.full_name === 'TQ' || p.id === 'd18f5a68-8da1-4c34-ab86-c6f21b11f497' ? 'buyer' : 'Farmer'
          }));
        }
        
        if (data) {
          setAllProfiles(data);
        }
        
        // Exclude Farmer/Seller accounts from buyers list! Only keep real database accounts with role = buyer/trader
        const registeredBuyers = (data || [])
          .filter(p => String(p.id) !== String(user?.id) && p.role && (p.role.toLowerCase() === 'buyer' || p.role.toLowerCase() === 'trader'))
          .map(p => {
            const coords = getCoordinatesForLocation(p.location);
            return {
              id: p.id,
              name: p.full_name || 'AgriConnect Buyer',
              nameTa: p.full_name || 'உழவர்வளம் வாங்குபவர்',
              type: 'Individual Buyer',
              typeTa: 'தனிநபர் வாங்குபவர்',
              lat: coords.lat,
              lng: coords.lng,
              needs: ['Paddy Straw', 'Coconut Husk', 'Sugarcane Bagasse'],
              needsTa: ['வைக்கோல்', 'தேங்காய் மட்டை', 'கரும்பு சக்கை'],
              rating: 4.8,
              reviews: 12,
              demandLevel: 'High',
              demandLevelTa: 'அதிகம்',
              verified: true,
              phone: p.phone || '+91 80720 95395',
              locationName: p.location ? p.location.split('|')[0] : 'Tamil Nadu',
              locationNameTa: p.location ? p.location.split('|')[0] : 'தமிழ்நாடு'
            };
          });

        setBuyers(registeredBuyers);
      } catch (err) {
        console.error('Error fetching real buyers in Marketplace:', err);
      } finally {
        setBuyersLoading(false);
      }
    };

    fetchBuyers();
  }, [user]);


  // 1. Process distances, costs, and recommendations for buyers dynamically
  const processedBuyers = buyers.map(buyer => {
    const distance = calculateDistance(selectedLocation.lat, selectedLocation.lng, buyer.lat, buyer.lng);
    const transportCost = calculateTransportCost(distance);
    const aiRec = getAIRecommendation(buyer, resources, isTamil);
    
    return {
      ...buyer,
      distance,
      transportCost,
      aiRec
    };
  });

  // 2. Process crop residues list (for buyers)
  const processedSellers = resources.map(res => {
    const distance = calculateDistance(selectedLocation.lat, selectedLocation.lng, getCoordinatesForLocation(res.location).lat, getCoordinatesForLocation(res.location).lng);
    const transportCost = calculateTransportCost(distance);
    
    // Resolve seller info: use res.seller_name/res.seller_phone from backend, or match profile
    const matchedProfile = allProfiles.find(p => String(p.id) === String(res.user_id)) || buyers.find(p => String(p.id) === String(res.user_id));
    
    let sellerName = res.seller_name || res.sellerName || matchedProfile?.full_name || matchedProfile?.name || 'Agri Farmer';
    let sellerPhone = res.seller_phone || res.sellerPhone || matchedProfile?.phone || '';

    // If viewing user owns this resource, display their exact registered metadata name & phone
    if (user && String(res.user_id) === String(user.id)) {
      sellerName = user.user_metadata?.full_name || sellerName;
      sellerPhone = user.user_metadata?.phone || sellerPhone;
    }

    const isRecommended = distance < 30;
    const aiRec = {
      recommended: isRecommended,
      badge: isTamil ? 'பரிந்துரைக்கப்படும் விற்பனை' : 'Best Match',
      reason: isTamil 
        ? `வட்டாரத்திற்கு மிக அருகில் (${distance} கிமீ) சிறந்த விலை!`
        : `Great price & very close to your location (${distance} km)!`
    };

    return {
      id: res.id,
      name: res.title,
      nameTa: res.title,
      sellerName,
      sellerPhone,
      type: res.category,
      typeTa: {
        'Paddy Straw': 'நெல் வைக்கோல்',
        'Rice Husk': 'உமி',
        'Bagasse': 'கரும்பு சக்கை',
        'Sugarcane Trash': 'கரும்பு தோகை',
        'Coconut Husk': 'தேங்காய் மட்டை',
        'Coconut Shell': 'தேங்காய் சிரட்டை',
        'Banana Stem': 'வாழை தண்டு',
        'Banana Leaves': 'வாழை இலை',
        'Corn Stalks': 'சோள தட்டை',
        'Corn Cobs': 'சோள கதிர் கொண்டை',
        'Groundnut Shells': 'நிலக்கடலை தோல்',
        'Cotton Stalks': 'பருத்தி குச்சிகள்',
        'Millet Straw': 'கம்பு தட்டை',
        'Wheat Straw': 'கோதுமை வைக்கோல்',
        'Sesame Stalks': 'எள் செடி குச்சிகள்',
        'Tapioca Stalks': 'மரவள்ளி குச்சிகள்',
        'Castor Stalks': 'ஆமணக்கு குச்சிகள்',
        'Palm Fronds': 'பனை ஓலை',
        'Arecanut Husk': 'பாக்கு மட்டை',
        'Cashew Shells': 'முந்திரி தோடு',
        'Sunflower Stalks': 'சூரியகாந்தி தட்டை',
        'Mango Leaves': 'மா இலை',
        'Neem Cake': 'வேப்பம் புண்ணாக்கு',
        'Groundnut Cake': 'கடலை புண்ணாக்கு',
        'Cocoa Pods': 'கொக்கோ காய்கள்'
      }[res.category] || res.category,
      distance,
      transportCost,
      rating: 4.7,
      reviews: 12,
      demandLevel: `₹ ${res.price}`,
      demandLevelTa: `₹ ${res.price}`,
      needs: [res.quantity],
      needsTa: [res.quantity],
      aiRec,
      verified: true,
      user_id: res.user_id,
      image_url: res.image_url
    };
  });

  const activePool = isBuyer ? processedSellers : processedBuyers;

  // 3. Multi-stage filtering
  const filteredBuyers = activePool.filter(item => {
    // A. Category Filter
    let matchesCategory = true;
    if (filter !== 'All') {
      matchesCategory = item.type === filter;
    }

    // B. Radius Search Filter
    let matchesRadius = true;
    if (searchRadius < 150) {
      matchesRadius = item.distance <= searchRadius;
    }

    // C. Search query filter
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(query) || (item.nameTa && item.nameTa.toLowerCase().includes(query));
      const typeMatch = item.type.toLowerCase().includes(query) || (item.typeTa && item.typeTa.toLowerCase().includes(query));
      
      const needsMatch = item.needs.some(need => need.toLowerCase().includes(query)) ||
        (item.needsTa && item.needsTa.some(need => need.toLowerCase().includes(query)));
        
      const sellerMatch = item.sellerName && item.sellerName.toLowerCase().includes(query);

      matchesSearch = nameMatch || typeMatch || needsMatch || sellerMatch;
    }

    return matchesCategory && matchesRadius && matchesSearch;
  })
  // Sort: Recommended first, then proximity
  .sort((a, b) => {
    if (a.aiRec.recommended && !b.aiRec.recommended) return -1;
    if (!a.aiRec.recommended && b.aiRec.recommended) return 1;
    return a.distance - b.distance;
  });

  const handleCallSimulation = (buyerObj) => {
    const displayName = isBuyer 
      ? buyerObj.sellerName 
      : (isTamil ? buyerObj.nameTa || buyerObj.name : buyerObj.name);
    const phoneNum = buyerObj.phone || buyerObj.sellerPhone;

    setCallingBuyer(displayName);
    setTimeout(() => {
      setCallingBuyer(null);
      if (phoneNum) {
        window.location.href = `tel:${phoneNum}`;
      } else {
        alert(isTamil ? `${displayName}-க்கு தொலைபேசி எண் கிடைக்கவில்லை!` : `Phone number not available for ${displayName}!`);
      }
    }, 1200);
  };

  const handleNegotiate = async (buyerObj) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      setNegotiatingId(buyerObj.id);
      
      const isResource = isBuyer; 
      const resourceId = isResource ? buyerObj.id : null; 
      const receiverId = isResource ? buyerObj.user_id : buyerObj.id;
      const resourceTitle = isResource ? buyerObj.name : 'Direct Negotiation';

      if (receiverId && receiverId === user.id) {
        alert(isTamil ? 'இது உங்கள் சொந்த பட்டியல்!' : 'This is your own resource listing!');
        return;
      }
      
      const data = await api.get('/chats/requests');
      const existingChat = [...(data.requests || []), ...(data.chats || [])].find(c => {
        if (isResource) {
           return c.resource_id === resourceId && (c.sender_id === user.id || c.receiver_id === user.id);
        } else {
           return (c.sender_id === user.id && c.receiver_id === receiverId) || 
                  (c.sender_id === receiverId && c.receiver_id === user.id);
        }
      });
      
      if (existingChat) {
        if (existingChat.status !== 'accepted') {
           await api.put(`/chats/requests/${existingChat.id}`, { status: 'accepted' });
        }
        navigate(`/chat/${existingChat.id}`);
        return;
      }
      
      const newChat = await api.post('/chats/requests', {
        receiver_id: receiverId,
        resource_id: resourceId,
        resource_title: resourceTitle,
        status: 'accepted'
      });
      
      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      console.error(err);
      alert('Error starting chat: ' + (err.message || 'Failed to start negotiation'));
    } finally {
      setNegotiatingId(null);
    }
  };

  const dynamicMapEmbedUrl = `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="marketplace-page" style={{paddingBottom: '80px', backgroundColor: 'var(--bg-main)', minHeight: '100vh'}}>
      
      {/* 1. Search & Location Bar */}
      <div className="container mt-4 mb-4" style={{ position: 'relative', zIndex: 50 }}>
           <div className="search-bar glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 50, width: '100%', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              
              {/* Dropdown Location Picker */}
              <div className="location-picker-container" style={{ position: 'relative', zIndex: 51 }}>
                <button 
                  type="button" 
                  className="location-select-pill"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: 'var(--color-primary-dark)',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <MapPin size={14} />
                  <span>{isTamil ? selectedLocation.nameTa : selectedLocation.name}</span>
                  <ChevronDown size={14} />
                </button>

                {showLocationDropdown && (
                  <>
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, background: 'transparent' }} 
                      onClick={() => setShowLocationDropdown(false)}
                    />
                    <div className="location-dropdown-menu" style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '240px',
                      maxHeight: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      zIndex: 99999,
                      boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(5, 150, 105, 0.25)',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', backgroundColor: '#ffffff' }}>
                        <input 
                          type="text"
                          className="location-search-field"
                          placeholder={isTamil ? "தேடுக..." : "Search district..."}
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(6, 78, 59, 0.15)',
                            borderRadius: '8px',
                            outline: 'none',
                            color: 'var(--text-main)',
                            backgroundColor: '#f4fcf8'
                          }}
                        />
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1, maxHeight: '220px', backgroundColor: '#ffffff' }}>
                        {SIMULATED_LOCATIONS.filter(loc => 
                          loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                          loc.nameTa.toLowerCase().includes(locationSearch.toLowerCase())
                        ).map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            className={`dropdown-item-btn ${selectedLocation.id === loc.id ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedLocation(loc);
                              setShowLocationDropdown(false);
                              setLocationSearch('');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              border: 'none',
                              background: selectedLocation.id === loc.id ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                              color: selectedLocation.id === loc.id ? 'var(--color-primary-dark)' : 'var(--text-main)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <MapPin size={11} className={selectedLocation.id === loc.id ? 'text-primary' : 'text-muted'} />
                            <span style={{ fontWeight: selectedLocation.id === loc.id ? '700' : '400' }}>
                              {isTamil ? loc.nameTa : loc.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>

              <input 
                type="text" 
                placeholder={isBuyer ? (isTamil ? "பயிர்க்கழிவு பெயர் அல்லது வகையைத் தேடுக..." : "Search crop residue, title, or type...") : (isTamil ? "வாங்குபவர் பெயர் அல்லது பயிரைத் தேடுக..." : "Search buyer name, type, or crop...")} 
                className="w-100" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '0.95rem' }}
              />
              {searchQuery && (
                <button className="btn-icon" onClick={() => setSearchQuery('')} title="Clear" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={18} className="text-muted" />
                </button>
              )}
           </div>
      </div>

       <div className="container mt-4">

        {/* Category Filters Bar */}
        <div className="buyer-filters mb-4 animate-fade-in stagger-2" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
          {[
            'All', 'Paddy Straw', 'Rice Husk', 'Bagasse', 'Sugarcane Trash', 
            'Coconut Husk', 'Coconut Shell', 'Banana Stem', 'Corn Stalks', 
            'Tapioca Stalks', 'Groundnut Shells', 'Cotton Stalks'
          ].map(type => (
            <button
              key={type}
              className={`filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: filter === type ? 'none' : '1px solid rgba(0,0,0,0.1)',
                backgroundColor: filter === type ? 'var(--color-primary)' : '#ffffff',
                color: filter === type ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: filter === type ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none'
              }}
            >
              {type === 'All' ? (isTamil ? 'அனைத்தும்' : 'All') : type}
            </button>
          ))}
        </div>

        {/* 5. Rich Dynamic Cards Section */}
        <div className="buyer-list animate-fade-in stagger-3">
          <div className="flex-between align-center mb-3">
            <h2 style={{fontSize: '1.15rem', fontWeight: '700', margin: 0}}>
              {isBuyer 
                ? (isTamil ? `அருகிலுள்ள பயிர்க்கழிவுகள் (${filteredBuyers.length})` : `Nearby Crop Residues (${filteredBuyers.length})`)
                : (isTamil ? `அருகிலுள்ள வாங்குபவர்கள் (${filteredBuyers.length})` : `Nearby Buyers matching criteria (${filteredBuyers.length})`)
              }
            </h2>
          </div>
          
          <div className="grid-cards" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
             {buyersLoading || resourcesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div className="typing-dots flex-center"><span></span><span></span><span></span></div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                    {isTamil ? 'ஏற்றுகிறது...' : 'Loading...'}
                  </p>
                </div>
              ) : filteredBuyers.length > 0 ? (
                filteredBuyers.map(buyer => (
                  <div 
                    key={buyer.id} 
                    className={`buyer-card-full glass-card ${buyer.aiRec.recommended ? 'ai-recommended' : ''}`}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      border: buyer.aiRec.recommended ? '1.5px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: buyer.aiRec.recommended ? '0 4px 20px -2px rgba(234, 179, 8, 0.08)' : 'var(--shadow-sm)'
                    }}
                  >
                    {/* Premium AI Recommendation Ribbon */}
                    {buyer.aiRec.recommended && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.6rem',
                        borderBottomLeftRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 2
                      }}>
                        <Sparkles size={10} />
                        <span>{buyer.aiRec.badge}</span>
                      </div>
                    )}

                    {isBuyer ? (
                      <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                        <img 
                          src={buyer.image_url || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=200'} 
                          alt={buyer.name} 
                          style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} 
                        />
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <h3 style={{margin: '0', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)'}}>
                              {isTamil ? buyer.nameTa || buyer.name : buyer.name}
                            </h3>
                          </div>
                          <p className="text-muted text-xxs font-bold" style={{margin: '0.1rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                            {isTamil ? buyer.typeTa || buyer.type : buyer.type}
                          </p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                            👤 {isTamil ? `விற்பனையாளர்: ${buyer.sellerName}` : `Seller: ${buyer.sellerName}`}
                          </p>
                          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            📞 {buyer.sellerPhone || '+91 94420 89201'}
                          </p>
                        </div>
                        
                        <div className="distance-badge" style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
                          <Navigation size={11} style={{ transform: 'rotate(45deg)' }} /> 
                          <span>{buyer.distance} {isTamil ? 'கிமீ' : 'km away'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-between" style={{ paddingBottom: '0.5rem', width: '100%' }}>
                         <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                             <h3 style={{margin: '0', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)'}}>
                               {isTamil ? buyer.nameTa || buyer.name : buyer.name}
                             </h3>
                             {buyer.verified && (
                               <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }} title={isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}>
                                 <CheckCircle2 size={14} fill="rgba(34, 197, 94, 0.1)" />
                               </span>
                             )}
                           </div>
                           <p className="text-muted text-xxs font-bold" style={{margin: '0.1rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                             {isTamil ? buyer.typeTa || buyer.type : buyer.type}
                           </p>
                           <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                             📞 {buyer.phone || '+91 94420 89201'}
                           </p>
                         </div>
                         
                         <div className="distance-badge" style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
                           <Navigation size={11} style={{ transform: 'rotate(45deg)' }} /> 
                           <span>{buyer.distance} {isTamil ? 'கிமீ' : 'km away'}</span>
                         </div>
                      </div>
                    )}

                    {/* Stats Grid: Rating, Transit, Reviews */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.5rem 0', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                        <Star size={13} fill="var(--color-secondary)" color="var(--color-secondary)" />
                        <span><b>{buyer.rating}</b> ({buyer.reviews})</span>
                      </div>
                      
                      <div style={{ fontSize: '0.75rem' }}>
                        <span style={{
                          backgroundColor: (!isBuyer && buyer.demandLevel === 'High') ? 'rgba(239, 68, 68, 0.1)' : (!isBuyer && buyer.demandLevel === 'Medium') ? 'rgba(234, 179, 8, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: (!isBuyer && buyer.demandLevel === 'High') ? '#ef4444' : (!isBuyer && buyer.demandLevel === 'Medium') ? '#d97706' : '#6b7280',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '0.7rem'
                        }}>
                          {isBuyer 
                            ? (isTamil ? `விலை: ${buyer.demandLevel}` : `Price: ${buyer.demandLevel}`)
                            : `${isTamil ? buyer.demandLevelTa || buyer.demandLevel : buyer.demandLevel} ${isTamil ? 'தேவை' : 'Demand'}`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 mb-3">
                       <span className="text-xxs font-bold text-muted block mb-1" style={{ textTransform: 'uppercase' }}>
                         {isBuyer 
                           ? (isTamil ? 'பயிர்க்கழிவு அளவு:' : 'Available Quantity:') 
                           : (isTamil ? 'தேவைப்படும் பொருட்கள்:' : 'Looking for:')
                         }
                       </span>
                       <div style={{display: 'flex', gap: '0.4rem', flexWrap: 'wrap'}}>
                          {isTamil ? (buyer.needsTa || buyer.needs).map((need, idx) => (
                            <span key={idx} className="need-tag" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>{need}</span>
                          )) : buyer.needs.map((need, idx) => (
                            <span key={idx} className="need-tag" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>{need}</span>
                          ))}
                       </div>
                    </div>

                    {/* AI Recommendation Reasoning */}
                    {buyer.aiRec.recommended && (
                      <div style={{
                        background: 'rgba(234, 179, 8, 0.05)',
                        borderLeft: '3px solid #fbbf24',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary-dark)',
                        lineHeight: '1.4',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <Sparkles size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                        <span>{buyer.aiRec.reason}</span>
                      </div>
                    )}

                    <div className="buyer-actions border-top pt-3" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                       <button 
                         className="btn flex-1" 
                         onClick={() => handleNegotiate(buyer)}
                         disabled={negotiatingId === buyer.id}
                         style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center', 
                           gap: '8px', 
                           fontSize: '0.88rem', 
                           fontWeight: '600',
                           padding: '0.65rem 1.2rem',
                           borderRadius: '50px',
                           border: '1.5px solid #a7f3d0',
                           background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                           color: '#15803d',
                           boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)',
                           cursor: 'pointer',
                           transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                       >
                         <MessageCircle size={16} style={{ color: '#16a34a' }} /> 
                         <span>{negotiatingId === buyer.id ? (isTamil ? 'திறக்கிறது...' : 'Opening...') : (isTamil ? 'செய்தி' : 'Message')}</span>
                       </button>
                       <button 
                         className="btn flex-1" 
                         onClick={() => handleCallSimulation(buyer)}
                         disabled={callingBuyer !== null}
                         style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center', 
                           gap: '8px', 
                           fontSize: '0.88rem', 
                           fontWeight: '600',
                           padding: '0.65rem 1.2rem',
                           borderRadius: '50px',
                           border: 'none',
                           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                           color: '#ffffff',
                           boxShadow: '0 4px 14px rgba(16, 185, 129, 0.32)',
                           cursor: 'pointer',
                           transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                       >
                         <Phone size={16} /> 
                         <span>
                           {callingBuyer === (isBuyer ? buyer.sellerName : (isTamil ? buyer.nameTa || buyer.name : buyer.name)) 
                             ? (isTamil ? 'அழைக்கிறது...' : 'Calling...') 
                             : (isBuyer ? (isTamil ? 'தொடர்புகொள்' : 'Call Seller') : (isTamil ? 'தொடர்புகொள்' : 'Call Buyer'))}
                         </span>
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-buyers-state glass-card text-center py-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={40} className="text-muted" style={{ opacity: 0.6 }} />
                  <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {isBuyer ? (isTamil ? 'விவசாயிகள் யாரும் கிடைக்கவில்லை' : 'No Sellers Nearby') : (isTamil ? 'யாரும் கிடைக்கவில்லை' : 'No Buyers Nearby')}
                  </h4>
                  <p className="text-xs text-muted" style={{ margin: 0, maxWidth: '280px' }}>
                    {isBuyer ? (
                      isTamil 
                        ? 'தூர வரம்பிற்குள் அல்லது இந்த பிரிவில் தற்சமயம் பயிர்க்கழிவுகள் எதுவும் இல்லை. தூரத்தை அதிகரித்து பார்க்கவும்.' 
                        : 'No matching crop residues found within this radius or filter. Try increasing the search radius.'
                    ) : (
                      isTamil 
                        ? 'தூர வரம்பிற்குள் அல்லது இந்த பிரிவில் தற்சமயம் வாங்குபவர்கள் யாரும் இல்லை. தூரத்தை அதிகரித்து பார்க்கவும்.' 
                        : 'No matching buyers found within this radius or filter. Try increasing the search radius.'
                    )}
                  </p>
                  <button className="btn btn-secondary btn-sm mt-2" onClick={() => setSearchRadius(150)}>
                    {isBuyer ? (isTamil ? 'அனைத்து பயிர்க்கழிவுகளையும் காட்டு' : 'Reset Radius Limit') : (isTamil ? 'அனைத்து வாங்குவோரையும் காட்டு' : 'Reset Radius Limit')}
                  </button>
                </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Marketplace;

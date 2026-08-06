import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  CloudSun, 
  MapPin, 
  TrendingUp, 
  PlusCircle, 
  List, 
  Users, 
  Home, 
  MessageCircle, 
  User,
  Star,
  Sparkles,
  Phone,
  Navigation,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  LineChart,
  Award,
  MessageSquare,
  UserCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../lib/supabase';

// Simulated Locations for Proximity Calculation
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

// Proximity Math helper (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  const dist = parseFloat(d.toFixed(1));
  if (isNaN(dist) || dist <= 0.2) return 2.4;
  return dist;
};

// Transport Cost Math helper
const calculateTransportCost = (distance) => {
  // Base fare: ₹150, rate per km: ₹12
  const cost = 150 + distance * 12;
  return Math.round(cost);
};

// Smart AI Recommendation Logic
const getAIRecommendation = (buyer, userResources, isTamil) => {
  if (!userResources || userResources.length === 0) {
    if (buyer.demandLevel === 'High' && buyer.rating >= 4.7) {
      return {
        recommended: true,
        reason: isTamil 
          ? `அதிக தேவை & நன்மதிப்பு! உங்கள் ${buyer.needsTa[0]}-ஐ பட்டியலிட்டு இவரைத் தொடர்பு கொள்ளுங்கள்.` 
          : `High demand & top rating! List your ${buyer.needs[0]} and contact them today.`,
        badge: isTamil ? 'AI பரிந்துரை' : 'AI Recommended'
      };
    }
    return { recommended: false };
  }

  // Find if user has a listed resource that this buyer looks for
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

  if (buyer.rating >= 4.7) {
    return {
      recommended: true,
      reason: isTamil 
        ? `சிறந்த வாங்குபவர்! போக்குவரத்துச் செலவு மற்றும் மதிப்பீடுகளின் அடிப்படையில் பரிந்துரைக்கப்படுகிறது.`
        : `Highly rated buyer! Suggested based on proximity and excellent payment history.`,
      badge: isTamil ? 'சிறந்த வாங்குபவர்' : 'Top Buyer Match'
    };
  }

  return { recommended: false };
};

// Caching Helpers for Weather
const getWeatherCacheKey = (lat, lng) => {
  const rLat = parseFloat(lat).toFixed(2);
  const rLng = parseFloat(lng).toFixed(2);
  return `weather_cache_${rLat}_${rLng}`;
};

const getCachedWeather = (lat, lng) => {
  try {
    const key = getWeatherCacheKey(lat, lng);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { timestamp, data } = JSON.parse(cached);
    // Cache weather data for 5 minutes (300,000 milliseconds)
    if (Date.now() - timestamp < 300000) {
      return data;
    }
    localStorage.removeItem(key);
    return null;
  } catch (e) {
    return null;
  }
};

const setCachedWeather = (lat, lng, data) => {
  try {
    const key = getWeatherCacheKey(lat, lng);
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    // Ignore
  }
};

// Geocoding Helpers
const fetchReverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const village = data.locality || data.village || data.suburb || '';
      const city = data.city || data.district || data.principalSubdivision || '';
      if (village && city && village !== city) {
        return `${village}, ${city}`;
      }
      return city || village || `${parseFloat(lat).toFixed(3)}, ${parseFloat(lng).toFixed(3)}`;
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
  }
  return null;
};

const fetchIPLocation = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          name: data.city ? `${data.city}, ${data.region || ''}` : 'Approximate Location',
          nameTa: data.city ? `${data.city}, ${data.region || ''}` : 'தோராயமான இருப்பிடம்'
        };
      }
    }
  } catch (err) {
    console.error('ipapi.co error, trying fallback:', err);
  }
  
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          name: data.cityName ? `${data.cityName}, ${data.regionName || ''}` : 'Approximate Location',
          nameTa: data.cityName ? `${data.cityName}, ${data.regionName || ''}` : 'தோராயமான இருப்பிடம்'
        };
      }
    }
  } catch (err) {
    console.error('Fallback IP location error:', err);
  }
  return null;
};

const Dashboard = () => {
  const { resources, loading } = useResources();
  const { user } = useAuth();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  // Location Selector state
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
  
  // Geolocation and Geocoding states
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [locationMethod, setLocationMethod] = useState('simulated'); // 'gps' | 'ip' | 'manual' | 'simulated'
  const [gpsPermission, setGpsPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'error'
  const [approximateLocActive, setApproximateLocActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Category Filter state
  const [activeFilter, setActiveFilter] = useState('All');

  // Simulated calling status
  const [callingBuyer, setCallingBuyer] = useState(null);
  const [negotiatingId, setNegotiatingId] = useState(null);

  // Live Weather States
  const [weatherTemp, setWeatherTemp] = useState('32°C');
  const [weatherCondition, setWeatherCondition] = useState(isTamil ? 'வெயில்' : 'Sunny');

  // Real Buyers state loaded from Supabase profiles
  const [buyers, setBuyers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(true);

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
        console.error('Error fetching real buyers in Dashboard:', err);
      } finally {
        setBuyersLoading(false);
      }
    };

    fetchBuyers();
  }, [user]);

  const requestGPSLocation = () => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser. Falling back to IP.");
      runIPFallback("Geolocation not supported");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsPermission('granted');
        try {
          const resolvedName = await fetchReverseGeocode(latitude, longitude);
          const locationName = resolvedName || (isTamil ? 'உமது இருப்பிடம்' : 'Your Location');
          
          const gpsLoc = {
            id: 'gps',
            name: locationName,
            nameTa: locationName,
            lat: latitude,
            lng: longitude,
            isGPS: true
          };
          
          setSelectedLocation(gpsLoc);
          setLocationMethod('gps');
          setApproximateLocActive(false);
        } catch (e) {
          console.error("Error setting GPS location:", e);
          runIPFallback(e.message);
        }
      },
      (error) => {
        console.warn("GPS Permission denied or error:", error);
        if (error.code === 1) {
          setGpsPermission('denied');
        } else {
          setGpsPermission('error');
        }
        runIPFallback(error.message || "Permission Denied");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const runIPFallback = async (reason) => {
    console.log(`Running IP fallback. Reason: ${reason}`);
    try {
      const ipLoc = await fetchIPLocation();
      if (ipLoc) {
        setSelectedLocation({
          id: 'ip',
          name: ipLoc.name,
          nameTa: ipLoc.nameTa,
          lat: ipLoc.lat,
          lng: ipLoc.lng,
          isIP: true
        });
        setLocationMethod('ip');
        setApproximateLocActive(true);
      } else {
        setWeatherError(isTamil ? "இருப்பிடத்தைக் கண்டறிய முடியவில்லை." : "Unable to detect location automatically.");
        setLocationMethod('simulated');
        setApproximateLocActive(false);
        setWeatherLoading(false);
      }
    } catch (e) {
      setWeatherError(isTamil ? "இருப்பிடத்தைக் கண்டறிய முடியவில்லை." : "Unable to detect location automatically.");
      setLocationMethod('simulated');
      setApproximateLocActive(false);
      setWeatherLoading(false);
    }
  };

  const handleSearchSubmit = async (query) => {
    if (!query || query.trim().length < 3) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results.map(item => ({
            id: `manual_${item.id}`,
            name: `${item.name}, ${item.admin1 || ''}, ${item.country || ''}`,
            nameTa: `${item.name}, ${item.admin1 || ''}, ${item.country || ''}`,
            lat: item.latitude,
            lng: item.longitude,
            isManual: true
          })));
        } else {
          setSearchResults([]);
        }
      }
    } catch (e) {
      console.error("Geocoding API error:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  // Automatically request GPS location on mount
  useEffect(() => {
    requestGPSLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      
      const { lat, lng } = selectedLocation;
      
      // Check cache first
      const cached = getCachedWeather(lat, lng);
      if (cached) {
        setWeatherTemp(cached.temp);
        setWeatherCondition(cached.condition);
        setWeatherLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        if (!res.ok) throw new Error("Weather API failed");
        
        const data = await res.json();
        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const tempStr = `${temp}°C`;
          const code = data.current_weather.weathercode;
          let cond = isTamil ? 'மிதமான வானிலை' : 'Clear Sky';
          if (code === 0) cond = isTamil ? 'தெளிவான வானம்' : 'Clear Sky';
          else if (code >= 1 && code <= 3) cond = isTamil ? 'பகுதி மேகமூட்டம்' : 'Partly Cloudy';
          else if (code >= 51 && code <= 67) cond = isTamil ? 'மழை பொழிவு' : 'Rainy';
          else if (code >= 71 && code <= 77) cond = isTamil ? 'பனி பொழிவு' : 'Snowy';
          
          setWeatherTemp(tempStr);
          setWeatherCondition(cond);
          
          // Save to cache
          setCachedWeather(lat, lng, { temp: tempStr, condition: cond });
        } else {
          throw new Error("No current weather data");
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setWeatherError(isTamil ? "வானிலை தகவல் பெற முடியவில்லை" : "Failed to load weather");
      } finally {
        setWeatherLoading(false);
      }
    };
    
    fetchWeather();
  }, [selectedLocation, isTamil]);

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

  // Real-time Data calculations
  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';
  const userResources = resources.filter(r => r.user_id === user?.id);
  const totalResources = userResources.length;
  const expectedProfitVal = userResources.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const expectedProfit = `₹ ${expectedProfitVal.toLocaleString('en-IN')}`;
  
  const totalWasteSaved = userResources.reduce((sum, r) => sum + parseQuantityToKg(r.quantity), 0);
  const co2Reduced = Math.round(totalWasteSaved * 0.29);
  
  const weather = { 
    temp: weatherTemp, 
    condition: weatherCondition, 
    location: isTamil ? selectedLocation.nameTa : selectedLocation.name 
  };

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
      alert('Error starting chat: ' + err.message);
    } finally {
      setNegotiatingId(null);
    }
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    setLocationMethod('simulated');
    setApproximateLocActive(false);
    setSearchResults([]);
    setShowLocationDropdown(false);
  };

  if (loading) {
    return (
      <div className="dashboard-page flex-center" style={{minHeight: '100vh'}}>
        <div className="loader">{isTamil ? 'ஏற்றுகிறது...' : 'Loading dashboard...'}</div>
      </div>
    );
  }

  // Process buyers list (for farmers)
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
  })
  // Sort: AI recommended first, then by distance ascending
  .sort((a, b) => {
    if (a.aiRec.recommended && !b.aiRec.recommended) return -1;
    if (!a.aiRec.recommended && b.aiRec.recommended) return 1;
    return a.distance - b.distance;
  });

  // Process crop residues (for buyers)
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

    // Check if recommended
    const isRecommended = distance < 30;
    const aiRec = {
      recommended: isRecommended,
      badge: isTamil ? 'பரிந்துரைக்கப்படும் விற்பனையாளர்' : 'Recommended Seller',
      reason: isTamil 
        ? `சிறந்த விலை & உங்களின் வட்டாரத்திற்கு மிக அருகில் (${distance} கிமீ) உள்ளது!`
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
      rating: 4.6,
      reviews: 12,
      demandLevel: `₹ ${res.price}`,
      demandLevelTa: `₹ ${res.price}`,
      needs: [res.quantity],
      needsTa: [res.quantity],
      aiRec,
      verified: true,
      user_id: res.user_id
    };
  })
  .sort((a, b) => {
    if (a.aiRec.recommended && !b.aiRec.recommended) return -1;
    if (!a.aiRec.recommended && b.aiRec.recommended) return 1;
    return a.distance - b.distance;
  });

  // Apply category filter
  const filteredBuyers = (!isBuyer ? processedBuyers : processedSellers).filter(item => {
    if (activeFilter === 'All') return true;
    return item.type === activeFilter;
  });


  return (
    <div className="dashboard-mobile">
      
      {/* 1. Welcome & Weather Section */}
      <header className="dashboard-header animate-fade-in">
        <div className="header-top">
          <div>
            <p className="greeting">{isTamil ? 'வணக்கம்' : 'Welcome'}</p>
            <h1 className="farmer-name">{user?.user_metadata?.full_name || (isTamil ? 'விவசாயி' : 'Farmer Name')}</h1>
          </div>
          <div className="weather-widget glass-card" style={{ cursor: 'pointer' }} onClick={() => {
            setShowLocationDropdown(true);
            const container = document.querySelector('.location-simulator-container');
            if (container) {
              container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }} title={isTamil ? "இருப்பிடத்தை மாற்ற கிளிக் செய்யவும்" : "Click to change location"}>
            {weatherLoading ? (
              <div className="weather-loading-spinner" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="spinner-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', animation: 'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize: '0.75rem' }}>{isTamil ? 'ஏற்றுகிறது...' : 'Loading weather...'}</span>
              </div>
            ) : weatherError ? (
              <div className="weather-error" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 'bold' }}>⚠️ {weatherError}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{isTamil ? 'மீண்டும் முயற்சிக்க கிளிக் செய்யவும்' : 'Click to retry location'}</span>
              </div>
            ) : (
              <>
                <CloudSun size={24} color="var(--color-secondary)" />
                <div className="weather-info">
                  <span className="temp">{weather.temp}</span>
                  <span className="condition" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    {weather.condition}, {weather.location}
                    {locationMethod === 'gps' && <span className="loc-badge gps" style={{ fontSize: '0.65rem', color: '#4ade80', marginLeft: '4px' }} title={isTamil ? "சரிபார்க்கப்பட்ட ஜிபிஎஸ்" : "Verified GPS"}> 🟢 GPS</span>}
                    {approximateLocActive && <span className="loc-badge approx" style={{ fontSize: '0.65rem', color: '#fbbf24', marginLeft: '4px' }} title={isTamil ? "தோராயமான ஐபி முகவரி" : "Approximate IP Location"}> ⚠️ Approx</span>}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main-content">
        
        {/* 2. Profit Analytics Card (Sellers only) */}
        {!isBuyer && (
          <section className="analytics-section animate-fade-in stagger-1">
            <div className="profit-card">
              <div className="profit-header">
                <p>{isTamil ? 'எதிர்பார்க்கப்படும் வருவாய்' : 'Expected Revenue'}</p>
                <TrendingUp size={20} color="var(--color-primary-light)" />
              </div>
              <h2 className="profit-amount">{expectedProfit}</h2>
              <div className="profit-footer">
                <span>{isTamil ? `${totalResources} பட்டியல்களின் அடிப்படையில்` : `Based on ${totalResources} active listings`}</span>
              </div>
            </div>
          </section>
        )}

        {/* Sustainability Impact Banner (Sellers/Farmers only) */}
        {!isBuyer && (
          <section className="sustainability-banner-section animate-fade-in stagger-1-5" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <div 
              className="glass-card sustainability-banner" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.08) 0%, rgba(234, 179, 8, 0.05) 100%)',
                border: '1px solid rgba(21, 128, 61, 0.2)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(21, 128, 61, 0.02)'
              }}
              onClick={() => navigate('/sustainability')}
            >
              <div className="flex align-center gap-3">
                <div className="banner-icon-wrap" style={{ background: 'rgba(21, 128, 61, 0.1)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                  <CloudSun size={22} className="text-primary animate-pulse" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-xs" style={{ color: 'var(--color-primary-dark)', margin: 0 }}>
                    {isTamil ? 'உங்களின் பசுமை தாக்க விபரம்:' : 'Your Farming Green Impact:'}
                  </h4>
                  <p className="text-xxs text-muted mt-1" style={{ margin: 0 }}>
                    {isTamil 
                      ? `🌱 ${totalWasteSaved.toLocaleString()} கிலோ கழிவுகள் சேமிப்பு • 🌍 -${co2Reduced.toLocaleString()} கிலோ CO₂ குறைப்பு` 
                      : `🌱 ${totalWasteSaved.toLocaleString()} kg waste saved • 🌍 -${co2Reduced.toLocaleString()} kg CO₂ reduced`}
                  </p>
                </div>
              </div>
              <div className="flex align-center" style={{ color: 'var(--color-primary-dark)', gap: '2px' }}>
                <span className="text-xxs font-bold" style={{ fontSize: '0.7rem' }}>{isTamil ? 'பார்க்க' : 'View'}</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </section>
        )}

        {/* 3. Quick Action Buttons */}
        <section className="quick-actions-section animate-fade-in stagger-2">
          <h3 className="section-title">{isTamil ? 'விரைவான செயல்பாடுகள்' : 'Quick Actions'}</h3>
          <div className="actions-grid">
            {!isBuyer ? (
              <>
                <button className="action-btn" onClick={() => navigate('/add-resource')}>
                  <div className="action-icon bg-green">
                    <PlusCircle size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'வளத்தைச் சேர்' : 'Add Resource'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/profile')}>
                  <div className="action-icon bg-yellow">
                    <List size={28} color="var(--color-primary-dark)" />
                  </div>
                  <span>{isTamil ? 'பட்டியல்கள்' : 'My Listings'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/marketplace')}>
                  <div className="action-icon bg-orange">
                    <Users size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'வாங்குவோர்' : 'Nearby Buyers'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/market-insights')}>
                  <div className="action-icon bg-purple">
                    <TrendingUp size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'சந்தை விவரம்' : 'Market Insights'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/surplus-prediction')}>
                  <div className="action-icon bg-indigo">
                    <LineChart size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'பயிர் விளைச்சல் & உபரி கணிப்பான்' : 'AI Yield & Surplus Predictor'}</span>
                </button>
              </>
            ) : (
              <>
                <button className="action-btn" onClick={() => navigate('/marketplace')}>
                  <div className="action-icon bg-orange">
                    <Users size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'பயிர்க்கழிவுகள்' : 'Browse Residues'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/messages')}>
                  <div className="action-icon bg-green">
                    <MessageSquare size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'செய்திகள்' : 'Chats'}</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/market-insights')}>
                  <div className="action-icon bg-purple">
                    <TrendingUp size={28} color="white" />
                  </div>
                  <span>{isTamil ? 'சந்தை விவரம்' : 'Market Insights'}</span>
                </button>

                <button className="action-btn" onClick={() => navigate('/profile')}>
                  <div className="action-icon bg-yellow">
                    <UserCircle size={28} color="var(--color-primary-dark)" />
                  </div>
                  <span>{isTamil ? 'சுயவிவரம்' : 'Profile'}</span>
                </button>
              </>
            )}
          </div>
        </section>

        {/* 4. Nearby Buyer Recommendation Engine (DIRECTLY IN DASHBOARD) */}
        <section className="nearby-buyers-recommendation-section animate-fade-in stagger-3">
          <div className="flex-between align-center mb-3 location-header">
            <div>
              <h3 className="section-title mb-0">
                {isBuyer 
                  ? (isTamil ? 'அருகிலுள்ள பயிர்க்கழிவுகள்' : 'Nearby Crop Residues')
                  : (isTamil ? 'அருகிலுள்ள வாங்குவோர்' : 'Nearby Buyers')
                }
              </h3>
              <p className="text-xs text-muted mt-0">
                {isBuyer
                  ? (isTamil ? 'அருகிலுள்ள சிறந்த கழிவுகள் மற்றும் பரிந்துரைகள்' : 'AI-optimized crop residue recommendations')
                  : (isTamil ? 'AI அடிப்படையிலான சிறந்த தேவைகள் மற்றும் பரிந்துரைகள்' : 'AI-optimized matching & logistics estimates')
                }
              </p>
            </div>
            
            {/* GPS Simulator Pill */}
            <div className="location-simulator-container">
              <button 
                className="location-pill glass-card"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <MapPin size={14} className="text-primary" />
                <span className="location-name">{isTamil ? selectedLocation.nameTa : selectedLocation.name}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {showLocationDropdown && (
                <div className="location-dropdown glass-card" style={{ width: '220px', maxHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                  <div className="dropdown-search-box" style={{ padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        type="text"
                        className="location-search-field"
                        placeholder={isTamil ? "கிராமம்/நகரம்/பின்கோடு..." : "Village, town, pincode..."}
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit(locationSearch);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          border: '1px solid rgba(6, 78, 59, 0.15)',
                          borderRadius: '8px',
                          outline: 'none',
                          color: 'var(--text-main)',
                          backgroundColor: '#f4fcf8'
                        }}
                      />
                      {locationSearch.trim().length >= 3 && (
                        <button
                          onClick={() => handleSearchSubmit(locationSearch)}
                          disabled={searchLoading}
                          style={{
                            padding: '0 8px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          {searchLoading ? '...' : 'Go'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="dropdown-items-list" style={{ overflowY: 'auto', flex: 1 }}>
                    {/* Friendly denial message and GPS request button */}
                    {gpsPermission === 'denied' && (
                      <div className="location-permission-warning" style={{ padding: '8px 10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '0.7rem', color: '#b91c1c' }}>
                        <p style={{ margin: '0 0 6px 0', lineHeight: 1.2 }}>
                          ⚠️ {isTamil ? 'அனுமதி மறுக்கப்பட்டது. தோராயமான வானிலை பயன்படுத்தப்படுகிறது.' : 'GPS denied. Using approximate location.'}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            requestGPSLocation();
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#b91c1c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            width: '100%',
                            textAlign: 'center'
                          }}
                        >
                          {isTamil ? 'துல்லியமான ஜிபிஎஸ்-ஐ இயக்கு' : 'Enable High-Accuracy GPS'}
                        </button>
                      </div>
                    )}

                    {/* Online Search results */}
                    {searchResults.length > 0 && (
                      <div style={{ padding: '4px 10px', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', backgroundColor: 'rgba(21, 128, 61, 0.05)' }}>
                        {isTamil ? 'தேடிய முடிவுகள்:' : 'Search Results:'}
                      </div>
                    )}
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        className={`dropdown-item ${selectedLocation.id === loc.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocationMethod('manual');
                          setApproximateLocActive(false);
                          setShowLocationDropdown(false);
                          setSearchResults([]);
                          setLocationSearch('');
                        }}
                      >
                        <MapPin size={12} className="text-primary animate-pulse" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{loc.name}</span>
                      </button>
                    ))}

                    {/* Predefined Local Locations */}
                    {(searchResults.length === 0 || locationSearch.trim().length === 0) && (
                      <>
                        <div style={{ padding: '4px 10px', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          {isTamil ? 'மாவட்டங்கள்:' : 'Districts (Tamil Nadu):'}
                        </div>
                        {SIMULATED_LOCATIONS.filter(loc => 
                          loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                          loc.nameTa.toLowerCase().includes(locationSearch.toLowerCase())
                        ).map((loc) => (
                          <button
                            key={loc.id}
                            className={`dropdown-item ${selectedLocation.id === loc.id ? 'active' : ''}`}
                            onClick={() => {
                              handleLocationChange(loc);
                              setLocationSearch('');
                            }}
                          >
                            <MapPin size={12} className={selectedLocation.id === loc.id ? 'text-primary' : 'text-muted'} />
                            <span>{isTamil ? loc.nameTa : loc.name}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* No matches fallback */}
                    {searchResults.length === 0 && SIMULATED_LOCATIONS.filter(loc => 
                      loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                      loc.nameTa.toLowerCase().includes(locationSearch.toLowerCase())
                    ).length === 0 && (
                      <div style={{ padding: '12px 10px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 8px 0' }}>{isTamil ? 'உள்ளூர் முடிவுகள் இல்லை' : 'No local matches found'}</p>
                        {locationSearch.trim().length >= 3 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSearchSubmit(locationSearch);
                            }}
                            disabled={searchLoading}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--color-primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {searchLoading ? (isTamil ? 'தேடுகிறது...' : 'Searching...') : `🔍 ${isTamil ? 'ஆன்லைனில் தேடு' : 'Search Online'}`}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.65rem' }}>{isTamil ? 'தேட குறைந்தபட்சம் 3 எழுத்துக்களை தட்டச்சு செய்க' : 'Type at least 3 chars to search'}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Buyers Grid list */}
          <div className="buyer-rec-list">
            {buyersLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', width: '100%' }}>
                <div className="typing-dots flex-center"><span></span><span></span><span></span></div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                  {isTamil ? 'வாங்குபவர்கள் விவரங்களை ஏற்றுகிறது...' : 'Loading buyers...'}
                </p>
              </div>
            ) : filteredBuyers.length > 0 ? (
              filteredBuyers.map((buyer) => (
                <div 
                  key={buyer.id} 
                  className={`buyer-card-premium glass-card ${buyer.aiRec.recommended ? 'ai-recommended' : ''}`}
                >
                  {buyer.aiRec.recommended && (
                    <div className="ai-rec-banner">
                      <Sparkles size={12} className="sparkle-icon" />
                      <span>{buyer.aiRec.badge}</span>
                    </div>
                  )}

                  <div className="buyer-card-header">
                    <div className="buyer-main-info">
                      <div className="buyer-avatar-premium">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="buyer-title-wrap">
                          <h4>{isTamil ? buyer.nameTa : buyer.name}</h4>
                          {buyer.verified && (
                            <span className="verified-badge-pill" title={isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}>
                              <CheckCircle2 size={12} />
                            </span>
                          )}
                        </div>
                        <p className="buyer-type-label">{isTamil ? buyer.typeTa : buyer.type}</p>
                        {isBuyer ? (
                          <>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>👤</span> <span>{isTamil ? `விற்பனையாளர்: ${buyer.sellerName}` : `Seller: ${buyer.sellerName}`}</span>
                            </p>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📞</span> <span>{buyer.sellerPhone || '+91 94420 89201'}</span>
                            </p>
                          </>
                        ) : (
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📞</span> <span>{buyer.phone || '+91 94420 89201'}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="buyer-distance-badge">
                      <Navigation size={10} className="navigation-icon" />
                      <span>{buyer.distance} {isTamil ? 'கிமீ' : 'km'}</span>
                    </div>
                  </div>

                  <div className="buyer-card-stats mt-2">
                    <div className="stat-item">
                      <Star size={14} className="star-icon" />
                      <span className="stat-text"><b>{buyer.rating}</b> ({buyer.reviews})</span>
                    </div>
                    <div className="stat-item">
                      <span className={`demand-badge-pill ${isBuyer ? 'high' : buyer.demandLevel.toLowerCase()}`}>
                        {isTamil ? buyer.demandLevelTa : buyer.demandLevel}
                      </span>
                    </div>
                  </div>

                  <div className="buyer-card-needs mt-3">
                    <span className="label-text">
                      {isBuyer 
                        ? (isTamil ? 'பயிர்க்கழிவு அளவு:' : 'Available Quantity:') 
                        : (isTamil ? 'தேவைப்படுகிறது:' : 'Looking for:')
                      }
                    </span>
                    <div className="needs-tags-container">
                      {isTamil ? buyer.needsTa.map((need, index) => (
                        <span key={index} className="need-tag-pill">{need}</span>
                      )) : buyer.needs.map((need, index) => (
                        <span key={index} className="need-tag-pill">{need}</span>
                      ))}
                    </div>
                  </div>

                  {buyer.aiRec.recommended && (
                    <div className="ai-rec-reasoning mt-3 animate-pulse-subtle">
                      <Sparkles size={14} className="ai-icon" />
                      <p>{buyer.aiRec.reason}</p>
                    </div>
                  )}

                  <div className="buyer-card-actions border-top pt-3 mt-3">
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
              <div className="empty-buyers-state glass-card text-center py-4">
                <Users size={32} className="text-muted mb-2" />
                <p className="text-muted">
                  {isBuyer 
                    ? (isTamil ? 'தேர்ந்தெடுக்கப்பட்ட வகையின்கீழ் பயிர்க்கழிவுகள் எதுவும் இல்லை' : 'No crop residues found for this category nearby.')
                    : (isTamil ? 'தேர்ந்தெடுக்கப்பட்ட வகையின்கீழ் வாங்குபவர்கள் யாரும் இல்லை' : 'No buyers found for this category nearby.')
                  }
                </p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;


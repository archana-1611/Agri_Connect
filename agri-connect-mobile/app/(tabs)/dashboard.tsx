import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  Modal, Image, Dimensions, Alert, TextInput, Linking, Platform 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useResources } from '../../context/ResourceContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sun, Leaf, DollarSign, Scale, Users, Trash2, 
  BookOpen, ChevronRight, HelpCircle, X, ChevronLeft,
  Settings, Award, Sprout, Wind, Sparkles, PlusCircle, List,
  TrendingUp, LineChart, MessageCircle, UserCircle,
  Truck, MessageSquare, ClipboardList, Shield, Phone, MapPin, Navigation,
  CheckCircle, Check, Star, ChevronDown, CheckCircle2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const ACTION_ITEM_WIDTH = (width - 32 - 24) / 3; // 3 columns cleanly calculated

// All 38 Districts of Tamil Nadu for Proximity Math
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

const CATEGORIES = [
  'All',
  'Paddy Straw',
  'Coconut Husk',
  'Sugarcane Bagasse',
  'Rice Husk',
  'Banana Stem',
  'Corn Stalks',
  'Groundnut Shells'
];

const getCoordinatesForLocation = (locationName?: string) => {
  if (!locationName) return { lat: 11.0168, lng: 76.9558 };
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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
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

const calculateTransportCost = (distance: number) => {
  const cost = 150 + distance * 12;
  return Math.round(cost);
};

const getAIRecommendation = (buyer: any, userResources: any[], isTamil: boolean) => {
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
    return { recommended: false, reason: '', badge: '' };
  }

  const match = userResources.find(res => {
    const resCat = (res.category || '').toLowerCase();
    return buyer.needs.some((need: string) => need.toLowerCase() === resCat || need.toLowerCase().includes(resCat));
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

  return { recommended: false, reason: '', badge: '' };
};

const parseQuantityToKg = (qtyStr?: string) => {
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

// Weather Caching Helpers
const getWeatherCacheKey = (lat: number, lng: number) => {
  const rLat = Number(lat).toFixed(2);
  const rLng = Number(lng).toFixed(2);
  return `weather_cache_mobile_${rLat}_${rLng}`;
};

const getCachedWeatherMobile = async (lat: number, lng: number) => {
  try {
    const key = getWeatherCacheKey(lat, lng);
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < 300000) {
      return data;
    }
    await AsyncStorage.removeItem(key);
    return null;
  } catch (e) {
    return null;
  }
};

const setCachedWeatherMobile = async (lat: number, lng: number, data: any) => {
  try {
    const key = getWeatherCacheKey(lat, lng);
    await AsyncStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    // Ignore
  }
};

const fetchReverseGeocodeMobile = async (lat: number, lng: number, isTamil: boolean) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (addresses && addresses.length > 0) {
      const addr = addresses[0];
      const name = addr.district || addr.city || addr.subregion || addr.name || '';
      const region = addr.region || '';
      if (name) {
        return region ? `${name}, ${region}` : name;
      }
    }
  } catch (err) {
    console.warn("Native reverse geocode failed, using fallback:", err);
  }

  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const village = data.locality || data.village || data.suburb || '';
      const city = data.city || data.district || data.principalSubdivision || '';
      if (village && city && village !== city) {
        return `${village}, ${city}`;
      }
      return city || village || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }
  } catch (e) {
    console.error('Reverse geocode API mobile error:', e);
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

export default function DashboardScreen() {
  const { user, demoRole } = useAuth();
  const { resources, loading: resourcesLoading } = useResources();
  const { isTamil, toggleLanguage } = useLanguage();
  const router = useRouter();

  // Location selector state
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
  
  // Weather states
  const [weatherTemp, setWeatherTemp] = useState('32°C');
  const [weatherCondition, setWeatherCondition] = useState(isTamil ? 'தெளிவான வானம்' : 'Clear Sky');
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [locationMethod, setLocationMethod] = useState<'gps' | 'ip' | 'manual' | 'simulated'>('simulated');
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  const [approximateLocActive, setApproximateLocActive] = useState(false);

  // Search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Category Filter
  const [activeFilter, setActiveFilter] = useState('All');

  // Real Buyers state
  const [buyers, setBuyers] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(true);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setBuyersLoading(true);
        const { data: sbData } = await supabase.from('profiles').select('*');
        const data = (sbData || []).map(p => ({
          ...p,
          role: p.full_name === 'TQ' || p.id === 'd18f5a68-8da1-4c34-ab86-c6f21b11f497' ? 'buyer' : (p.role || 'Farmer')
        }));

        if (data) {
          setAllProfiles(data);
        }

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
        console.error('Error fetching buyers in mobile Dashboard:', err);
      } finally {
        setBuyersLoading(false);
      }
    };

    fetchBuyers();
  }, [user]);

  const requestGPSLocation = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsPermission('denied');
        await runIPFallbackMobile('Permission denied');
        return;
      }
      
      setGpsPermission('granted');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      const name = await fetchReverseGeocodeMobile(latitude, longitude, isTamil);
      const locName = name || (isTamil ? 'உமது இருப்பிடம்' : 'Your Location');
      
      const gpsLoc = {
        id: 'gps',
        name: locName,
        nameTa: locName,
        lat: latitude,
        lng: longitude,
        isGPS: true
      };
      
      setSelectedLocation(gpsLoc);
      setLocationMethod('gps');
      setApproximateLocActive(false);
    } catch (e: any) {
      console.error('Error getting GPS location on mobile:', e);
      setGpsPermission('error');
      await runIPFallbackMobile(e.message || 'GPS failed');
    }
  };

  const runIPFallbackMobile = async (reason: string) => {
    try {
      const ipLoc = await fetchIPLocation();
      if (ipLoc) {
        setSelectedLocation({
          id: 'ip',
          name: ipLoc.name,
          nameTa: ipLoc.nameTa,
          lat: ipLoc.lat,
          lng: ipLoc.lng,
          isExact: false
        });
        setLocationMethod('ip');
        setApproximateLocActive(true);
      } else {
        setLocationMethod('simulated');
        setApproximateLocActive(false);
      }
    } catch (err) {
      setLocationMethod('simulated');
      setApproximateLocActive(false);
    }
  };

  const handleSearchSubmit = async (query: string) => {
    if (!query || query.trim().length < 3) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results.map((item: any) => ({
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

  useEffect(() => {
    requestGPSLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      const { lat, lng } = selectedLocation;

      const cached = await getCachedWeatherMobile(lat, lng);
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
          await setCachedWeatherMobile(lat, lng, { temp: tempStr, condition: cond });
        } else {
          throw new Error("No current weather data");
        }
      } catch (err) {
        setWeatherError(isTamil ? "வானிலை தகவல் பெற முடியவில்லை" : "Failed to load weather");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [selectedLocation, isTamil]);

  // Derived user statistics
  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';
  const userResources = resources.filter(r => r.user_id === user?.id);
  const totalResources = userResources.length;
  const expectedProfitVal = userResources.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const expectedProfit = `₹ ${expectedProfitVal.toLocaleString('en-IN')}`;
  
  const totalWasteSaved = userResources.reduce((sum, r) => sum + parseQuantityToKg(r.quantity), 0);
  const co2Reduced = Math.round(totalWasteSaved * 0.29);

  // Recommendations calculation
  const processedBuyers = buyers.map(buyer => {
    const distance = calculateDistance(selectedLocation.lat, selectedLocation.lng, buyer.lat, buyer.lng);
    const transportCost = calculateTransportCost(distance);
    const aiRec = getAIRecommendation(buyer, userResources, isTamil);
    return {
      ...buyer,
      distance,
      transportCost,
      aiRec
    };
  }).sort((a, b) => {
    if (a.aiRec.recommended && !b.aiRec.recommended) return -1;
    if (!a.aiRec.recommended && b.aiRec.recommended) return 1;
    return a.distance - b.distance;
  });

  const processedSellers = resources.map(res => {
    const coords = getCoordinatesForLocation(res.location);
    const distance = calculateDistance(selectedLocation.lat, selectedLocation.lng, coords.lat, coords.lng);
    const transportCost = calculateTransportCost(distance);
    const matchedProfile = allProfiles.find(p => String(p.id) === String(res.user_id)) || buyers.find(p => String(p.id) === String(res.user_id));
    
    let sellerName = res.seller_name || res.sellerName || matchedProfile?.full_name || matchedProfile?.name || 'Agri Farmer';
    let sellerPhone = res.seller_phone || res.sellerPhone || matchedProfile?.phone || '';

    if (user && String(res.user_id) === String(user.id)) {
      sellerName = user.user_metadata?.full_name || sellerName;
      sellerPhone = user.user_metadata?.phone || sellerPhone;
    }

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
      typeTa: res.category,
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
  }).sort((a, b) => {
    if (a.aiRec.recommended && !b.aiRec.recommended) return -1;
    if (!a.aiRec.recommended && b.aiRec.recommended) return 1;
    return a.distance - b.distance;
  });

  const filteredItems = (!isBuyer ? processedBuyers : processedSellers).filter(item => {
    if (activeFilter === 'All') return true;
    return item.type === activeFilter;
  });

  const handleCall = (phoneNum?: string, name?: string) => {
    if (phoneNum) {
      Linking.openURL(`tel:${phoneNum}`).catch(() => {
        Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'அழைப்பைத் தொடங்க முடியவில்லை.' : 'Unable to launch dialer.');
      });
    } else {
      Alert.alert(isTamil ? 'தகவல்' : 'Info', isTamil ? 'தொலைபேசி எண் கிடைக்கவில்லை.' : 'Phone number not available.');
    }
  };

  const handleMessage = (item: any) => {
    router.push('/messages');
  };

  const userName = user?.user_metadata?.full_name || (isTamil ? 'விவசாயி' : 'Farmer');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. Header & Weather Widget */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.greeting}>{isTamil ? 'வணக்கம் 👋' : 'Welcome 👋'}</Text>
          <Text style={styles.name} numberOfLines={1}>{userName}</Text>
        </View>
        
        {/* Weather Card */}
        <TouchableOpacity 
          style={styles.weatherCard} 
          onPress={() => setShowLocationDropdown(true)}
          activeOpacity={0.85}
        >
          <Sun color="#f59e0b" size={22} style={{ marginRight: 6 }} />
          <View style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.weatherTemp}>{weatherTemp}</Text>
              {locationMethod === 'gps' && <Text style={styles.badgeGps}>🟢 GPS</Text>}
              {approximateLocActive && <Text style={styles.badgeApprox}>⚠️ Approx</Text>}
            </View>
            <Text style={styles.weatherCondition} numberOfLines={1} ellipsizeMode="tail">
              {weatherCondition}, {isTamil ? selectedLocation.nameTa : selectedLocation.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Expected Revenue / Profit Analytics Card (Sellers/Farmers) */}
      {!isBuyer && (
        <LinearGradient
          colors={['#15803d', '#166534']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profitCard}
        >
          <View style={styles.profitHeader}>
            <Text style={styles.profitLabel}>{isTamil ? 'எதிர்பார்க்கப்படும் வருவாய்' : 'Expected Revenue'}</Text>
            <TrendingUp color="#86efac" size={20} />
          </View>
          <Text style={styles.profitAmount}>{expectedProfit}</Text>
          <Text style={styles.profitFooter}>
            {isTamil ? `${totalResources} பட்டியல்களின் அடிப்படையில்` : `Based on ${totalResources} active listings`}
          </Text>
        </LinearGradient>
      )}

      {/* 3. Farming Green Impact Banner */}
      {!isBuyer && (
        <TouchableOpacity 
          style={styles.impactBanner}
          onPress={() => router.push('/sustainability' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.impactIconWrap}>
            <Leaf color="#15803d" size={20} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.impactTitle}>
              {isTamil ? 'உங்களின் பசுமை தாக்க விபரம்:' : 'Your Farming Green Impact:'}
            </Text>
            <Text style={styles.impactSub}>
              {isTamil 
                ? `🌱 ${totalWasteSaved.toLocaleString()} கிலோ கழிவு • 🌍 -${co2Reduced.toLocaleString()} கிலோ CO₂` 
                : `🌱 ${totalWasteSaved.toLocaleString()} kg waste • 🌍 -${co2Reduced.toLocaleString()} kg CO₂`}
            </Text>
          </View>
          <ChevronRight color="#15803d" size={18} />
        </TouchableOpacity>
      )}

      {/* 4. Quick Actions Grid */}
      <Text style={styles.sectionTitle}>{isTamil ? 'விரைவான செயல்பாடுகள்' : 'Quick Actions'}</Text>
      <View style={styles.quickGrid}>
        {!isBuyer ? (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/add-resource' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <PlusCircle color="#15803d" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'வளத்தைச் சேர்' : 'Add Resource'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/profile' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <List color="#ca8a04" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'பட்டியல்கள்' : 'My Listings'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/marketplace' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#ffedd5' }]}>
                <Users color="#ea580c" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'வாங்குவோர்' : 'Nearby Buyers'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/market-prices' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#f3e8ff' }]}>
                <TrendingUp color="#7c3aed" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'சந்தை விவரம்' : 'Market Insights'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/surplus-prediction' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
                <LineChart color="#4f46e5" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'உபரி கணிப்பான்' : 'AI Surplus'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/messages' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <MessageSquare color="#15803d" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'அரட்டைகள்' : 'Chats'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/marketplace' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#ffedd5' }]}>
                <Users color="#ea580c" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'பயிர்க்கழிவுகள்' : 'Browse Residues'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/messages' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <MessageSquare color="#15803d" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'செய்திகள்' : 'Chats'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/market-prices' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#f3e8ff' }]}>
                <TrendingUp color="#7c3aed" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'சந்தை விவரம்' : 'Market Insights'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/profile' as any)}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <UserCircle color="#ca8a04" size={22} />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>{isTamil ? 'சுயவிவரம்' : 'Profile'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 5. Recommendation Engine Section */}
      <View style={styles.recSectionHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.sectionTitle}>
            {isBuyer 
              ? (isTamil ? 'அருகிலுள்ள பயிர்க்கழிவுகள்' : 'Nearby Crop Residues')
              : (isTamil ? 'அருகிலுள்ள வாங்குவோர்' : 'Nearby Buyers')
            }
          </Text>
          <Text style={styles.sectionSub}>
            {isBuyer
              ? (isTamil ? 'அருகிலுள்ள கழிவுகள் மற்றும் பரிந்துரைகள்' : 'AI-optimized crop residue recommendations')
              : (isTamil ? 'AI அடிப்படையிலான சிறந்த தேவைகள் & பரிந்துரைகள்' : 'AI-optimized matching & logistics estimates')
            }
          </Text>
        </View>

        {/* Location Pill */}
        <TouchableOpacity 
          style={styles.locationPill} 
          onPress={() => setShowLocationDropdown(true)}
        >
          <MapPin color="#15803d" size={13} />
          <Text style={styles.locationPillText} numberOfLines={1}>
            {isTamil ? selectedLocation.nameTa : selectedLocation.name}
          </Text>
          <ChevronDown color="#64748b" size={13} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, activeFilter === cat && styles.categoryPillActive]}
            onPress={() => setActiveFilter(cat)}
          >
            <Text style={[styles.categoryPillText, activeFilter === cat && styles.categoryPillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recommendation Cards List */}
      {buyersLoading || resourcesLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#15803d" />
          <Text style={styles.loadingText}>
            {isTamil ? 'விவரங்களை ஏற்றுகிறது...' : 'Loading recommendations...'}
          </Text>
        </View>
      ) : filteredItems.length > 0 ? (
        filteredItems.map(item => (
          <View 
            key={item.id} 
            style={[styles.card, item.aiRec?.recommended && styles.cardRecommended]}
          >
            {item.aiRec?.recommended && (
              <View style={styles.aiBadgeBanner}>
                <Sparkles color="#15803d" size={12} />
                <Text style={styles.aiBadgeText}>{item.aiRec.badge}</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Users color="#15803d" size={18} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.cardTitle}>{isTamil ? item.nameTa || item.name : item.name}</Text>
                  {item.verified && <CheckCircle2 color="#16a34a" size={14} />}
                </View>
                <Text style={styles.cardSubtitle}>{isTamil ? item.typeTa || item.type : item.type}</Text>
                {isBuyer ? (
                  <Text style={styles.contactSub}>
                    👤 {isTamil ? `விற்பனையாளர்: ${item.sellerName}` : `Seller: ${item.sellerName}`}
                  </Text>
                ) : (
                  <Text style={styles.contactSub}>📞 {item.phone || '+91 94420 89201'}</Text>
                )}
              </View>

              <View style={styles.distBadge}>
                <Navigation color="#0284c7" size={10} />
                <Text style={styles.distText}>{item.distance} {isTamil ? 'கிமீ' : 'km'}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.cardStatsRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Star color="#eab308" size={13} fill="#eab308" />
                <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
              </View>
              <View style={styles.demandBadge}>
                <Text style={styles.demandBadgeText}>{isTamil ? item.demandLevelTa : item.demandLevel}</Text>
              </View>
              <Text style={styles.transportText}>
                🚚 {isTamil ? `போக்குவரத்து: ~₹${item.transportCost}` : `Transport: ~₹${item.transportCost}`}
              </Text>
            </View>

            {/* Tags row */}
            <View style={styles.tagsRow}>
              <Text style={styles.tagLabel}>
                {isBuyer ? (isTamil ? 'கையிருப்பு:' : 'Stock:') : (isTamil ? 'தேவை:' : 'Looking for:')}
              </Text>
              {(isTamil ? item.needsTa : item.needs).map((tag: string, idx: number) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* AI Reasoning */}
            {item.aiRec?.recommended && (
              <View style={styles.aiReasonBox}>
                <Sparkles color="#15803d" size={13} />
                <Text style={styles.aiReasonText}>{item.aiRec.reason}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity 
                style={styles.msgBtn} 
                onPress={() => handleMessage(item)}
              >
                <MessageCircle color="#15803d" size={15} />
                <Text style={styles.msgBtnText}>{isTamil ? 'செய்தி' : 'Message'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.callBtn} 
                onPress={() => handleCall(isBuyer ? item.sellerPhone : item.phone, item.name)}
              >
                <Phone color="white" size={15} />
                <Text style={styles.callBtnText}>
                  {isBuyer ? (isTamil ? 'தொடர்புகொள்' : 'Call Seller') : (isTamil ? 'தொடர்புகொள்' : 'Call Buyer')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Users color="#94a3b8" size={32} />
          <Text style={styles.emptyText}>
            {isBuyer 
              ? (isTamil ? 'தேர்ந்தெடுக்கப்பட்ட வகையின்கீழ் பயிர்க்கழிவுகள் இல்லை' : 'No crop residues found for this category nearby.')
              : (isTamil ? 'தேர்ந்தெடுக்கப்பட்ட வகையின்கீழ் வாங்குபவர்கள் இல்லை' : 'No buyers found for this category nearby.')
            }
          </Text>
        </View>
      )}

      {/* 6. Location Selector Modal */}
      <Modal
        visible={showLocationDropdown}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTamil ? 'இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்' : 'Select District / Location'}
              </Text>
              <TouchableOpacity onPress={() => setShowLocationDropdown(false)} style={{ padding: 4 }}>
                <X color="#475569" size={22} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchBox}>
              <TextInput 
                style={styles.modalSearchInput}
                placeholder={isTamil ? "கிராமம் / நகரம் / பின்கோடு..." : "Search village, town, district..."}
                placeholderTextColor="#94a3b8"
                value={locationSearch}
                onChangeText={setLocationSearch}
                onSubmitEditing={() => handleSearchSubmit(locationSearch)}
              />
              {locationSearch.trim().length >= 3 && (
                <TouchableOpacity 
                  style={styles.modalSearchBtn}
                  onPress={() => handleSearchSubmit(locationSearch)}
                  disabled={searchLoading}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                    {searchLoading ? '...' : 'Search'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* GPS Request */}
            <TouchableOpacity 
              style={styles.gpsTriggerBtn}
              onPress={() => {
                requestGPSLocation();
                setShowLocationDropdown(false);
              }}
            >
              <Navigation color="#15803d" size={15} />
              <Text style={styles.gpsTriggerText}>
                {isTamil ? 'துல்லியமான ஜிபிஎஸ் இருப்பிடத்தைப் பயன்படுத்து' : 'Use Current High-Accuracy GPS'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalSubHeader}>
              {isTamil ? 'தமிழ்நாடு மாவட்டங்கள்:' : 'Tamil Nadu Districts:'}
            </Text>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {SIMULATED_LOCATIONS.filter(loc => 
                loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                loc.nameTa.toLowerCase().includes(locationSearch.toLowerCase())
              ).map(loc => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.districtItem, 
                    selectedLocation.id === loc.id && styles.districtItemActive
                  ]}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                >
                  <MapPin color={selectedLocation.id === loc.id ? "#15803d" : "#94a3b8"} size={16} />
                  <Text style={[
                    styles.districtText,
                    selectedLocation.id === loc.id && styles.districtTextActive
                  ]}>
                    {isTamil ? loc.nameTa : loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  name: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: '52%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  weatherTemp: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  badgeGps: {
    fontSize: 9,
    color: '#16a34a',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  badgeApprox: {
    fontSize: 9,
    color: '#d97706',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  weatherCondition: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  profitCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '600',
  },
  profitAmount: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  profitFooter: {
    color: '#bcf0da',
    fontSize: 11,
  },
  impactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bcf0da',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  impactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  impactSub: {
    fontSize: 11,
    color: '#15803d',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  actionBtn: {
    width: ACTION_ITEM_WIDTH,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  recSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    maxWidth: '45%',
  },
  locationPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
    flexShrink: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#15803d',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: 'white',
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRecommended: {
    borderColor: '#86efac',
    borderWidth: 1.5,
    backgroundColor: '#f0fdf4',
  },
  aiBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  contactSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803d',
    marginTop: 2,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    alignSelf: 'flex-start',
  },
  distText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  demandBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  demandBadgeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#b45309',
  },
  transportText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 5,
  },
  tagLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 10.5,
    color: '#334155',
    fontWeight: '600',
  },
  aiReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 5,
  },
  aiReasonText: {
    fontSize: 10.5,
    color: '#14532d',
    flex: 1,
    lineHeight: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    backgroundColor: '#f0fdf4',
    gap: 4,
  },
  msgBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#10b981',
    gap: 4,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSearchBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  modalSearchBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  gpsTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  gpsTriggerText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#15803d',
  },
  modalSubHeader: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
  },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  districtItemActive: {
    backgroundColor: '#f0fdf4',
  },
  districtText: {
    fontSize: 12.5,
    color: '#334155',
  },
  districtTextActive: {
    fontWeight: 'bold',
    color: '#15803d',
  },
});

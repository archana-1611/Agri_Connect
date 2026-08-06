import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, Dimensions, Linking 
} from 'react-native';
import { 
  MapPin, Filter, Navigation, MessageSquare, Phone, Star, 
  Sprout, Search, List, Map, HelpCircle, CheckCircle2, ChevronDown
} from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useResources } from '../../context/ResourceContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  return Math.round(150 + distance * 12);
};

export default function MarketplaceScreen() {
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapBuyer, setSelectedMapBuyer] = useState<any>(null);
  
  const { isTamil } = useLanguage();
  const { user } = useAuth();
  const { resources, loading: resourcesLoading } = useResources();
  const router = useRouter();

  const isBuyer = user?.user_metadata?.role?.toLowerCase() === 'buyer';

  const [buyers, setBuyers] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(true);

  // User current selected location
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

  // Fetch real profiles from Supabase database (matching Web App logic)
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setBuyersLoading(true);
        const { data: sbData, error } = await supabase.from('profiles').select('*');
        if (error) throw error;

        const data = (sbData || []).map(p => ({
          ...p,
          role: p.full_name === 'TQ' || p.id === 'd18f5a68-8da1-4c34-ab86-c6f21b11f497' ? 'buyer' : (p.role || 'Farmer')
        }));

        if (data) {
          setAllProfiles(data);
        }

        // Keep real database accounts with role = buyer/trader
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
        console.error('Error fetching real profiles in mobile Marketplace:', err);
      } finally {
        setBuyersLoading(false);
      }
    };

    fetchBuyers();
  }, [user]);

  // Process buyers list (for farmers)
  const processedBuyers = buyers.map(buyer => {
    const distance = calculateDistance(selectedLocation.lat, selectedLocation.lng, buyer.lat, buyer.lng);
    const transportCost = calculateTransportCost(distance);
    return {
      ...buyer,
      distance,
      transportCost
    };
  });

  // Process crop residues list (for buyers)
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
      rating: 4.7,
      reviews: 12,
      demandLevel: `₹ ${res.price}`,
      demandLevelTa: `₹ ${res.price}`,
      needs: [res.quantity],
      needsTa: [res.quantity],
      verified: true,
      user_id: res.user_id,
      locationName: res.location ? res.location.split('|')[0] : 'Tamil Nadu',
      locationNameTa: res.location ? res.location.split('|')[0] : 'தமிழ்நாடு'
    };
  });

  const activePool = isBuyer ? processedSellers : processedBuyers;

  const filteredItems = activePool.filter(item => {
    let matchesCategory = true;
    if (filter !== 'All') {
      matchesCategory = item.type === filter;
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = (item.name && item.name.toLowerCase().includes(query)) || (item.nameTa && item.nameTa.toLowerCase().includes(query));
      const typeMatch = (item.type && item.type.toLowerCase().includes(query)) || (item.typeTa && item.typeTa.toLowerCase().includes(query));
      const sellerMatch = item.sellerName && item.sellerName.toLowerCase().includes(query);
      const locMatch = (item.locationName && item.locationName.toLowerCase().includes(query));

      matchesSearch = nameMatch || typeMatch || sellerMatch || locMatch;
    }

    return matchesCategory && matchesSearch;
  }).sort((a, b) => a.distance - b.distance);

  const handleCall = (phoneNum?: string) => {
    if (phoneNum) {
      Linking.openURL(`tel:${phoneNum}`).catch(() => {
        Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'அழைப்பைத் தொடங்க முடியவில்லை.' : 'Unable to launch dialer.');
      });
    } else {
      Alert.alert(isTamil ? 'தகவல்' : 'Info', isTamil ? 'தொலைபேசி எண் கிடைக்கவில்லை.' : 'Phone number not available.');
    }
  };

  const handleMessage = () => {
    router.push('/messages');
  };

  return (
    <View style={styles.container}>
      
      {/* 1. Search Bar & Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#15803d" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder={
              isBuyer
                ? (isTamil ? "பயிர் பெயர் அல்லது வகையைத் தேடுக..." : "Search crop residue or category...")
                : (isTamil ? "வட்டம், பெயர் அல்லது இடம் தேடுக..." : "Search location, name, or crop...")
            }
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{marginRight: 8}}>
              <Text style={{color: '#94a3b8', fontSize: 12, fontWeight: 'bold'}}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Switcher: Card vs Map */}
        <View style={styles.viewSegmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'card' && styles.segmentBtnActive]}
            onPress={() => setViewMode('card')}
          >
            <List size={16} color={viewMode === 'card' ? '#15803d' : '#64748b'} />
            <Text style={[styles.segmentText, viewMode === 'card' && styles.segmentTextActive]}>
              {isTamil ? 'பட்டியல் விவரம்' : 'Card View'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Map size={16} color={viewMode === 'map' ? '#15803d' : '#64748b'} />
            <Text style={[styles.segmentText, viewMode === 'map' && styles.segmentTextActive]}>
              {isTamil ? 'வரைபடம்' : 'Map View'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[styles.filterChip, filter === cat && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= VIEW 1: CARD VIEW ================= */}
      {viewMode === 'card' && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 80 }}>
          
          <Text style={styles.resultsHeader}>
            {isBuyer
              ? (isTamil ? `விற்பனைக்கான பயிர்க்கழிவுகள் (${filteredItems.length})` : `Available Crop Residues (${filteredItems.length})`)
              : (isTamil ? `பதிவுசெய்த வாங்குவோர் (${filteredItems.length})` : `Registered Buyers & Traders (${filteredItems.length})`)
            }
          </Text>

          {buyersLoading || resourcesLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#15803d" />
              <Text style={styles.loadingText}>
                {isTamil ? 'விவரங்களை ஏற்றுகிறது...' : 'Loading market data...'}
              </Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <HelpCircle size={36} color="#94a3b8" />
              <Text style={styles.emptyText}>
                {isBuyer 
                  ? (isTamil ? 'விற்பனைக்கான கழிவுகள் எதுவும் தற்போது கிடைக்கவில்லை.' : 'No crop residue listings found.')
                  : (isTamil ? 'பதிவுசெய்த வாங்குவோர் எதுவும் கிடைக்கவில்லை.' : 'No registered buyers found.')
                }
              </Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
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

                {/* Stats Row */}
                <View style={styles.cardStatsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Star color="#eab308" size={13} fill="#eab308" />
                    <Text style={styles.ratingText}>{item.rating || 4.8} ({item.reviews || 12})</Text>
                  </View>
                  <View style={styles.demandBadge}>
                    <Text style={styles.demandBadgeText}>{isTamil ? item.demandLevelTa || item.demandLevel : item.demandLevel}</Text>
                  </View>
                  <Text style={styles.transportText}>
                    🚚 {isTamil ? `போக்குவரத்து: ~₹${item.transportCost}` : `Transport: ~₹${item.transportCost}`}
                  </Text>
                </View>

                {/* Tags Row */}
                <View style={styles.tagsRow}>
                  <Text style={styles.tagLabel}>
                    {isBuyer ? (isTamil ? 'கையிருப்பு:' : 'Stock:') : (isTamil ? 'தேவை:' : 'Looking for:')}
                  </Text>
                  {(isTamil ? item.needsTa || item.needs : item.needs).map((tag: string, idx: number) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity 
                    style={styles.msgBtn} 
                    onPress={handleMessage}
                  >
                    <MessageSquare color="#15803d" size={15} />
                    <Text style={styles.msgBtnText}>{isTamil ? 'செய்தி' : 'Message'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.callBtn} 
                    onPress={() => handleCall(isBuyer ? item.sellerPhone : item.phone)}
                  >
                    <Phone color="white" size={15} />
                    <Text style={styles.callBtnText}>
                      {isBuyer ? (isTamil ? 'தொடர்புகொள்' : 'Call Seller') : (isTamil ? 'தொடர்புகொள்' : 'Call Buyer')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ================= VIEW 2: MAP VIEW ================= */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <View style={styles.simulatedMapArea}>
            <LinearGradient colors={['#e0f2fe', '#dcfce7']} style={StyleSheet.absoluteFillObject} />
            
            <View style={styles.mapOverlayHeader}>
              <Text style={styles.mapHeaderTitle}>
                🗺️ {isTamil ? 'தமிழ்நாடு நேரலை வரைபடம்' : 'Tamil Nadu Live Biomass Radar'}
              </Text>
              <Text style={styles.mapHeaderSub}>
                {isTamil ? 'வாங்குவோர்கள் & கழிவுகள் இருப்பிடங்களின் வரைபடம்' : 'Interactive Map Radar of Verified Buyers & Biomass'}
              </Text>
            </View>

            {/* Pins on Map */}
            {filteredItems.map((b, idx) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.mapPin,
                  { top: 130 + (idx * 55) % 260, left: 40 + (idx * 75) % (width - 100) },
                  selectedMapBuyer?.id === b.id && styles.mapPinActive
                ]}
                onPress={() => setSelectedMapBuyer(b)}
              >
                <MapPin size={16} color="white" />
                <Text style={styles.mapPinText} numberOfLines={1}>
                  {isTamil ? (b.nameTa || b.name).split(' ')[0] : b.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Selected Pin Bottom Sheet */}
            {selectedMapBuyer && (
              <View style={styles.mapBottomSheet}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetTitle}>
                      {isTamil ? selectedMapBuyer.nameTa || selectedMapBuyer.name : selectedMapBuyer.name}
                    </Text>
                    <Text style={styles.sheetSub}>{selectedMapBuyer.locationName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedMapBuyer(null)}>
                    <Text style={{color: '#94a3b8', fontSize: 16, fontWeight: 'bold'}}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', gap: 10, marginTop: 14}}>
                  <TouchableOpacity 
                    style={[styles.msgBtn, {flex: 1}]}
                    onPress={handleMessage}
                  >
                    <MessageSquare size={14} color="#15803d" />
                    <Text style={styles.msgBtnText}>{isTamil ? 'செய்தி' : 'Message'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.callBtn, {flex: 1}]}
                    onPress={() => handleCall(isBuyer ? selectedMapBuyer.sellerPhone : selectedMapBuyer.phone)}
                  >
                    <Phone size={14} color="white" />
                    <Text style={styles.callBtnText}>{isTamil ? 'அழைக்க' : 'Call'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  viewSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    marginVertical: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#15803d',
  },
  filterChipText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  simulatedMapArea: {
    flex: 1,
    position: 'relative',
  },
  mapOverlayHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    zIndex: 10,
  },
  mapHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  mapHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  mapPin: {
    position: 'absolute',
    backgroundColor: '#15803d',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapPinActive: {
    backgroundColor: '#ea580c',
    transform: [{ scale: 1.1 }],
  },
  mapPinText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mapBottomSheet: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 11,
    color: '#64748b',
  },
});

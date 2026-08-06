import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Alert, Modal, TextInput, ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useResources } from '../../context/ResourceContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { 
  LogOut, Package, Eye, MessageSquare, BarChart2, Edit2, 
  Trash2, CheckCircle, ShieldCheck, UserCircle, MapPin, X, 
  Sparkles, PlusCircle, ArrowRight 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const TAMILNADU_DISTRICTS = [
  'Coimbatore', 'Chennai', 'Salem', 'Erode', 'Madurai', 'Tiruchirappalli', 
  'Thanjavur', 'Tiruppur', 'Dindigul', 'Vellore', 'Thoothukudi', 'Tirunelveli', 
  'Kanyakumari', 'Dharmapuri', 'Krishnagiri', 'Namakkal', 'Karur', 'Theni', 
  'Nilgiris', 'Pudukkottai', 'Ramanathapuram', 'Sivaganga', 'Virudhunagar', 
  'Cuddalore', 'Nagapattinam', 'Tiruvarur', 'Viluppuram', 'Tiruvannamalai', 
  'Kanchipuram', 'Tiruvallur', 'Perambalur', 'Ariyalur', 'Tenkasi', 
  'Chengalpattu', 'Ranipet', 'Tirupathur', 'Kallakurichi', 'Mayiladuthurai'
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { resources, deleteResource } = useResources();
  const { isTamil } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Upgrade Form States
  const [farmName, setFarmName] = useState('');
  const [farmArea, setFarmArea] = useState('');

  // Edit Profile Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDistrict, setEditDistrict] = useState('');

  const rawRole = user?.user_metadata?.role || 'Farmer';
  const roleLower = String(rawRole).toLowerCase().trim();
  const isBuyer = roleLower === 'buyer';
  
  const profileName = user?.user_metadata?.full_name || user?.email || (isTamil ? 'பயனர்' : 'User');
  const profilePhone = user?.user_metadata?.phone || '+91 94420 89201';
  const profileLocation = user?.user_metadata?.district || user?.user_metadata?.location?.split('|')[0] || 'Coimbatore';

  const userListings = resources.filter(r => String(r.user_id) === String(user?.id));

  useEffect(() => {
    if (user) {
      setEditName(profileName);
      setEditPhone(profilePhone);
      setEditDistrict(profileLocation);
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      isTamil ? 'வெளியேறு' : 'Logout',
      isTamil ? 'கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to log out?',
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        { text: isTamil ? 'வெளியேறு' : 'Logout', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  const handleDelete = async (id: string | number) => {
    Alert.alert(
      isTamil ? 'நீக்கு' : 'Delete Listing',
      isTamil ? 'இந்த விற்பனைப் பட்டியலை நீக்க விரும்புகிறீர்களா?' : 'Delete this biomass listing?',
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        { 
          text: isTamil ? 'நீக்கு' : 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteResource(id);
              Alert.alert(isTamil ? 'வெற்றி' : 'Success', isTamil ? 'பட்டியல் நீக்கப்பட்டது' : 'Listing removed');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleUpgradeToSeller = async () => {
    if (!farmName.trim() || !farmArea.trim()) {
      Alert.alert(
        isTamil ? 'பிழை' : 'Error', 
        isTamil ? 'தயவுசெய்து பண்ணை பெயர் மற்றும் பரப்பளவை உள்ளிடவும்.' : 'Please enter farm name and total farm area.'
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          role: 'Farmer',
          farmName: farmName.trim(),
          farmArea: farmArea.trim()
        }
      });

      if (authError) throw authError;

      // 2. Upsert to Supabase profiles table
      await supabase.from('profiles').upsert({
        id: user?.id,
        full_name: profileName,
        phone: profilePhone,
        location: profileLocation,
        role: 'Farmer',
        farm_name: farmName.trim(),
        farm_area: farmArea.trim(),
        updated_at: new Date().toISOString()
      });

      setShowUpgradeModal(false);
      Alert.alert(
        isTamil ? '🎉 வாழ்த்துகள்!' : '🎉 Congratulations!',
        isTamil 
          ? 'உங்கள் கணக்கு வெற்றிகரமாக விற்பனையாளராக (Seller/Farmer) மாற்றப்பட்டது! இனி உங்கள் பயிர்க்கழிவுகளை விற்கலாம்.' 
          : 'Your account has been upgraded to Seller (Farmer)! You can now list and sell crop residues.'
      );
    } catch (err: any) {
      console.error('Upgrade to Seller error:', err);
      Alert.alert(isTamil ? 'பிழை' : 'Upgrade Error', err.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          full_name: editName.trim(),
          phone: editPhone.trim(),
          district: editDistrict,
          location: editDistrict
        }
      });

      if (authError) throw authError;

      await supabase.from('profiles').upsert({
        id: user?.id,
        full_name: editName.trim(),
        phone: editPhone.trim(),
        location: editDistrict,
        updated_at: new Date().toISOString()
      });

      setShowEditModal(false);
      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success',
        isTamil ? 'சுயவிவர விவரங்கள் புதுப்பிக்கப்பட்டன!' : 'Profile details updated successfully!'
      );
    } catch (err: any) {
      Alert.alert(isTamil ? 'பிழை' : 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Summary Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profileName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profileName}</Text>
        
        <View style={styles.roleRow}>
          <View style={[styles.roleBadge, isBuyer ? styles.roleBuyer : styles.roleFarmer]}>
            <Text style={[styles.roleBadgeText, isBuyer ? styles.roleBuyerText : styles.roleFarmerText]}>
              {isBuyer ? (isTamil ? 'வாங்குபவர்' : 'Buyer Account') : (isTamil ? 'விற்பனையாளர் (விவசாயி)' : 'Seller (Farmer)')}
            </Text>
          </View>
          <View style={styles.locationBadge}>
            <MapPin size={12} color="#15803d" />
            <Text style={styles.locationBadgeText}>{profileLocation}</Text>
          </View>
        </View>

        {/* Upgrade to Seller Banner / Button for Buyer accounts */}
        {isBuyer && (
          <TouchableOpacity 
            style={styles.upgradeBanner}
            onPress={() => setShowUpgradeModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#15803d', '#166534']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeGradient}
            >
              <View style={styles.upgradeLeft}>
                <Sparkles color="#86efac" size={22} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.upgradeTitle}>
                    {isTamil ? 'விற்பனையாளராக மாறுங்கள்' : 'Upgrade to Seller Account'}
                  </Text>
                  <Text style={styles.upgradeSub}>
                    {isTamil ? 'பயிர்க்கழிவுகளைப் பட்டியலிட்டு விற்க விருப்பமா?' : 'Want to list & sell agricultural biomass?'}
                  </Text>
                </View>
              </View>
              <ArrowRight color="white" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditModal(true)}>
            <Edit2 color="#475569" size={16} />
            <Text style={styles.editBtnText}>{isTamil ? 'திருத்து' : 'Edit Profile'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color="#ef4444" size={16} />
            <Text style={styles.logoutBtnText}>{isTamil ? 'வெளியேறு' : 'Logout'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Seller Listings Section */}
      {!isBuyer && (
        <View style={{ marginTop: 6 }}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Package color="#15803d" size={22} />
              <Text style={styles.sectionTitle}>
                {isTamil ? `என்னுடைய பட்டியல்கள் (${userListings.length})` : `My Listings (${userListings.length})`}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addResourceBtn} 
              onPress={() => router.push('/(tabs)/add-resource' as any)}
            >
              <PlusCircle color="white" size={14} />
              <Text style={styles.addResourceBtnText}>{isTamil ? 'சேர்க்க' : 'Add New'}</Text>
            </TouchableOpacity>
          </View>

          {userListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Package color="#94a3b8" size={36} />
              <Text style={styles.emptyText}>
                {isTamil ? 'நீங்கள் இன்னும் எந்த பயிர்க்கழிவையும் பட்டியலிடவில்லை.' : "You haven't listed any agricultural biomass yet."}
              </Text>
              <TouchableOpacity 
                style={styles.emptyAddBtn}
                onPress={() => router.push('/(tabs)/add-resource' as any)}
              >
                <Text style={styles.emptyAddBtnText}>{isTamil ? 'வளத்தைச் சேர்க்கவும்' : 'List Crop Residue'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userListings.map(listing => (
              <View key={listing.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{isTamil ? 'விற்பனைக்கு உள்ளது' : 'Available'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(listing.id)}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  <Image 
                    source={{ uri: listing.image_url || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=200' }} 
                    style={styles.cardImage} 
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{listing.title}</Text>
                    <Text style={styles.cardPrice}>₹{listing.price} • {listing.quantity}</Text>
                    <Text style={styles.cardCategory}>{listing.category}</Text>
                  </View>
                </View>

                <View style={styles.analytics}>
                  <View style={styles.analyticItem}>
                    <MessageSquare color="#15803d" size={14} />
                    <Text style={[styles.analyticText, {color: '#15803d', fontWeight: 'bold'}]}>
                      {isTamil ? '3 விசாரணைகள்' : '3 Inquiries'}
                    </Text>
                  </View>
                  <View style={styles.analyticItem}>
                    <BarChart2 color="#d97706" size={14} />
                    <Text style={[styles.analyticText, {color: '#d97706', fontWeight: 'bold'}]}>
                      {isTamil ? 'அதிக தேவை' : 'High Demand'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 3. MODAL: UPGRADE TO SELLER ACCOUNT */}
      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sparkles color="#15803d" size={20} />
                <Text style={styles.modalTitle}>
                  {isTamil ? 'விற்பனையாளர் கணக்கிற்கு மாற்றவும்' : 'Upgrade to Seller Account'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
                <X color="#475569" size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {isTamil 
                ? 'விவசாய கழிவுகளை விற்க உங்கள் கணக்கை விற்பனையாளராக (Farmer/Seller) மாற்றவும். கீழேயுள்ள பண்ணை விவரங்களை வழங்கவும்.'
                : 'Upgrade your account to list and sell agricultural residues. Please provide your farm details below.'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{isTamil ? 'பண்ணை / வணிக பெயர் *' : 'Farm / Business Name *'}</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder={isTamil ? "எ.கா: பசுமைப் பண்ணை" : "e.g., Green Valley Farms"}
                placeholderTextColor="#94a3b8"
                value={farmName}
                onChangeText={setFarmName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{isTamil ? 'மொத்த பண்ணை பரப்பளவு (ஏக்கரில்) *' : 'Total Farm Area (in Acres) *'}</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder={isTamil ? "எ.கா: 5.5" : "e.g., 5.5"}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={farmArea}
                onChangeText={setFarmArea}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]}
                onPress={() => setShowUpgradeModal(false)}
                disabled={loading}
              >
                <Text style={[styles.modalBtnText, { color: '#475569' }]}>
                  {isTamil ? 'ரத்து செய்' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#15803d', flex: 2 }]}
                onPress={handleUpgradeToSeller}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: 'white' }]}>
                    {isTamil ? 'விற்பனையாளராக மாறு' : 'Complete Upgrade'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. MODAL: EDIT PROFILE */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTamil ? 'சுயவிவரத்தை திருத்து' : 'Edit Profile'}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X color="#475569" size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{isTamil ? 'முழு பெயர்' : 'Full Name'}</Text>
              <TextInput 
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{isTamil ? 'மொபைல் எண்' : 'Mobile Number'}</Text>
              <TextInput 
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{isTamil ? 'மாவட்டம்' : 'District'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 6 }}>
                {TAMILNADU_DISTRICTS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.distChip, editDistrict === d && styles.distChipActive]}
                    onPress={() => setEditDistrict(d)}
                  >
                    <Text style={[styles.distChipText, editDistrict === d && styles.distChipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]}
                onPress={() => setShowEditModal(false)}
                disabled={loading}
              >
                <Text style={[styles.modalBtnText, { color: '#475569' }]}>
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#15803d', flex: 2 }]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: 'white' }]}>
                    {isTamil ? 'சேமி' : 'Save Changes'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#15803d' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBuyer: { backgroundColor: '#e0f2fe' },
  roleFarmer: { backgroundColor: '#dcfce7' },
  roleBadgeText: { fontSize: 11.5, fontWeight: 'bold' },
  roleBuyerText: { color: '#0369a1' },
  roleFarmerText: { color: '#166534' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  locationBadgeText: { fontSize: 11.5, color: '#334155', fontWeight: '600' },
  upgradeBanner: { width: '100%', marginBottom: 16, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#15803d', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
  upgradeGradient: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upgradeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  upgradeTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
  upgradeSub: { fontSize: 11, color: '#dcfce7', marginTop: 1 },
  actionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 12, gap: 6 },
  editBtnText: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
  logoutBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', paddingVertical: 10, borderRadius: 12, gap: 6 },
  logoutBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  addResourceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, gap: 4 },
  addResourceBtnText: { color: 'white', fontWeight: 'bold', fontSize: 11.5 },
  emptyState: { backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#64748b', fontSize: 13, marginTop: 8, textAlign: 'center' },
  emptyAddBtn: { backgroundColor: '#dcfce7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 12 },
  emptyAddBtnText: { color: '#15803d', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#15803d', fontSize: 11, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardImage: { width: 70, height: 70, borderRadius: 10 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  cardPrice: { fontSize: 13, color: '#15803d', fontWeight: 'bold' },
  cardCategory: { fontSize: 11, color: '#64748b', marginTop: 2 },
  analytics: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  analyticItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  analyticText: { fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  modalDesc: { fontSize: 12, color: '#64748b', marginBottom: 14, lineHeight: 16 },
  formGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  modalInput: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0f172a' },
  modalBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flex: 1 },
  modalBtnText: { fontSize: 13, fontWeight: 'bold' },
  distChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#f1f5f9', marginRight: 8 },
  distChipActive: { backgroundColor: '#15803d' },
  distChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  distChipTextActive: { color: 'white', fontWeight: 'bold' },
});

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { 
  ShieldCheck, FileText, Lock, ArrowLeft, CheckCircle, Scale, Eye, AlertTriangle, UserCheck 
} from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export default function TermsScreen({ defaultTab }: { defaultTab?: 'terms' | 'privacy' }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const { isTamil } = useLanguage();

  const isPrivacyPath = pathname?.includes('privacy') || params?.tab === 'privacy' || defaultTab === 'privacy';

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(
    isPrivacyPath ? 'privacy' : 'terms'
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'terms' 
            ? (isTamil ? 'சேவை விதிமுறைகள்' : 'Terms of Service') 
            : (isTamil ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Banner */}
        <View style={styles.banner}>
          <ShieldCheck size={28} color="#15803d" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {isTamil ? 'சட்ட ரீதியான மற்றும் தனியுரிமை' : 'Legal & Compliance'}
            </Text>
            <Text style={styles.bannerSub}>
              {isTamil 
                ? 'அக்ரிகனெக்ட் தளத்தை பாதுகாப்பாக பயன்படுத்துவதற்கான விதிமுறைகள்.' 
                : 'AgriConnect User Terms & Data Protection Policy (2026)'}
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
            onPress={() => setActiveTab('terms')}
          >
            <FileText size={16} color={activeTab === 'terms' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
              {isTamil ? 'விதிமுறைகள்' : 'Terms'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
            onPress={() => setActiveTab('privacy')}
          >
            <Lock size={16} color={activeTab === 'privacy' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
              {isTamil ? 'தனியுரிமை' : 'Privacy'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Body Content */}
        {activeTab === 'terms' ? (
          <View style={styles.sectionList}>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Scale size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '1. கணக்கு மற்றும் பயன்பாடு' : '1. Account & Platform Terms'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'அக்ரிகனெக்ட் மொபைல் செயலியைப் பயன்படுத்தும்போது, துல்லியமான விவரங்கள் மற்றும் உண்மையான தொலைபேசி எண்ணை வழங்க வேண்டும்.' 
                  : 'Users must maintain accurate personal profile credentials and legitimate residue inventory parameters.'}
              </Text>
              <View style={styles.bulletItem}>
                <CheckCircle size={14} color="#15803d" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>
                  {isTamil ? 'விற்பனை செய்ய விரும்பும் பயிர்க்கழிவுகளின் தரம் மற்றும் அளவு சரியாக இருக்க வேண்டும்.' : 'Biomass inventory quantities and moisture levels must be accurately declared.'}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <CheckCircle size={14} color="#15803d" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>
                  {isTamil ? 'தவறான தகவல்கள் அல்லது போலி பட்டியல்கள் கண்டறியப்பட்டால் கணக்கு முடக்கப்படும்.' : 'Misleading listings or false contact info will result in immediate suspension.'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <UserCheck size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '2. விவசாயக் கழிவு வர்த்தகம்' : '2. Biomass & Crop Residue Trading'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'விவசாயிகள் மற்றும் தொழில்துறை வாங்குபவர்கள் நேரடியாக தொடர்பு கொண்டு பயிர்க்கழிவுகளை வர்த்தகம் செய்ய தளம் வழிவகுக்கிறது.' 
                  : 'AgriConnect connects sellers directly with industrial biopower and manufacturing buyers.'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <AlertTriangle size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '3. பொறுப்பு வழிகாட்டுதல்' : '3. Limitation of Liability'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'வானிலை மாறுபாடுகள் மற்றும் போக்குவரத்து தாமதங்களுக்கு தளம் நேரடியாக பொறுப்பேற்காது.' 
                  : 'Market estimates and prices are calculated dynamically. Weather delays and transport disruptions are handled per agreement.'}
              </Text>
            </View>

          </View>
        ) : (
          <View style={styles.sectionList}>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Eye size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '1. சேகரிக்கப்படும் தகவல்கள்' : '1. Collected Information'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'உங்கள் பெயர், தொலைபேசி எண், மாவட்டம் மற்றும் இருப்பிட விவரங்கள் சேகரிக்கப்படுகின்றன.' 
                  : 'We strictly store registration info including name, phone number, district, and listing locations.'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Lock size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '2. தரவு பாதுகாப்பு' : '2. Data Security & Encryption'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'உங்கள் தனிப்பட்ட விவரங்கள் மூன்றாம் நபர்களுக்கு விற்கப்படாது.' 
                  : 'We encrypt user data and do not sell information to third-party ad networks.'}
              </Text>
              <View style={styles.bulletItem}>
                <CheckCircle size={14} color="#15803d" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>
                  {isTamil ? 'தொலைபேசி எண் சரிபார்க்கப்பட்ட பயனர்களுக்கு மட்டுமே காட்டப்படும்.' : 'Phone numbers are shared only with confirmed buyers/sellers for logistics.'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ShieldCheck size={20} color="#15803d" />
                <Text style={styles.cardTitle}>
                  {isTamil ? '3. ஆதரவு தொடர்பு' : '3. Support Contact'}
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                {isTamil 
                  ? 'கொள்கை தொடர்பான கேள்விகளுக்கு தொடர்பு கொள்ளவும்: support@agriconnect.com' 
                  : 'Reach out to support@agriconnect.com for data privacy queries.'}
              </Text>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#166534' },
  bannerSub: { fontSize: 12, color: '#15803d', marginTop: 2 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#15803d',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sectionList: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#475569',
  },
});

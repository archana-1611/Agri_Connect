import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Landmark, ShieldCheck } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function MarketPricesScreen() {
  const { isTamil } = useLanguage();

  const marketData = [
    { name: isTamil ? 'நெல் (Paddy)' : 'Paddy (Grade A)', price: '₹ 2,300 / Quintal', trend: 'up', change: '+2.5%' },
    { name: isTamil ? 'தேங்காய் (Coconut)' : 'Coconut', price: '₹ 32 / Piece', trend: 'down', change: '-1.2%' },
    { name: isTamil ? 'கரும்பு (Sugarcane)' : 'Sugarcane', price: '₹ 3,400 / Tonne', trend: 'up', change: '+0.5%' },
    { name: isTamil ? 'சோளம் (Maize)' : 'Maize', price: '₹ 2,100 / Quintal', trend: 'up', change: '+1.8%' },
  ];

  const schemes = [
    { title: isTamil ? 'PM-KISAN திட்டம்' : 'PM-KISAN Scheme', desc: isTamil ? 'ஆண்டுக்கு ₹6000 வருமான ஆதரவு.' : '₹6000 per year income support.' },
    { title: isTamil ? 'பயிர் காப்பீடு' : 'Crop Insurance (PMFBY)', desc: isTamil ? 'இயற்கை பேரிடர் இழப்புகளுக்கான காப்பீடு.' : 'Insurance for crop loss due to natural calamities.' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: isTamil ? 'சந்தை விலை & திட்டங்கள்' : 'Market & Schemes' }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isTamil ? 'உழவர் சந்தை நிலவரம்' : 'Uzhavar Sandhai Rates'}</Text>
        <Text style={styles.headerSubtitle}>{isTamil ? 'கோயம்புத்தூர் மாவட்டம் - இன்றைய விலை' : 'Coimbatore District - Today\'s Rates'}</Text>
      </View>

      <View style={styles.content}>
        {/* Market Trends Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp color="#15803d" size={20} />
            <Text style={styles.cardTitle}>{isTamil ? 'பயிர் விலை நிலவரம்' : 'Crop Price Trends'}</Text>
          </View>
          
          {marketData.map((item, index) => (
            <View key={index} style={styles.priceRow}>
              <View>
                <Text style={styles.cropName}>{item.name}</Text>
                <Text style={styles.cropPrice}>{item.price}</Text>
              </View>
              <View style={[styles.trendBadge, item.trend === 'up' ? styles.trendUpBg : styles.trendDownBg]}>
                {item.trend === 'up' ? <ArrowUpRight size={16} color="#15803d" /> : <ArrowDownRight size={16} color="#dc2626" />}
                <Text style={[styles.trendText, item.trend === 'up' ? styles.trendUpText : styles.trendDownText]}>{item.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Govt Schemes Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Landmark color="#1d4ed8" size={20} />
            <Text style={styles.cardTitle}>{isTamil ? 'அரசு திட்டங்கள்' : 'Govt Agricultural Schemes'}</Text>
          </View>
          
          {schemes.map((scheme, index) => (
            <TouchableOpacity key={index} style={styles.schemeItem}>
              <View style={styles.schemeIcon}>
                <ShieldCheck color="#1d4ed8" size={24} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.schemeTitle}>{scheme.title}</Text>
                <Text style={styles.schemeDesc}>{scheme.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#15803d', padding: 24, paddingBottom: 48 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#bbf7d0', fontSize: 14, marginTop: 4 },
  content: { padding: 16, marginTop: -32 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  cropName: { fontSize: 16, fontWeight: '600', color: '#334155' },
  cropPrice: { fontSize: 14, color: '#64748b', marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  trendUpBg: { backgroundColor: '#dcfce7' },
  trendDownBg: { backgroundColor: '#fee2e2' },
  trendText: { fontSize: 12, fontWeight: 'bold' },
  trendUpText: { color: '#15803d' },
  trendDownText: { color: '#dc2626' },
  schemeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, marginBottom: 12, gap: 12 },
  schemeIcon: { backgroundColor: '#dbeafe', padding: 10, borderRadius: 10 },
  schemeTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  schemeDesc: { fontSize: 12, color: '#3b82f6', marginTop: 2 },
});

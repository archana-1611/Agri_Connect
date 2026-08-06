import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { Leaf, Award, Scale, DollarSign, CloudRain, HelpCircle, ArrowUpRight } from 'lucide-react-native';
import Svg, { Rect, Circle, Path, Text as SvgText, G, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

export default function SustainabilityScreen() {
  const { isTamil } = useLanguage();
  const { user } = useAuth();
  const { resources } = useResources();

  // Dynamic user data calculations
  const userListings = resources.filter(r => r.user_id === user?.id);
  const totalResources = userListings.length;
  const userExpectedRevenue = userListings.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  // Static aggregates + user incremental additions
  const wasteSaved = 12450 + totalResources * 500;
  const carbonReduced = Math.round(wasteSaved * 1.2); // 1.2kg CO2 saved per kg recycled
  const revenueGenerated = 284500 + userExpectedRevenue;
  const impactScore = Math.min(95, 76 + totalResources * 4); // max 95 for demo

  // Data for Crop recycling (Bar Chart)
  const cropRecyclingData = [
    { crop: 'Paddy', cropTa: 'நெல்', value: 4500, color: '#15803d' },
    { crop: 'Sugarcane', cropTa: 'கரும்பு', value: 3200, color: '#16a34a' },
    { crop: 'Coconut', cropTa: 'தேங்காய்', value: 2100, color: '#eab308' },
    { crop: 'Banana', cropTa: 'வாழை', value: 1500, color: '#ca8a04' },
    { crop: 'Others', cropTa: 'இதர', value: 1150, color: '#2563eb' }
  ];

  // Data for Monthly Carbon Reduction Progress (Line Chart coordinates)
  const monthlyData = [
    { month: 'Jan', monthTa: 'ஜன', co2: 800, rev: 18000 },
    { month: 'Feb', monthTa: 'பிப்', co2: 1200, rev: 28000 },
    { month: 'Mar', monthTa: 'மார்', co2: 1900, rev: 45000 },
    { month: 'Apr', monthTa: 'ஏப்', co2: 2400, rev: 56000 },
    { month: 'May', monthTa: 'மே', co2: 3100, rev: 72000 },
    { month: 'Jun', monthTa: 'ஜூன்', co2: 3720, rev: 84500 }
  ];

  // SVG Helper variables for Bar chart
  const barMaxVal = 5000;
  const barChartHeight = 160;

  // SVG Helper variables for Line chart
  const lineMaxCo2 = 4000;
  const lineChartHeight = 150;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 1. Eco Gauge & Circular Progress Header */}
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeContent}>
          <View style={styles.circularProgressContainer}>
            <Svg width={110} height={110} viewBox="0 0 100 100">
              {/* Background Circle */}
              <Circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#f1f5f9" 
                strokeWidth="8" 
                fill="transparent" 
              />
              {/* Active Progress Arc */}
              <Circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#15803d" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - impactScore / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              {/* Inner Label */}
              <SvgText
                x="50"
                y="46"
                fontSize="18"
                fontWeight="bold"
                fill="#0f172a"
                textAnchor="middle"
              >
                {impactScore}
              </SvgText>
              <SvgText
                x="50"
                y="64"
                fontSize="8"
                fontWeight="bold"
                fill="#64748b"
                textAnchor="middle"
              >
                {isTamil ? 'மதிப்பெண்' : 'ECO SCORE'}
              </SvgText>
            </Svg>
          </View>

          <View style={styles.gaugeTextContainer}>
            <View style={styles.badgeRow}>
              <Award color="#ca8a04" size={16} />
              <Text style={styles.badgeText}>
                {isTamil ? 'சிறப்பு நிலை' : 'Gold Class Farmer'}
              </Text>
            </View>
            <Text style={styles.gaugeTitle}>
              {isTamil ? 'பசுமை சுற்றுச்சூழல் நிலை' : 'Your Sustainability Status'}
            </Text>
            <Text style={styles.gaugeDesc}>
              {isTamil 
                ? 'வளங்களை மறுசுழற்சி செய்து மண் வளத்தை காத்ததால் உங்கள் சுற்றுச்சூழல் தகுதி அதிகரித்துள்ளது.'
                : 'Your recycling efforts have offset carbon equivalent to planting 36 trees in Tamil Nadu.'}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Key Sustainability Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Waste Saved */}
        <View style={styles.metricCard}>
          <Scale color="#15803d" size={20} />
          <Text style={styles.metricVal}>{wasteSaved.toLocaleString()} kg</Text>
          <Text style={styles.metricLbl}>{isTamil ? 'மறுசுழற்சி கழிவு' : 'Biomass Saved'}</Text>
        </View>

        {/* Carbon Offset */}
        <View style={styles.metricCard}>
          <Leaf color="#16a34a" size={20} />
          <Text style={styles.metricVal}>{carbonReduced.toLocaleString()} kg</Text>
          <Text style={styles.metricLbl}>{isTamil ? 'தடுத்த CO₂ வாயு' : 'CO₂ Offset'}</Text>
        </View>

        {/* Green Revenue */}
        <View style={styles.metricCard}>
          <DollarSign color="#ca8a04" size={20} />
          <Text style={styles.metricVal}>₹{(revenueGenerated / 1000).toFixed(1)}k</Text>
          <Text style={styles.metricLbl}>{isTamil ? 'பசுமை வருவாய்' : 'Eco Earnings'}</Text>
        </View>
      </View>

      {/* 3. CHART A: Waste Saved per Crop Type (Bar Chart) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {isTamil ? 'பயிர்கள் வாரியாக சேமிப்பு (கிலோவில்)' : 'Biomass Saved by Crop Type (kg)'}
        </Text>
        <Text style={styles.chartSubtitle}>
          {isTamil ? 'மறுசுழற்சி செய்யப்பட்ட பயிர் கழிவுகளின் ஒப்பீடு' : 'Comparative analysis of recycled crop residues'}
        </Text>

        <Svg width={CHART_WIDTH - 20} height={barChartHeight + 40} style={{ marginTop: 12 }}>
          {/* X and Y Axis lines */}
          <Line x1="40" y1={barChartHeight} x2={CHART_WIDTH - 30} y2={barChartHeight} stroke="#cbd5e1" strokeWidth="1" />
          <Line x1="40" y1="10" x2="40" y2={barChartHeight} stroke="#cbd5e1" strokeWidth="1" />

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = barChartHeight - pct * (barChartHeight - 20);
            return (
              <G key={idx}>
                <Line x1="40" y1={y} x2={CHART_WIDTH - 30} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <SvgText x="32" y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end">
                  {Math.round(barMaxVal * pct)}
                </SvgText>
              </G>
            );
          })}

          {/* Render Bars */}
          {cropRecyclingData.map((item, idx) => {
            const barWidth = 26;
            const barSpacing = (CHART_WIDTH - 90) / cropRecyclingData.length;
            const x = 55 + idx * barSpacing;
            const barHeight = (item.value / barMaxVal) * (barChartHeight - 20);
            const y = barChartHeight - barHeight;

            return (
              <G key={item.crop}>
                {/* Visual Bar with Rounded cap effect */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx="4"
                />
                
                {/* Bar Value text */}
                <SvgText x={x + barWidth/2} y={y - 6} fontSize="9" fill="#475569" fontWeight="bold" textAnchor="middle">
                  {item.value}
                </SvgText>

                {/* X Axis Labels */}
                <SvgText x={x + barWidth/2} y={barChartHeight + 16} fontSize="10" fill="#64748b" fontWeight="600" textAnchor="middle">
                  {isTamil ? item.cropTa : item.crop}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* 4. CHART B: Carbon Reduction Trend (Line Chart) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {isTamil ? 'மாதாந்திர கார்பன் தடுத்தல் (கிலோ CO₂)' : 'Monthly Carbon Reduction (kg CO₂)'}
        </Text>
        <Text style={styles.chartSubtitle}>
          {isTamil ? 'ஆண்டின் முதல் அரையாண்டின் சுற்றுச்சூழல் வளர்ச்சி' : 'Eco-mitigation progress over the last 6 months'}
        </Text>

        <Svg width={CHART_WIDTH - 20} height={lineChartHeight + 45} style={{ marginTop: 12 }}>
          {/* Grid boundaries */}
          <Line x1="45" y1={lineChartHeight} x2={CHART_WIDTH - 30} y2={lineChartHeight} stroke="#cbd5e1" strokeWidth="1" />
          <Line x1="45" y1="10" x2="45" y2={lineChartHeight} stroke="#cbd5e1" strokeWidth="1" />

          {/* Grid horizontal guidelines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = lineChartHeight - pct * (lineChartHeight - 20);
            return (
              <G key={idx}>
                <Line x1="45" y1={y} x2={CHART_WIDTH - 30} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <SvgText x="38" y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end">
                  {Math.round(lineMaxCo2 * pct)}
                </SvgText>
              </G>
            );
          })}

          {/* Draw Line Path */}
          {(() => {
            const colWidth = (CHART_WIDTH - 95) / (monthlyData.length - 1);
            let pathD = '';
            
            monthlyData.forEach((item, idx) => {
              const x = 60 + idx * colWidth;
              const y = lineChartHeight - (item.co2 / lineMaxCo2) * (lineChartHeight - 20);
              if (idx === 0) {
                pathD = `M ${x} ${y}`;
              } else {
                pathD += ` L ${x} ${y}`;
              }
            });

            return (
              <G>
                {/* Polyline Path */}
                <Path d={pathD} fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />

                {/* Plot Data Dots & Labels */}
                {monthlyData.map((item, idx) => {
                  const x = 60 + idx * colWidth;
                  const y = lineChartHeight - (item.co2 / lineMaxCo2) * (lineChartHeight - 20);

                  return (
                    <G key={idx}>
                      <Circle cx={x} cy={y} r="4" fill="#ca8a04" stroke="white" strokeWidth="1.5" />
                      <SvgText x={x} y={y - 8} fontSize="9" fill="#0f172a" fontWeight="bold" textAnchor="middle">
                        {item.co2}
                      </SvgText>
                      {/* X label */}
                      <SvgText x={x} y={lineChartHeight + 18} fontSize="10" fill="#64748b" fontWeight="600" textAnchor="middle">
                        {isTamil ? item.monthTa : item.month}
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            );
          })()}
        </Svg>
      </View>

      {/* 5. Carbon Credit explanation card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <Leaf color="#15803d" size={24} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.infoTitle}>
            {isTamil ? 'உங்களுக்கு தெரியுமா? (Did you know?)' : 'Did You Know?'}
          </Text>
          <Text style={styles.infoDesc}>
            {isTamil 
              ? 'வைக்கோல் போன்ற பயிர்க்கழிவுகளை வயலில் தீயிட்டு எரிப்பதால் காற்றில் அதிக நச்சு வாயுக்கள் கலக்கின்றன. அதை எரிப்பதற்குப் பதிலாக மறுசுழற்சி செய்யும் ஒவ்வொரு 1000 கிலோ கழிவிற்கும் ஒரு மெட்ரிக் டன் கார்பன் தடுத்ததாக கணக்கிடப்படுகிறது.'
              : 'Every metric ton (1,000 kg) of crop residue you recycle instead of burning offsets approximately 1.2 tons of CO₂ and matches the carbon capture of 50 mature trees over one year.'}
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  gaugeCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  gaugeContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  circularProgressContainer: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
  gaugeTextContainer: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, alignSelf: 'flex-start', marginBottom: 6 },
  badgeText: { color: '#ca8a04', fontSize: 11, fontWeight: 'bold' },
  gaugeTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  gaugeDesc: { fontSize: 12, color: '#64748b', lineHeight: 18, marginTop: 4 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  metricVal: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginVertical: 6 },
  metricLbl: { fontSize: 10, color: '#64748b', textAlign: 'center' },
  chartCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  chartSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  infoCard: { flexDirection: 'row', backgroundColor: '#e8f5e9', borderRadius: 20, padding: 16, gap: 12, borderLeftWidth: 4, borderLeftColor: '#15803d' },
  infoIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#c8e6c9', justifyContent: 'center', alignItems: 'center' },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  infoDesc: { fontSize: 12, color: '#2e7d32', lineHeight: 18, textAlign: 'justify' }
});

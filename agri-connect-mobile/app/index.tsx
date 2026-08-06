import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Sprout, Languages } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { isTamil, toggleLanguage } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#15803d', '#166534']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 32, borderRadius: 80, marginBottom: 20 }}>
          <Sprout size={80} color="#eab308" />
        </View>
        <Text style={{ fontSize: 36, color: 'white', fontWeight: '900', marginBottom: 8 }}>
          {isTamil ? 'உழவர்வளம்' : 'AgriConnect'}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
          {isTamil ? 'அதிநவீன வேளாண் உபரி மேலாண்மை' : 'Premium AgriTech Circular Economy'}
        </Text>
        <ActivityIndicator size="large" color="#eab308" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(21, 128, 61, 0.7)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.overlay}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
              <Languages color="white" size={20} />
              <Text style={styles.langText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Sprout size={64} color="white" />
            </View>
            <Text style={styles.title}>{isTamil ? 'உழவர்வளம்' : 'AgriConnect'}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/auth')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isTamil ? 'தொடங்கவும்' : 'Get Started'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 40,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  langText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    borderRadius: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#eab308',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

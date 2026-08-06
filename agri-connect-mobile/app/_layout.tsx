import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ResourceProvider } from '../context/ResourceContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ActivityIndicator, View } from 'react-native';

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <LanguageProvider>
      <AuthProvider>
        <ResourceProvider>
          <AuthGuard />
        </ResourceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const segs = segments as any;
    const inAuthGroup = segs[0] === 'auth';
    const inIndex = segs.length === 0 || segs[0] === 'index';
    
    if (!user && !inAuthGroup && !inIndex) {
      router.replace('/');
    } else if (user && (inAuthGroup || inIndex)) {
      const rawRole = user.user_metadata?.role || 'Farmer';
      const roleLower = String(rawRole).toLowerCase().trim();
      if (roleLower === 'buyer') {
        router.replace('/(tabs)/marketplace');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
         <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="support-chat" />
    </Stack>
  );
}

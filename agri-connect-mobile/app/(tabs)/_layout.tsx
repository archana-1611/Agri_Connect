import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, PlusCircle, User, MessageSquare, Languages } from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
  const { isTamil, toggleLanguage } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#15803d' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity 
            style={styles.langHeaderBtn} 
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Languages color="#15803d" size={15} />
            <Text style={styles.langHeaderBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: isTamil ? 'முகப்பு' : 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: isTamil ? 'சந்தை' : 'Marketplace',
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add-resource"
        options={{
          title: isTamil ? 'சேர்க்க' : 'Add',
          tabBarIcon: ({ color }) => (
            <View style={styles.fab}>
              <PlusCircle color="white" size={32} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: isTamil ? 'அரட்டைகள்' : 'Chats',
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isTamil ? 'சுயவிவரம்' : 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="sustainability"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    backgroundColor: '#15803d',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  langHeaderBtn: {
    marginRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  langHeaderBtnText: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

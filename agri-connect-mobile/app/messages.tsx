import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useRouter, Stack } from 'expo-router';
import { MessageSquare, ArrowLeft, Check, X, User, MapPin } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessagesInboxScreen() {
  const { user, demoMode } = useAuth();
  const { isTamil } = useLanguage();
  const router = useRouter();

  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getMockChats = () => {
    return [
      {
        id: 'chat-req-1',
        sender_id: user?.id || 'demo-farmer-id',
        receiver_id: 'buyer-1',
        resource_title: isTamil ? 'உலர் நெல் வைக்கோல் கட்டுகள்' : 'Dry Paddy Straw Bales',
        status: 'accepted',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender: { full_name: 'Karthik Raja', location: 'Coimbatore, TN' },
        receiver: { full_name: 'Green Valley Dairy Farm', location: 'Pollachi, Coimbatore' }
      },
      {
        id: 'chat-req-2',
        sender_id: user?.id || 'demo-farmer-id',
        receiver_id: 'buyer-2',
        resource_title: isTamil ? 'தேங்காய் மட்டை' : 'Fibrous Coconut Husk',
        status: 'accepted',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        sender: { full_name: 'Karthik Raja', location: 'Coimbatore, TN' },
        receiver: { full_name: 'EcoFert Compost Industry', location: 'Attur, Salem' }
      }
    ];
  };

  const getMockPendings = () => {
    // Show a pending inbound request only for Farmer demo to evaluate accepting/declining
    return [
      {
        id: 'chat-req-pending-1',
        sender_id: 'buyer-3',
        receiver_id: user?.id || 'demo-farmer-id',
        resource_title: isTamil ? 'சோள தட்டுகள் கொள்முதல்' : 'Corn Stover Bulk Procurement',
        status: 'pending',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        sender: { full_name: 'Rajan Organic Farms', location: 'Gobichettipalayam, Erode' },
        receiver: { full_name: 'Karthik Raja', location: 'Coimbatore, TN' }
      }
    ];
  };

  const fetchNegotiations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let chats: any[] = [];
      let pendings: any[] = [];
      let fetchFailed = false;

      if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        try {
          const { data, error } = await supabase
            .from('chat_requests')
            .select(`
              *,
              sender:profiles!sender_id(*),
              receiver:profiles!receiver_id(*)
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          if (error) throw error;

          chats = (data || []).filter(item => item.status === 'accepted');
          pendings = (data || []).filter(item => item.status === 'pending' && item.receiver_id === user.id);
        } catch (err) {
          console.warn("Supabase fetch negotiations failed, using local fallback:", err);
          fetchFailed = true;
        }
      } else {
        fetchFailed = true;
      }

      if (demoMode || fetchFailed || chats.length === 0) {
        // Load dynamically started chat channels from AsyncStorage
        const stored = await AsyncStorage.getItem('local_chats');
        const localChats = stored ? JSON.parse(stored) : [];

        // Mix in pre-seeded mockup channels
        const combinedChats = [...localChats, ...getMockChats()];
        
        // Remove duplicates based on ID
        const uniqueChatsMap = new Map();
        combinedChats.forEach(c => uniqueChatsMap.set(String(c.id), c));
        chats = Array.from(uniqueChatsMap.values());

        // Manage local pending approvals
        const storedPendings = await AsyncStorage.getItem('local_pendings');
        if (storedPendings) {
          pendings = JSON.parse(storedPendings);
        } else {
          pendings = getMockPendings();
        }
      }

      setActiveChats(chats);
      setPendingRequests(pendings);
    } catch (err: any) {
      console.error('Error fetching negotiations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, [user, demoMode]);

  useEffect(() => {
    if (demoMode || !process.env.EXPO_PUBLIC_SUPABASE_URL) return;

    const channel = supabase
      .channel('public:chat_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_requests' }, () => {
        fetchNegotiations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demoMode]);

  const handleUpdateStatus = async (id: number | string, status: 'accepted' | 'rejected') => {
    // If standard mode, attempt Supabase update
    if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL && typeof id === 'number') {
      try {
        const { error } = await supabase
          .from('chat_requests')
          .update({ status })
          .eq('id', id);

        if (!error) {
          Alert.alert(
            isTamil ? 'அரட்டை நிலை' : 'Chat Status',
            status === 'accepted' ? 'Accepted!' : 'Declined!'
          );
          fetchNegotiations();
          return;
        }
      } catch (err) {
        console.warn("Supabase chat status update failed:", err);
      }
    }

    // Local state updates for Demo Mode
    try {
      if (status === 'accepted') {
        const acceptedChat = pendingRequests.find(p => String(p.id) === String(id));
        if (acceptedChat) {
          acceptedChat.status = 'accepted';
          
          // Add to local active chats in AsyncStorage
          const stored = await AsyncStorage.getItem('local_chats');
          const localList = stored ? JSON.parse(stored) : [];
          localList.unshift(acceptedChat);
          await AsyncStorage.setItem('local_chats', JSON.stringify(localList));
        }
      }

      // Filter out from pendings in AsyncStorage
      const filteredPendings = pendingRequests.filter(p => String(p.id) !== String(id));
      await AsyncStorage.setItem('local_pendings', JSON.stringify(filteredPendings));

      Alert.alert(
        isTamil ? 'அரட்டை அறை' : 'Negotiation Update',
        status === 'accepted' 
          ? (isTamil ? 'கோரிக்கை ஏற்கப்பட்டது! உரையாடலைத் தொடங்கலாம்.' : 'Chat request accepted! Thread opened.')
          : (isTamil ? 'கோரிக்கை நிராகரிக்கப்பட்டது.' : 'Chat request declined.')
      );
      
      fetchNegotiations();
    } catch (e) {
      console.error(e);
    }
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const isSender = item.sender_id === user?.id;
    const otherUser = isSender ? item.receiver : item.sender;
    const displayName = otherUser?.full_name || 'Agri Buyer';
    const displayLocation = otherUser?.location || 'Tamil Nadu';

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => router.push(`/chat/${item.id}?buyerName=${encodeURIComponent(displayName)}&buyerLoc=${encodeURIComponent(displayLocation)}` as any)}
      >
        <View style={styles.avatar}>
          <User color="#15803d" size={24} />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.resourceTitle} numberOfLines={1}>
            {isTamil ? 'பயிர்க்கழிவு: ' : 'Discussing: '} {item.resource_title}
          </Text>
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#94a3b8" />
            <Text style={styles.locationText}>{displayLocation}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPendingItem = ({ item }: { item: any }) => {
    const requester = item.sender;
    return (
      <View style={styles.pendingCard}>
        <View style={styles.pendingHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <View style={styles.avatarSmall}>
              <User color="#ca8a04" size={18} />
            </View>
            <View>
              <Text style={styles.pendingName}>{requester?.full_name || 'Agri Buyer'}</Text>
              <Text style={styles.pendingSub}>{requester?.location || 'Coimbatore, TN'}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.pendingDesc}>
          {isTamil ? 'வாங்க விருப்பம்: ' : 'Interested in purchasing: '}
          <Text style={{fontWeight: 'bold', color: '#15803d'}}>{item.resource_title}</Text>
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.declineBtn]} 
            onPress={() => handleUpdateStatus(item.id, 'rejected')}
          >
            <X color="#ef4444" size={16} />
            <Text style={styles.declineText}>{isTamil ? 'நிராகரி' : 'Decline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => handleUpdateStatus(item.id, 'accepted')}
          >
            <Check color="white" size={16} />
            <Text style={styles.acceptText}>{isTamil ? 'ஏற்கிறேன்' : 'Accept'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: isTamil ? 'விவாதங்கள் & பேரங்கள்' : 'Negotiations Inbox', headerShown: true, headerStyle: { backgroundColor: '#15803d' }, headerTintColor: '#fff' }} />

      {loading && activeChats.length === 0 && pendingRequests.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#15803d" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Pending Approvals */}
          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isTamil ? `அரட்டை கோரிக்கைகள் (${pendingRequests.length})` : `Inbound Requests (${pendingRequests.length})`}
              </Text>
              <FlatList
                data={pendingRequests}
                renderItem={renderPendingItem}
                keyExtractor={item => String(item.id)}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Active Chats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isTamil ? `செயலில் உள்ள விவாதங்கள் (${activeChats.length})` : `Active Negotiations (${activeChats.length})`}
            </Text>
            {activeChats.length === 0 ? (
              <View style={styles.emptyCard}>
                <MessageSquare size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>
                  {isTamil ? 'செயலில் விவாதங்கள் எதுவும் இல்லை.' : 'No active negotiation chats. Start an offer from marketplace!'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={activeChats}
                renderItem={renderChatItem}
                keyExtractor={item => String(item.id)}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  chatItem: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  timeText: { fontSize: 11, color: '#94a3b8' },
  resourceTitle: { fontSize: 13, color: '#334155', marginBottom: 6 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: '#94a3b8' },
  pendingCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  pendingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pendingName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  pendingSub: { fontSize: 11, color: '#94a3b8' },
  pendingDesc: { fontSize: 13, color: '#4b5563', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  declineBtn: { backgroundColor: '#fee2e2' },
  declineText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  acceptBtn: { backgroundColor: '#15803d' },
  acceptText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyCard: { backgroundColor: 'white', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center' }
});

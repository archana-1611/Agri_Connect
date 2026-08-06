import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Send, MapPin, Handshake, ChevronLeft } from 'lucide-react-native';

export default function ChatRoomScreen() {
  const { id: requestId, buyerName, buyerLoc } = useLocalSearchParams();
  const { user, demoMode } = useAuth();
  const { isTamil } = useLanguage();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [request, setRequest] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Negotiation pricing offer state
  const [offerPrice, setOfferPrice] = useState('');
  const [proposingOffer, setProposingOffer] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const getMockInitialMessages = (reqId: string) => {
    const timeBase = Date.now() - 3600000;
    if (reqId === 'chat-req-1') {
      return [
        {
          id: 'msg-1',
          request_id: reqId,
          sender_id: 'buyer-1',
          content: isTamil 
            ? 'வணக்கம், உங்கள் நெல் வைக்கோல் பட்டியலைப் பார்த்தேன். என்ன விலை எதிர்பார்க்கிறீர்கள்?'
            : 'Hello, saw your Paddy Straw listing. What is your final price offer?',
          created_at: new Date(timeBase).toISOString()
        }
      ];
    } else if (reqId === 'chat-req-2') {
      return [
        {
          id: 'msg-2',
          request_id: reqId,
          sender_id: 'buyer-2',
          content: isTamil
            ? 'தேங்காய் மட்டைகளை உடனடியாகக் கொள்முதல் செய்ய விரும்புகிறேன்.'
            : 'We are prepared to purchase all your coconut husks. How soon can we load?',
          created_at: new Date(timeBase - 1800000).toISOString()
        }
      ];
    }
    
    // Default welcome message for dynamically started chats
    return [
      {
        id: `msg-dyn-${Date.now()}`,
        request_id: reqId,
        sender_id: 'buyer-dynamic',
        content: isTamil
          ? 'வணக்கம்! நான் உங்கள் பட்டியலால் ஈர்க்கப்பட்டேன். பேரத்தைத் தொடங்கலாம்.'
          : 'Hello! I am interested in your listed resource. Let us begin negotiations.',
        created_at: new Date().toISOString()
      }
    ];
  };

  const fetchChatDetails = async () => {
    if (!user || !requestId) return;
    try {
      setLoading(true);
      let loadedReq: any = null;
      let loadedOther: any = null;
      let loadedMsgs: any[] = [];
      let fetchFailed = false;

      if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL && !String(requestId).startsWith('chat-req-')) {
        try {
          const { data: reqData, error: reqError } = await supabase
            .from('chat_requests')
            .select(`
              *,
              sender:profiles!sender_id(*),
              receiver:profiles!receiver_id(*)
            `)
            .eq('id', requestId)
            .single();

          if (reqError) throw reqError;

          loadedReq = reqData;
          loadedOther = reqData.sender_id === user.id ? reqData.receiver : reqData.sender;

          const { data: msgData, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true });

          if (msgError) throw msgError;
          loadedMsgs = msgData || [];
        } catch (dbErr) {
          console.warn("DB Chat Details fetch failed, using local mock:", dbErr);
          fetchFailed = true;
        }
      } else {
        fetchFailed = true;
      }

      if (demoMode || fetchFailed) {
        // Build mock layout based on search params or mock details
        const resolvedName = buyerName ? decodeURIComponent(buyerName as string) : 'Green Valley Dairy Farm';
        const resolvedLoc = buyerLoc ? decodeURIComponent(buyerLoc as string) : 'Coimbatore, TN';

        loadedReq = {
          id: requestId,
          resource_title: isTamil ? 'விவசாய பயிர்க்கழிவு விவாதம்' : 'Dry Biomass Residues',
          status: 'accepted'
        };

        loadedOther = {
          full_name: resolvedName,
          location: resolvedLoc
        };

        loadedMsgs = getMockInitialMessages(String(requestId));
      }

      setRequest(loadedReq);
      setOtherUser(loadedOther);
      setMessages(loadedMsgs);
    } catch (err: any) {
      console.error('Error fetching chat details:', err);
      Alert.alert('Error', 'Could not open chat room');
      router.push('/messages' as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatDetails();
  }, [requestId, user]);

  // Realtime listener for standard database mode
  useEffect(() => {
    if (demoMode || !process.env.EXPO_PUBLIC_SUPABASE_URL || String(requestId).startsWith('chat-req-')) return;

    const channel = supabase
      .channel(`chat:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${requestId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, demoMode]);

  // Auto-scroll thread
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const simulateBuyerResponse = (userMsg: string) => {
    setTimeout(() => {
      let responseText = '';
      if (userMsg.includes('📢') || userMsg.toLowerCase().includes('offer') || userMsg.includes('விலை')) {
        responseText = isTamil 
          ? 'விலை திருப்திகரமாக உள்ளது! நான் இதை ஒப்புக்கொள்கிறேன். வண்டி அனுப்பி எடுத்துக்கொள்கிறேன்.'
          : 'This price counter-offer sounds fair. I accept this deal and will coordinate transport.';
      } else {
        responseText = isTamil
          ? 'நல்லது! அறுவடை முடிந்தவுடன் எப்போது வண்டி அனுப்பலாம் என்பதை எனக்குக் கூறவும்.'
          : 'Great! Let me know when the residue is dried and we can dispatch a truck.';
      }

      const replyMsg = {
        id: `msg-reply-${Date.now()}`,
        request_id: requestId,
        sender_id: 'buyer-simulated',
        content: responseText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500); // 1.5s delay
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !requestId) return;

    const textToSend = newMessage;
    setNewMessage('');

    // Optimistic Update
    const tempId = `msg-opt-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      request_id: requestId,
      sender_id: user.id,
      content: textToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    // If standard mode, save to Supabase
    if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL && !String(requestId).startsWith('chat-req-')) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert({
            request_id: requestId,
            sender_id: user.id,
            content: textToSend
          });

        if (error) throw error;
      } catch (err: any) {
        console.warn('DB message insertion failed, keeping local message:', err);
      }
    } else {
      // Simulate buyer replies in demo mode
      simulateBuyerResponse(textToSend);
    }
  };

  const handleProposePrice = async () => {
    if (!offerPrice.trim() || !user || !requestId) return;
    setProposingOffer(true);
    
    const proposalText = isTamil 
      ? `📢 புதிய விலை பேரம்: ₹${offerPrice} என விலை முன்மொழியப்பட்டது.` 
      : `📢 Counter Offer Proposed: Proposed deal at ₹${offerPrice}.`;

    try {
      const tempId = `msg-offer-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        request_id: requestId,
        sender_id: user.id,
        content: proposalText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMessage]);

      if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL && !String(requestId).startsWith('chat-req-')) {
        try {
          const { error: msgErr } = await supabase
            .from('messages')
            .insert({
              request_id: requestId,
              sender_id: user.id,
              content: proposalText
            });

          if (msgErr) throw msgErr;
        } catch (dbErr) {
          console.warn('DB proposal insertion failed:', dbErr);
        }
      } else {
        // Simulate response to bargain offer
        simulateBuyerResponse(proposalText);
      }

      Alert.alert(
        isTamil ? 'பேரம் முன்மொழியப்பட்டது!' : 'Bargain Sent!', 
        isTamil ? 'புதிய விலை விவாதத்தில் சேர்க்கப்பட்டது.' : 'Counter bargaining price proposed successfully.'
      );
      setOfferPrice('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setProposingOffer(false);
    }
  };

  const renderMessageBubble = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    const timeString = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSystemOffer = item.content.includes('📢');

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[
          styles.bubble, 
          isMe ? styles.myBubble : styles.theirBubble,
          isSystemOffer && styles.systemOfferBubble
        ]}>
          <Text style={[
            styles.bubbleText, 
            isMe ? styles.myText : styles.theirText,
            isSystemOffer && styles.systemOfferText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timeText}>{timeString}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#15803d" />
        <Text style={styles.loaderText}>{isTamil ? 'அரட்டை திறக்கப்படுகிறது...' : 'Entering bargaining room...'}</Text>
      </View>
    );
  }

  const otherName = otherUser?.full_name || 'Agri Buyer';
  const otherLocation = otherUser?.location || 'Tamil Nadu';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={10} color="#94a3b8" />
            <Text style={styles.locationText}>{otherLocation}</Text>
          </View>
        </View>
        <View style={styles.headerContext}>
          <Text style={styles.headerContextLbl}>{isTamil ? 'உபரிப் பொருள்:' : 'Resource:'}</Text>
          <Text style={styles.headerContextTitle} numberOfLines={1}>{request?.resource_title}</Text>
        </View>
      </View>

      {/* Bargaining Offer Form Toolbar */}
      <View style={styles.bargainBar}>
        <Handshake color="#ca8a04" size={20} />
        <TextInput 
          style={styles.bargainInput}
          placeholder={isTamil ? "விலை பேரம் பேசு ₹..." : "Counter Bargain Offer ₹..."}
          keyboardType="numeric"
          value={offerPrice}
          onChangeText={setOfferPrice}
          placeholderTextColor="#a16207"
        />
        <TouchableOpacity 
          style={styles.bargainBtn} 
          onPress={handleProposePrice}
          disabled={proposingOffer || !offerPrice}
        >
          {proposingOffer ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.bargainBtnText}>{isTamil ? 'பேரம் பேசு' : 'Offer'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageBubble}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.messagesContainer}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Text Input Footer */}
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.textInput}
            placeholder={isTamil ? "செய்தியை தட்டச்சு செய்க..." : "Discuss crop logistics or price..."}
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.6 }]} 
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send color="white" size={16} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  loaderText: { marginTop: 12, color: '#64748b', fontWeight: 'bold' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingTop: Platform.OS === 'android' ? 10 : 14 },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: 'bold', color: '#1f2937' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  locationText: { fontSize: 11, color: '#94a3b8' },
  headerContext: { alignItems: 'flex-end', maxWidth: '35%' },
  headerContextLbl: { fontSize: 9, color: '#94a3b8' },
  headerContextTitle: { fontSize: 11, fontWeight: 'bold', color: '#15803d', marginTop: 2 },
  bargainBar: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fefdeb', gap: 10, borderBottomWidth: 1, borderBottomColor: '#fcd34d' },
  bargainInput: { flex: 1, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, borderWidth: 1, borderColor: '#fcd34d', color: '#1f2937' },
  bargainBtn: { backgroundColor: '#ca8a04', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  bargainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  messagesContainer: { padding: 16, paddingBottom: 24 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '85%' },
  myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  myBubble: { backgroundColor: '#15803d', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  systemOfferBubble: { backgroundColor: '#fef3c7', borderStyle: 'solid', borderWidth: 1, borderColor: '#fcd34d' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  myText: { color: 'white' },
  theirText: { color: '#1c1917' },
  systemOfferText: { color: '#854d0e', fontWeight: 'bold' },
  timeText: { fontSize: 9, color: '#94a3b8', marginTop: 4 },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10, alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, color: '#1f2937' },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#15803d', justifyContent: 'center', alignItems: 'center' }
});

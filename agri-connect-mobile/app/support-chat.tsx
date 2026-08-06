import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, SafeAreaView, ScrollView, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useResources } from '../context/ResourceContext';
import { supabase } from '../lib/supabase';
import { Send, Globe, ChevronLeft, User, MessageSquare, CheckCircle, Clock, MapPin, Image as ImageIcon, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Ticket Status Flow constants
const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', labelTa: 'கோரிக்கை நிலுவையில் உள்ளது' },
  { key: 'searching', label: 'Searching for Farmers', labelTa: 'விவசாயிகள் தேடல்' },
  { key: 'found', label: 'Farmer Found', labelTa: 'விவசாயி கண்டறியப்பட்டார்' },
  { key: 'notified', label: 'Buyer Notified', labelTa: 'வாங்குபவர் அறிவிக்கப்பட்டார்' },
  { key: 'confirmed', label: 'Order Confirmed', labelTa: 'ஆர்டர் உறுதி செய்யப்பட்டது' },
  { key: 'completed', label: 'Completed', labelTa: 'கோரிக்கை முடிந்தது' }
];

export default function SupportChatScreen() {
  const { user, demoMode } = useAuth();
  const { isTamil: globalIsTamil, toggleLanguage: globalToggleLanguage } = useLanguage();
  const router = useRouter();
  const { mode, productName: paramProductName } = useLocalSearchParams();

  // Local language override to toggle within support chat easily
  const [localIsTamil, setLocalIsTamil] = useState(globalIsTamil);

  // Screen State: 'form' | 'chat'
  const [viewMode, setViewMode] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(true);

  // Ticket Form States
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [preferredDistrict, setPreferredDistrict] = useState(user?.user_metadata?.district || 'Coimbatore');
  const [preferredVillage, setPreferredVillage] = useState(user?.user_metadata?.village || '');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [notes, setNotes] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Active Ticket States
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);

  // Push Notification Simulation State
  const [pushNotification, setPushNotification] = useState<{ title: string; body: string } | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const { resources } = useResources();
  const [matchedFarmers, setMatchedFarmers] = useState<any[]>([]);

  useEffect(() => {
    setLocalIsTamil(globalIsTamil);
  }, [globalIsTamil]);

  const triggerPushNotification = (title: string, body: string) => {
    setPushNotification({ title, body });
    setTimeout(() => {
      setPushNotification(null);
    }, 4500);
  };

  useEffect(() => {
    if (!activeTicket) {
      setMatchedFarmers([]);
      return;
    }
    const prod = activeTicket.productName.toLowerCase();
    if (prod === 'general assistance') {
      setMatchedFarmers([]);
      return;
    }
    const matched = resources.filter(res => {
      const resCrop = res.crop.toLowerCase();
      const resTitle = res.title.toLowerCase();
      return prod.includes(resCrop) || resCrop.includes(prod) || resTitle.includes(prod);
    });
    setMatchedFarmers(matched);
  }, [activeTicket, resources]);

  const handleSelectFarmerQuote = async (farmer: any) => {
    try {
      const stored = await AsyncStorage.getItem(`active_ticket_${user?.id}`);
      if (stored) {
        const ticket = JSON.parse(stored);
        ticket.status = 'confirmed';
        ticket.matchedSupplier = farmer.user_id;
        ticket.matchedSupplierName = farmer.title;
        ticket.matchedPrice = farmer.price;
        await AsyncStorage.setItem(`active_ticket_${user?.id}`, JSON.stringify(ticket));
        setActiveTicket(ticket);

        // Update global support list as well
        const allTicketsStored = await AsyncStorage.getItem('global_support_tickets');
        if (allTicketsStored) {
          const list = JSON.parse(allTicketsStored);
          const index = list.findIndex((t: any) => t.id === ticket.id);
          if (index !== -1) {
            list[index].status = 'confirmed';
            list[index].matchedSupplier = farmer.user_id;
            list[index].matchedSupplierName = farmer.title;
            await AsyncStorage.setItem('global_support_tickets', JSON.stringify(list));
          }
        }

        // Add system message to the chat
        const storedMsgs = await AsyncStorage.getItem(`support_msgs_${ticket.id}`);
        const list = storedMsgs ? JSON.parse(storedMsgs) : [];
        const confirmMsg = {
          id: `sys-confirm-${Date.now()}`,
          sender: 'agent',
          content: localIsTamil
            ? `✅ ஆர்டர் உறுதி செய்யப்பட்டது! விவசாயி ${farmer.title} (${farmer.location}) உடன் ₹${farmer.price} விலைக்கு ஒப்பந்தம் செய்ய ஒப்புக்கொண்டீர்கள். நாங்கள் விநியோக ஏற்பாடுகளைத் தொடங்கியுள்ளோம்.`
            : `✅ Order Confirmed! You selected Farmer ${farmer.title} (${farmer.location}) at ₹${farmer.price}. Direct transport arrangements are now being initiated.`,
          created_at: new Date().toISOString(),
          isSystem: true
        };
        list.push(confirmMsg);
        setMessages(list);
        await AsyncStorage.setItem(`support_msgs_${ticket.id}`, JSON.stringify(list));

        triggerPushNotification(
          localIsTamil ? 'ஆர்டர் உறுதி செய்யப்பட்டது!' : 'Order Confirmed!',
          localIsTamil 
            ? `விவசாயி ${farmer.title} உடன் உங்கள் ஒப்பந்தம் உறுதி செய்யப்பட்டுள்ளது.`
            : `Your order with Farmer ${farmer.title} has been confirmed.`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load existing ticket if any
  const loadActiveTicket = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(`active_ticket_${user?.id}`);
      if (stored) {
        const ticket = JSON.parse(stored);
        setActiveTicket(ticket);
        setViewMode('chat');
        
        // Load messages for this ticket
        const storedMsgs = await AsyncStorage.getItem(`support_msgs_${ticket.id}`);
        if (storedMsgs) {
          setMessages(JSON.parse(storedMsgs));
        } else {
          // Seed initial welcome messages
          const initialMsgs = getInitialWelcomeMessages(ticket);
          setMessages(initialMsgs);
          await AsyncStorage.setItem(`support_msgs_${ticket.id}`, JSON.stringify(initialMsgs));
        }
      } else {
        setViewMode('form');
      }
    } catch (e) {
      console.error('Error loading active ticket:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle mode and productName query parameters
  useEffect(() => {
    if (paramProductName) {
      setProductName(String(paramProductName));
    }
    if (mode === 'form') {
      setViewMode('form');
    } else if (mode === 'chat') {
      const initGenericChat = async () => {
        const stored = await AsyncStorage.getItem(`active_ticket_${user?.id}`);
        if (!stored) {
          const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
          const genericTicket = {
            id: ticketId,
            buyerId: user?.id,
            buyerName: user?.user_metadata?.full_name || 'Agri Buyer',
            buyerPhone: user?.user_metadata?.phone || '+91 99999 88888',
            productName: 'General Assistance',
            quantity: 'N/A',
            location: user?.user_metadata?.location || 'Coimbatore',
            urgency: 'Medium',
            notes: 'User requested direct support chat.',
            status: 'pending',
            created_at: new Date().toISOString()
          };
          await AsyncStorage.setItem(`active_ticket_${user?.id}`, JSON.stringify(genericTicket));
          setActiveTicket(genericTicket);
          
          const welcome = [
            {
              id: 'w-1',
              sender: 'agent',
              content: localIsTamil
                ? `வணக்கம்! என் பெயர் அர்ச்சனா. உழவர்வளம் உதவி மையத்திலிருந்து உங்களை வரவேற்கிறேன். உங்களுக்கு எப்படி உதவ முடியும்?`
                : `Hello! I am Agent Archana from AgriConnect Customer Care. How can I assist you today?`,
              created_at: new Date().toISOString()
            }
          ];
          setMessages(welcome);
          await AsyncStorage.setItem(`support_msgs_${ticketId}`, JSON.stringify(welcome));
          
          // Append to global tickets list
          const allTicketsStored = await AsyncStorage.getItem('global_support_tickets');
          const allTicketsList = allTicketsStored ? JSON.parse(allTicketsStored) : [];
          allTicketsList.unshift(genericTicket);
          await AsyncStorage.setItem('global_support_tickets', JSON.stringify(allTicketsList));
        }
        setViewMode('chat');
      };
      if (user) {
        initGenericChat();
      }
    } else if (user) {
      loadActiveTicket();
    }
  }, [mode, paramProductName, user]);

  // Periodic polling for status changes in AsyncStorage (Helpline agent simulation)
  useEffect(() => {
    if (viewMode !== 'chat' || !activeTicket) return;

    const interval = setInterval(async () => {
      try {
        const stored = await AsyncStorage.getItem(`active_ticket_${user?.id}`);
        if (stored) {
          const ticket = JSON.parse(stored);
          if (activeTicket.status !== ticket.status) {
            // Trigger push notification banner
            triggerPushNotification(
              localIsTamil ? 'கோரிக்கை நிலை மாற்றப்பட்டது' : 'Request Status Updated',
              localIsTamil
                ? `உங்கள் கோரிக்கை #${ticket.id} நிலை: ${getStatusLabel(ticket.status, true)}`
                : `Your Request #${ticket.id} status changed to: ${getStatusLabel(ticket.status, false)}`
            );
            setActiveTicket(ticket);

            // Add automated agent update message in chat
            const updateMsg = {
              id: `sys-${Date.now()}`,
              sender: 'agent',
              content: localIsTamil
                ? `📢 கோரிக்கை நிலை மாற்றப்பட்டது: ${getStatusLabel(ticket.status, true)}`
                : `📢 Request status updated to: ${getStatusLabel(ticket.status, false)}`,
              created_at: new Date().toISOString(),
              isSystem: true
            };

            const updatedMsgs = [...messages, updateMsg];
            setMessages(updatedMsgs);
            await AsyncStorage.setItem(`support_msgs_${ticket.id}`, JSON.stringify(updatedMsgs));
          }
        }
      } catch (e) {
        console.error('Error matching ticket sync:', e);
      }
    }, 3000); // Check every 3s

    return () => clearInterval(interval);
  }, [viewMode, activeTicket, messages, localIsTamil]);

  const getStatusLabel = (statusKey: string, isTamil: boolean) => {
    const step = STATUS_STEPS.find(s => s.key === statusKey);
    if (!step) return statusKey;
    return isTamil ? step.labelTa : step.label;
  };

  const getInitialWelcomeMessages = (ticket: any) => {
    const time = new Date().toISOString();
    return [
      {
        id: 'w-1',
        sender: 'agent',
        content: localIsTamil
          ? `வணக்கம்! என் பெயர் அர்ச்சனா. உழவர்வளம் உதவி மையத்திலிருந்து உங்களை வரவேற்கிறேன்.`
          : `Hello! I am Agent Archana from AgriConnect Customer Care.`,
        created_at: time
      },
      {
        id: 'w-2',
        sender: 'agent',
        content: localIsTamil
          ? `உங்களது பொருள் கோரிக்கை #${ticket.id} பெறப்பட்டது. தயாரிப்பு: "${ticket.productName}" (அளவு: ${ticket.quantity}). நாங்கள் உங்களைச் சுற்றியுள்ள பொருத்தமான விவசாயிகளைத் தேடி வருகிறோம்.`
          : `We received your Product Request #${ticket.id} for "${ticket.productName}" (Qty: ${ticket.quantity}). I am scanning our registered farmers in ${ticket.preferredDistrict || 'Coimbatore'} to fulfill your resource requirement.`,
        created_at: time
      }
    ];
  };

  const handleSubmitTicket = async () => {
    if (!productName.trim() || !quantity.trim() || !preferredDistrict || !preferredVillage.trim() || !deliveryDate.trim()) {
      Alert.alert(
        localIsTamil ? 'பிழை' : 'Error',
        localIsTamil ? 'அனைத்து முக்கிய புலங்களையும் நிரப்பவும்' : 'Please fill all required fields'
      );
      return;
    }

    setSubmittingTicket(true);
    try {
      const ticketId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: ticketId,
        buyerId: user?.id,
        buyerName: user?.user_metadata?.full_name || 'Agri Buyer',
        buyerPhone: user?.user_metadata?.phone || '+91 99999 88888',
        productName,
        quantity: `${quantity} ${quantityUnit}`,
        preferredDistrict,
        preferredVillage,
        location: `${preferredVillage}, ${preferredDistrict}`,
        deliveryDate,
        budget: budget ? `₹${budget}` : 'Not Specified',
        urgency,
        notes,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // 1. Save to Supabase if live mode
      if (!demoMode && process.env.EXPO_PUBLIC_SUPABASE_URL) {
        try {
          await supabase.from('support_tickets').insert(newTicket);
        } catch (dbErr) {
          console.warn('DB ticket insertion failed, proceeding locally:', dbErr);
        }
      }

      // 2. Save active ticket to AsyncStorage
      await AsyncStorage.setItem(`active_ticket_${user?.id}`, JSON.stringify(newTicket));

      // Append to the list of all tickets for agent visibility
      const allTicketsStored = await AsyncStorage.getItem('global_support_tickets');
      const allTicketsList = allTicketsStored ? JSON.parse(allTicketsStored) : [];
      allTicketsList.unshift(newTicket);
      await AsyncStorage.setItem('global_support_tickets', JSON.stringify(allTicketsList));

      setActiveTicket(newTicket);
      
      const welcome = getInitialWelcomeMessages(newTicket);
      setMessages(welcome);
      await AsyncStorage.setItem(`support_msgs_${ticketId}`, JSON.stringify(welcome));

      triggerPushNotification(
        localIsTamil ? 'கோரிக்கை பெறப்பட்டது' : 'Request Received',
        localIsTamil 
          ? `உங்களது தயாரிப்பு உதவி கோரிக்கை #${ticketId} பெறப்பட்டது.`
          : `Product request #${ticketId} received and queued for matching.`
      );

      setViewMode('chat');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (textToSend: string, imageUri?: string, locationCoords?: { lat: number; lng: number; address: string }) => {
    if (!textToSend.trim() && !imageUri && !locationCoords || !activeTicket) return;

    const tempId = `m-opt-${Date.now()}`;
    const userMsg = {
      id: tempId,
      sender: 'user',
      content: textToSend,
      image: imageUri,
      location: locationCoords,
      created_at: new Date().toISOString()
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setNewMessage('');
    await AsyncStorage.setItem(`support_msgs_${activeTicket.id}`, JSON.stringify(updatedMsgs));

    // Scroll to end
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate Agent response based on content types
    if (imageUri) {
      setAgentTyping(true);
      setTimeout(async () => {
        const agentReply = {
          id: `agent-reply-${Date.now()}`,
          sender: 'agent',
          content: localIsTamil 
            ? "நன்றி, நீங்கள் அனுப்பிய புகைப்படம் கிடைத்தது. FPO குழுவிற்கு இதனைப் பகிர்ந்துள்ளேன்."
            : "Thank you for sharing the photo. I have forwarded this to our local farmer cooperative inspectors to verify quality.",
          created_at: new Date().toISOString()
        };
        const finalMsgs = [...updatedMsgs, agentReply];
        setMessages(finalMsgs);
        setAgentTyping(false);
        await AsyncStorage.setItem(`support_msgs_${activeTicket.id}`, JSON.stringify(finalMsgs));
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
      }, 1500);
    } else if (locationCoords) {
      setAgentTyping(true);
      setTimeout(async () => {
        const agentReply = {
          id: `agent-reply-${Date.now()}`,
          sender: 'agent',
          content: localIsTamil 
            ? `நன்றி, உங்களது இருப்பிடம் பெறப்பட்டது (${locationCoords.address}). இதன் அடிப்படையில் அருகில் உள்ள விவசாயிகளைத் தேடுகிறோம்.`
            : `Thank you for sharing your location at ${locationCoords.address}. We are checking for farmers within a 15km radius.`,
          created_at: new Date().toISOString()
        };
        const finalMsgs = [...updatedMsgs, agentReply];
        setMessages(finalMsgs);
        setAgentTyping(false);
        await AsyncStorage.setItem(`support_msgs_${activeTicket.id}`, JSON.stringify(finalMsgs));
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
      }, 1500);
    } else {
      triggerAgentSimulatedReply(textToSend, updatedMsgs);
    }
  };

  const triggerAgentSimulatedReply = (userText: string, currentMsgsList: any[]) => {
    setAgentTyping(true);

    const txt = userText.toLowerCase();
    let replyText = '';

    if (txt.includes('time') || txt.includes('நேரம்') || txt.includes('எப்போது')) {
      replyText = localIsTamil
        ? `பொதுவாக பொருத்தமான விவசாயியைக் கண்டறிய 2 முதல் 4 மணிநேரம் ஆகும். எங்களின் FPO குழு உங்களுக்காக வேலை செய்து வருகிறது.`
        : `It typically takes 2-4 hours to match demand with regional farm surpluses. Our local helpline team is coordinating with Salem & Coimbatore FPOs.`;
    } else if (txt.includes('quantity') || txt.includes('அளவு') || txt.includes('மாற்ற')) {
      replyText = localIsTamil
        ? `நிச்சயமாக, உங்கள் கொள்முதல் அளவைத் திருத்த விரும்பினால் எனக்கு இங்கு பதிவிடவும். நான் டிக்கெட்டில் புதுப்பித்துக் கொள்கிறேன்.`
        : `Sure, if you'd like to adjust the requested quantity of ${activeTicket.productName}, just let me know the new value here.`;
    } else if (txt.includes('close') || txt.includes('முடிக்க') || txt.includes('ரத்து')) {
      replyText = localIsTamil
        ? `இந்தக் கோரிக்கையை முடிக்க விரும்புகிறீர்களா? நான் இந்த உதவி டிக்கெட்டை உடனே பூர்த்தி செய்து விடுகிறேன்.`
        : `Understood. If you have fulfilled your procurement, I can mark this ticket as Completed. Shall I proceed?`;
    } else {
      replyText = localIsTamil
        ? `புரிந்தது. உங்களது செய்தி சேமிக்கப்பட்டது. விவசாயிகளைத் தொடர்பு கொண்டுவிட்டு உங்களுக்கு உடனே அழைப்பு விடுக்கிறோம்.`
        : `Received. I am sharing this requirement with the cooperative farmers group. I'll notify you here once a supplier responds.`;
    }

    setTimeout(async () => {
      const agentReply = {
        id: `agent-reply-${Date.now()}`,
        sender: 'agent',
        content: replyText,
        created_at: new Date().toISOString()
      };

      const finalMsgs = [...currentMsgsList, agentReply];
      setMessages(finalMsgs);
      setAgentTyping(false);
      await AsyncStorage.setItem(`support_msgs_${activeTicket.id}`, JSON.stringify(finalMsgs));
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }, 2000); // 2 seconds simulated typing delay
  };

  const handleCloseTicket = () => {
    Alert.alert(
      localIsTamil ? 'டிக்கெட்டை முடிக்கவும்' : 'Complete Ticket',
      localIsTamil ? 'இந்த உதவி டிக்கெட்டை மூட விரும்புகிறீர்களா?' : 'Are you sure you want to resolve and close this ticket?',
      [
        { text: localIsTamil ? 'இல்லை' : 'Cancel', style: 'cancel' },
        { 
          text: localIsTamil ? 'ஆம், மூடு' : 'Yes, Close', 
          onPress: async () => {
            if (activeTicket) {
              // Mark complete locally and in list
              const stored = await AsyncStorage.getItem(`active_ticket_${user?.id}`);
              if (stored) {
                const ticket = JSON.parse(stored);
                ticket.status = 'completed';
                await AsyncStorage.setItem(`active_ticket_${user?.id}`, JSON.stringify(ticket));
                
                // Update global support list as well
                const allTicketsStored = await AsyncStorage.getItem('global_support_tickets');
                if (allTicketsStored) {
                  const list = JSON.parse(allTicketsStored);
                  const index = list.findIndex((t: any) => t.id === ticket.id);
                  if (index !== -1) {
                    list[index].status = 'completed';
                    await AsyncStorage.setItem('global_support_tickets', JSON.stringify(list));
                  }
                }
              }
            }
            await AsyncStorage.removeItem(`active_ticket_${user?.id}`);
            setActiveTicket(null);
            setViewMode('form');
          } 
        }
      ]
    );
  };

  const renderTimeline = () => {
    const currentStatusIdx = STATUS_STEPS.findIndex(s => s.key === activeTicket?.status);

    return (
      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>{localIsTamil ? 'கோரிக்கை முன்னேற்ற காலவரிசை' : 'Procurement Ticket Timeline'}</Text>
        <View style={styles.stepsContainer}>
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIdx;
            const isCurrent = idx === currentStatusIdx;

            return (
              <View key={step.key} style={styles.stepItem}>
                <View style={styles.stepDotContainer}>
                  <View style={[
                    styles.stepDot, 
                    isCompleted ? styles.stepDotCompleted : styles.stepDotPending,
                    isCurrent && styles.stepDotCurrent
                  ]}>
                    {isCompleted ? <CheckCircle size={10} color="white" /> : <Clock size={10} color="#94a3b8" />}
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[
                      styles.stepLine, 
                      idx < currentStatusIdx ? styles.stepLineCompleted : styles.stepLinePending
                    ]} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel, 
                  isCurrent && styles.stepLabelCurrent,
                  isCompleted && !isCurrent && styles.stepLabelCompleted
                ]}>
                  {localIsTamil ? step.labelTa : step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // AI-Powered suggested questions
  const getAISuggestedReplies = () => {
    if (localIsTamil) {
      return [
        { label: 'எப்போது கிடைக்கும்?', text: 'விவசாயியைக் கண்டறிய எவ்வளவு நேரம் ஆகும்?' },
        { label: 'அளவைத் திருத்த விரும்புகிறேன்', text: 'எனது கொள்முதல் தேவையின் அளவை மாற்ற விரும்புகிறேன்.' },
        { label: 'தேவை முடிந்தது', text: 'எனது கொள்முதல் தேவை முடிந்தது, டிக்கெட்டை மூடலாம்.' }
      ];
    } else {
      return [
        { label: 'How long will it take?', text: 'How long will it take to find a supplier?' },
        { label: 'Change requested quantity', text: 'I need to adjust my requested quantity.' },
        { label: 'Procurement fulfilled', text: 'I have found a supplier, please close this ticket.' }
      ];
    }
  };

  const renderMessageBubble = ({ item }: { item: any }) => {
    const isMe = item.sender === 'user';
    if (item.isSystem) {
      return (
        <View style={styles.systemMsgContainer}>
          <Text style={styles.systemMsgText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {item.image && (
            <Image 
              source={{ uri: item.image }} 
              style={{ width: 200, height: 130, borderRadius: 12, marginBottom: 6 }} 
              resizeMode="cover"
            />
          )}
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <MapPin size={16} color={isMe ? 'white' : '#15803d'} />
              <Text style={[styles.bubbleText, isMe ? styles.myText : styles.theirText, { fontWeight: 'bold', fontSize: 12 }]}>
                {isMe ? 'Shared Location:' : 'Location Pin:'}
              </Text>
            </View>
          )}
          {item.content ? (
            <Text style={[styles.bubbleText, isMe ? styles.myText : styles.theirText]}>
              {item.content}
            </Text>
          ) : item.location ? (
            <Text style={[styles.bubbleText, isMe ? styles.myText : styles.theirText, { fontSize: 11 }]}>
              {item.location.address}
            </Text>
          ) : null}
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {pushNotification && (
        <View style={styles.pushNotificationBanner}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.pushNotificationGradient}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.pushNotificationTitle}>{pushNotification.title}</Text>
              <Text style={styles.pushNotificationBody}>{pushNotification.body}</Text>
            </View>
            <TouchableOpacity onPress={() => setPushNotification(null)} style={styles.pushNotificationClose}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        
        {viewMode === 'chat' ? (
          <View style={styles.agentHeader}>
            <View style={styles.avatar}>
              <User color="#15803d" size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>{localIsTamil ? 'முகவர் அர்ச்சனா' : 'Agent Archana'}</Text>
              <Text style={styles.headerStatus}>{localIsTamil ? 'ஆன்லைனில்' : 'Online'}</Text>
            </View>
          </View>
        ) : (
          <View style={{flex: 1}}>
            <Text style={styles.headerMainTitle}>{localIsTamil ? 'உதவி & விசாரணைகள்' : 'Help & Enquiries'}</Text>
          </View>
        )}

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.langToggle} 
            onPress={() => setLocalIsTamil(!localIsTamil)}
          >
            <Globe color="white" size={16} />
            <Text style={styles.langToggleText}>{localIsTamil ? 'English' : 'தமிழ்'}</Text>
          </TouchableOpacity>
          
          {viewMode === 'chat' && (
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseTicket}>
              <Text style={styles.closeBtnTxt}>{localIsTamil ? 'முடி' : 'Close'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#15803d" />
        </View>
      ) : viewMode === 'form' ? (
        /* ================= 1. PROCUREMENT FORM ================= */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.formContainer}>
            <View style={styles.formCard}>
              <View style={styles.formIntro}>
                <MessageSquare color="#15803d" size={32} />
                <Text style={styles.formIntroTitle}>
                  {localIsTamil ? 'கொள்முதல் உதவி மையம்' : 'Procurement Assistance'}
                </Text>
                <Text style={styles.formIntroDesc}>
                  {localIsTamil
                    ? 'உங்களுக்குத் தேவையான பயிர்க்கழிவுகள் சந்தையில் இல்லையெனில், இந்த விண்ணப்பத்தைப் பூர்த்தி செய்யவும். எங்கள் உதவி குழு உங்களுக்கு விவசாயிகளைத் தேடித் தரும்.'
                    : 'If crop residues are out of stock, list your requirements below. Our helpline team will coordinates directly with farmers.'}
                </Text>
              </View>

              {/* Form Input fields */}
              <Text style={styles.inputLabel}>{localIsTamil ? 'தேவையான தயாரிப்பு பெயர் *' : 'Product Name Required *'}</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={localIsTamil ? "உதாரணம்: நெல் வைக்கோல், தேங்காய் மட்டை" : "e.g. Paddy Straw, Sugarcane Bagasse"}
                value={productName}
                onChangeText={setProductName}
                placeholderTextColor="#94a3b8"
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>{localIsTamil ? 'தேவைப்படும் அளவு *' : 'Quantity Required *'}</Text>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="e.g. 5"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>{localIsTamil ? 'அலகு *' : 'Unit *'}</Text>
                  <View style={{ flexDirection: 'row', gap: 4, height: 44 }}>
                    {['kg', 'Tons', 'Bales'].map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.urgencyBtn,
                          { flex: 1, paddingVertical: 0, justifyContent: 'center' },
                          quantityUnit === unit && { backgroundColor: '#15803d', borderColor: '#15803d' }
                        ]}
                        onPress={() => setQuantityUnit(unit)}
                      >
                        <Text style={[styles.urgencyBtnText, quantityUnit === unit && { color: 'white' }, { fontSize: 11 }]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>{localIsTamil ? 'விருப்பமான மாவட்டம் *' : 'Preferred District *'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 6 }}>
                {['Coimbatore', 'Salem', 'Erode', 'Tiruchirappalli', 'Thanjavur', 'Chennai'].map(dist => (
                  <TouchableOpacity
                    key={dist}
                    style={[
                      styles.filterChip,
                      { marginRight: 8, paddingVertical: 8, height: 36 },
                      preferredDistrict === dist && { backgroundColor: '#15803d', borderColor: '#15803d' }
                    ]}
                    onPress={() => setPreferredDistrict(dist)}
                  >
                    <Text style={[styles.filterChipText, preferredDistrict === dist && { color: 'white' }]}>
                      {localIsTamil 
                        ? (dist === 'Coimbatore' ? 'கோவை' : dist === 'Tiruchirappalli' ? 'திருச்சி' : dist === 'Thanjavur' ? 'தஞ்சாவூர்' : dist === 'Chennai' ? 'சென்னை' : dist === 'Salem' ? 'சேலம்' : 'ஈரோடு')
                        : dist}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>{localIsTamil ? 'விருப்பமான கிராமம் *' : 'Preferred Village *'}</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={localIsTamil ? "உதாரணம்: பொள்ளாச்சி, ஒரத்தநாடு" : "e.g. Pollachi, Gobi, Orathanadu"}
                value={preferredVillage}
                onChangeText={setPreferredVillage}
                placeholderTextColor="#94a3b8"
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{localIsTamil ? 'டெலிவரி தேதி *' : 'Delivery Date *'}</Text>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={deliveryDate}
                    onChangeText={setDeliveryDate}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{localIsTamil ? 'பட்ஜெட் (விருப்பம்)' : 'Budget (Optional)'}</Text>
                  <TextInput 
                    style={styles.textInput}
                    placeholder={localIsTamil ? "உதாரணம்: ₹5000" : "e.g. 5000"}
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>{localIsTamil ? 'அவசர நிலை' : 'Urgency Level'}</Text>
              <View style={styles.urgencyContainer}>
                {['Low', 'Medium', 'High', 'Urgent'].map(level => {
                  const colors = { Low: '#3b82f6', Medium: '#ca8a04', High: '#f97316', Urgent: '#ef4444' };
                  const isSelected = urgency === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyBtn, 
                        isSelected && { backgroundColor: colors[level as keyof typeof colors], borderColor: colors[level as keyof typeof colors] }
                      ]}
                      onPress={() => setUrgency(level as any)}
                    >
                      <Text style={[styles.urgencyBtnText, isSelected && { color: 'white' }]}>
                        {localIsTamil 
                          ? (level === 'Low' ? 'குறைவு' : level === 'Medium' ? 'நடுத்தரம்' : level === 'High' ? 'அதிகம்' : 'அவசியம்')
                          : level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>{localIsTamil ? 'கூடுதல் குறிப்புகள் / தேவைகள்' : 'Additional Requirements'}</Text>
              <TextInput 
                style={[styles.textInput, styles.multilineInput]}
                placeholder={localIsTamil ? "போக்குவரத்து வசதி, ஈரப்பதம் போன்ற விபரங்கள்..." : "Details on transport, moisture bounds, etc..."}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmitTicket}
                disabled={submittingTicket}
              >
                {submittingTicket ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {localIsTamil ? 'கோரிக்கையை சமர்ப்பி' : 'Raise Product Request'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        /* ================= 2. MESSAGING INTERFACE ================= */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Progress Timeline Tracker */}
          {renderTimeline()}

          {/* Recommended Farmers Quotation Card */}
          {activeTicket && (activeTicket.status === 'found' || activeTicket.status === 'notified') && matchedFarmers.length > 0 && (
            <View style={styles.quoteRecommendationBox}>
              <Text style={styles.quoteRecommendationTitle}>
                {localIsTamil ? '🌾 பொருத்தமான உழவர் விலைப் புள்ளிகள்' : '🌾 Matching Farmer Quotations'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                {matchedFarmers.map(farmer => {
                  // Simulate rating and distance if missing
                  const rating = farmer.rating || 4.7;
                  const distance = farmer.location.toLowerCase().includes('pollachi') ? '3.8 km' : '11.5 km';
                  return (
                    <View key={farmer.id} style={styles.miniQuoteCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.quoteFarmerName} numberOfLines={1}>{farmer.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Star size={10} color="#eab308" fill="#eab308" />
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569' }}>{rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.quoteDetails} numberOfLines={1}>{farmer.location} • {distance}</Text>
                      <Text style={styles.quotePrice}>₹{farmer.price} <Text style={{ fontSize: 10, fontWeight: 'normal', color: '#64748b' }}>({farmer.quantity})</Text></Text>
                      <TouchableOpacity 
                        style={styles.selectQuoteBtn}
                        onPress={() => handleSelectFarmerQuote(farmer)}
                      >
                        <Text style={styles.selectQuoteBtnText}>{localIsTamil ? 'தேர்வு செய்க' : 'Choose Farmer'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageBubble}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Typing Indicator */}
          {agentTyping && (
            <View style={styles.typingIndicatorContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
              </View>
              <Text style={styles.typingTxt}>{localIsTamil ? 'அர்ச்சனா தட்டச்சு செய்கிறார்...' : 'Archana is typing...'}</Text>
            </View>
          )}

          {/* AI suggested responses */}
          <View style={styles.aiRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12 }}>
              {getAISuggestedReplies().map((reply, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.aiReplyChip}
                  onPress={() => handleSendMessage(reply.text)}
                >
                  <Text style={styles.aiReplyChipText}>{reply.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Input Footer */}
          <View style={styles.inputArea}>
            <TouchableOpacity 
              style={styles.attachBtn}
              onPress={() => {
                // Simulate attaching location
                Alert.alert(
                  localIsTamil ? 'இருப்பிடத்தைப் பகிர்க' : 'Share Location',
                  localIsTamil ? 'உங்கள் தற்போதைய இருப்பிடத்தை உதவி மையத்திற்கு அனுப்ப விரும்புகிறீர்களா?' : 'Do you want to share your current GPS location coordinates with support?',
                  [
                    { text: localIsTamil ? 'இல்லை' : 'Cancel' },
                    { 
                      text: localIsTamil ? 'ஆம், அனுப்பு' : 'Yes, Share',
                      onPress: () => handleSendMessage('', undefined, { lat: 11.0168, lng: 76.9558, address: 'Pollachi, Coimbatore' })
                    }
                  ]
                );
              }}
            >
              <MapPin color="#15803d" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachBtn}
              onPress={() => {
                // Simulate attaching image
                Alert.alert(
                  localIsTamil ? 'புகைப்படம் அனுப்பவும்' : 'Send Photo',
                  localIsTamil ? 'பயிர்க்கழிவின் புகைப்படத்தை உதவி மையத்திற்கு அனுப்ப விரும்புகிறீர்களா?' : 'Select a photo of your agricultural residue to send to support.',
                  [
                    { text: localIsTamil ? 'இல்லை' : 'Cancel' },
                    { 
                      text: localIsTamil ? 'படம் 1' : 'Photo 1',
                      onPress: () => handleSendMessage('', 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=400')
                    },
                    { 
                      text: localIsTamil ? 'படம் 2' : 'Photo 2',
                      onPress: () => handleSendMessage('', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=400')
                    }
                  ]
                );
              }}
            >
              <ImageIcon color="#15803d" size={20} />
            </TouchableOpacity>

            <TextInput 
              style={styles.messageTextInput}
              placeholder={localIsTamil ? "உதவி மையத்திடம் உரையாடத் தட்டச்சு செய்க..." : "Type a message to customer support..."}
              placeholderTextColor="#94a3b8"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={() => handleSendMessage(newMessage)}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.6 }]} 
              onPress={() => handleSendMessage(newMessage)}
              disabled={!newMessage.trim()}
            >
              <Send color="white" size={16} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#15803d', paddingTop: Platform.OS === 'android' ? 14 : 14 },
  backBtn: { padding: 4, marginRight: 10 },
  agentHeader: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
  headerStatus: { fontSize: 10, color: '#bbf7d0' },
  headerMainTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  langToggleText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  closeBtnTxt: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  
  // Form Styles
  formContainer: { padding: 16 },
  formCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  formIntro: { alignItems: 'center', marginBottom: 20 },
  formIntroTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 10, marginBottom: 6 },
  formIntroDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 6, marginTop: 12 },
  textInput: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  urgencyContainer: { flexDirection: 'row', gap: 8, marginTop: 6 },
  urgencyBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  urgencyBtnText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  submitBtn: { backgroundColor: '#15803d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, shadowColor: '#15803d', shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

  // Timeline Progress Styles
  timelineCard: { backgroundColor: 'white', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  timelineTitle: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  stepItem: { flex: 1, alignItems: 'center' },
  stepDotContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  stepDot: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stepDotCompleted: { backgroundColor: '#15803d' },
  stepDotPending: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' },
  stepDotCurrent: { backgroundColor: '#eab308', borderWidth: 2, borderColor: '#fef08a' },
  stepLine: { height: 2, flex: 1, position: 'absolute', left: '50%', right: '-50%', top: 8, zIndex: 1 },
  stepLineCompleted: { backgroundColor: '#15803d' },
  stepLinePending: { backgroundColor: '#cbd5e1' },
  stepLabel: { fontSize: 8, color: '#94a3b8', textAlign: 'center', marginTop: 6, paddingHorizontal: 2, fontWeight: '500' },
  stepLabelCurrent: { color: '#ca8a04', fontWeight: 'bold' },
  stepLabelCompleted: { color: '#15803d' },

  // Messaging Styles
  messagesContainer: { padding: 16, paddingBottom: 24 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '85%' },
  myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  myBubble: { backgroundColor: '#15803d', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  myText: { color: 'white' },
  theirText: { color: '#1f2937' },
  timeText: { fontSize: 9, color: '#94a3b8', marginTop: 4 },
  systemMsgContainer: { alignSelf: 'center', backgroundColor: '#fefce8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginVertical: 12, borderWidth: 1, borderColor: '#fef08a' },
  systemMsgText: { color: '#854d0e', fontSize: 11, fontWeight: 'bold' },

  // Typing indicator styles
  typingIndicatorContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  typingBubble: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, gap: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94a3b8' },
  typingTxt: { fontSize: 11, color: '#94a3b8' },

  // AI suggested replies
  aiRepliesContainer: { paddingVertical: 8, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  aiReplyChip: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  aiReplyChipText: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },

  // Footer Input area
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10, alignItems: 'center' },
  messageTextInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, color: '#0f172a' },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#15803d', justifyContent: 'center', alignItems: 'center' },
  attachBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },

  // Push Notification styles
  pushNotificationBanner: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 1000, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  pushNotificationGradient: { padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  pushNotificationTitle: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  pushNotificationBody: { color: '#dcfce7', fontSize: 12, marginTop: 2 },
  pushNotificationClose: { paddingHorizontal: 10, paddingVertical: 4 },

  // Quotation recommendations styles
  quoteRecommendationBox: { backgroundColor: '#f0fdf4', padding: 12, borderBottomWidth: 1, borderBottomColor: '#dcfce7' },
  quoteRecommendationTitle: { fontSize: 12, fontWeight: 'bold', color: '#15803d', marginBottom: 8 },
  miniQuoteCard: { backgroundColor: 'white', borderRadius: 12, padding: 10, width: 160, borderWidth: 1, borderColor: '#dcfce7', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  quoteFarmerName: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  quoteDetails: { fontSize: 10, color: '#64748b', marginTop: 2 },
  quotePrice: { fontSize: 12, fontWeight: 'bold', color: '#15803d', marginTop: 4 },
  selectQuoteBtn: { backgroundColor: '#15803d', borderRadius: 6, paddingVertical: 6, alignItems: 'center', marginTop: 8 },
  selectQuoteBtnText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // Filter chips (used in form)
  filterChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipText: { color: '#64748b', fontWeight: '600', fontSize: 12 }
});

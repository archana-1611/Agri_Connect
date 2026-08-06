import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Upload, MapPin, Sparkles, Navigation, Mic, Check } from 'lucide-react-native';
import { useResources } from '../../context/ResourceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CROP_AI_CONSULTS } from '../../constants/DemoData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const CROPS = [
  { id: 'paddy', name: 'Paddy', nameTa: 'நெல்', emoji: '🌾' },
  { id: 'sugarcane', name: 'Sugarcane', nameTa: 'கரும்பு', emoji: '🎋' },
  { id: 'coconut', name: 'Coconut', nameTa: 'தேங்காய்', emoji: '🥥' },
  { id: 'banana', name: 'Banana', nameTa: 'வாழை', emoji: '🍌' },
  { id: 'maize', name: 'Maize', nameTa: 'சோளம்', emoji: '🌽' },
  { id: 'groundnut', name: 'Groundnut', nameTa: 'நிலக்கடலை', emoji: '🥜' },
  { id: 'cotton', name: 'Cotton', nameTa: 'பருத்தி', emoji: '☁️' },
  { id: 'arecanut', name: 'Arecanut', nameTa: 'பாக்கு', emoji: '🍃' },
  { id: 'sesame', name: 'Sesame', nameTa: 'எள்', emoji: '🌱' },
  { id: 'millets', name: 'Millets', nameTa: 'சிறுதானியம்', emoji: '🌾' }
];

export default function AddResourceScreen() {
  const { addResource } = useResources();
  const { isTamil } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    prefillTitle?: string;
    prefillQuantity?: string;
    prefillPrice?: string;
    prefillCategory?: string;
    prefillFromAi?: string;
  }>();

  // Core Form Fields
  const [title, setTitle] = useState(params.prefillTitle || '');
  const [category, setCategory] = useState(params.prefillCategory || 'crop residues');
  const [quantity, setQuantity] = useState(params.prefillQuantity || '');
  const [price, setPrice] = useState(params.prefillPrice || '');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState('');

  React.useEffect(() => {
    if (params.prefillTitle) setTitle(params.prefillTitle);
    if (params.prefillQuantity) setQuantity(params.prefillQuantity);
    if (params.prefillPrice) setPrice(params.prefillPrice);
    if (params.prefillCategory) setCategory(params.prefillCategory);
  }, [params.prefillTitle, params.prefillQuantity, params.prefillPrice, params.prefillCategory]);

  // UI Interactive States
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      
      // Seed values mimicking the user speaking
      setSelectedCrop('Paddy');
      setTitle(isTamil ? 'அறுவடைக்கு பிந்தைய நெல் வைக்கோல்' : 'Post-Harvest Paddy Straw Bales');
      setCategory('crop residues');
      setQuantity('12000');
      setPrice('36000');
      
      const userLoc = user?.user_metadata?.location || 'Pollachi, Coimbatore';
      setLocation(userLoc);

      Alert.alert(
        isTamil ? 'குரல் பதிவு கண்டறியப்பட்டது' : 'Voice Input Detected', 
        isTamil 
          ? '"பொள்ளாச்சியில் 4 ஏக்கர் நெல் அறுவடைக்கு பின் கிடைக்கும் 12000 கிலோ வைக்கோலை 36000 ரூபாய்க்கு விற்க வேண்டும்"' 
          : '"I have 12000 kilograms of Paddy Straw to sell for 36000 rupees from my farm in Pollachi."'
      );
    }, 2200);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      let locName = '';
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const name = addr.district || addr.city || addr.subregion || addr.name || '';
        const region = addr.region || '';
        if (name) {
          locName = region ? `${name}, ${region}` : name;
        }
      }
      
      if (locName) {
        setLocation(locName);
        Alert.alert(
          isTamil ? 'இடம் கண்டறியப்பட்டது' : 'GPS Location Captured',
          isTamil 
            ? `${locName} வெற்றிகரமாக கண்டறியப்பட்டது.` 
            : `${locName} has been automatically captured via GPS.`
        );
      } else {
        throw new Error('Could not resolve address');
      }
    } catch (error) {
      console.warn("GPS Location Error:", error);
      // Fallback to user profile location
      const userLoc = user?.user_metadata?.location || 'Pollachi, Coimbatore';
      const userPincode = user?.user_metadata?.pincode ? `, ${user?.user_metadata?.pincode}` : '';
      setLocation(`${userLoc}${userPincode}`);
      Alert.alert(
        isTamil ? 'தவறு' : 'Fallback Used',
        isTamil ? 'தானியங்கி இருப்பிடம் கிடைக்கவில்லை. சுயவிவர இருப்பிடம் பயன்படுத்தப்படுகிறது.' : 'GPS failed. Using profile location.'
      );
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleImagePick = async () => {
    Alert.alert(
      isTamil ? 'படத்தின் ஆதாரம்' : 'Select Photo Source',
      isTamil ? 'புகைப்படத்தை எவ்வாறு சேர்க்க விரும்புகிறீர்கள்?' : 'How would you like to add the photo?',
      [
        {
          text: isTamil ? 'கேலரியில் இருந்து தேர்ந்தெடு' : 'Choose from Gallery',
          onPress: async () => {
            try {
              setUploadingImage(true);
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                  setImageUri(`data:image/jpeg;base64,${asset.base64}`);
                } else {
                  setImageUri(asset.uri);
                }
                Alert.alert(
                  isTamil ? 'புகைப்படம் தேர்ந்தெடுக்கப்பட்டது' : 'Image Selected',
                  isTamil ? 'புகைப்படம் வெற்றிகரமாக இணைக்கப்பட்டது!' : 'Residue image successfully loaded!'
                );
              }
            } catch (e) {
              console.error("Gallery picker error:", e);
              Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'படம் தேர்ந்தெடுப்பதில் தோல்வி.' : 'Failed to select image.');
            } finally {
              setUploadingImage(false);
            }
          }
        },
        {
          text: isTamil ? 'கேமராவை பயன்படுத்து' : 'Take a Photo',
          onPress: async () => {
            try {
              const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraStatus !== 'granted') {
                Alert.alert(
                  isTamil ? 'அனுமதி தேவை' : 'Permission Required',
                  isTamil ? 'கேமராவை பயன்படுத்த அனுமதி தேவை.' : 'Camera permission is required to capture photos.'
                );
                return;
              }

              setUploadingImage(true);
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                  setImageUri(`data:image/jpeg;base64,${asset.base64}`);
                } else {
                  setImageUri(asset.uri);
                }
                Alert.alert(
                  isTamil ? 'புகைப்படம் பிடிக்கப்பட்டது' : 'Photo Captured',
                  isTamil ? 'படம் வெற்றிகரமாக பிடிக்கப்பட்டு இணைக்கப்பட்டது!' : 'Photo captured and loaded successfully!'
                );
              }
            } catch (e) {
              console.error("Camera capture error:", e);
              Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'படம் எடுப்பதில் தோல்வி.' : 'Failed to capture photo.');
            } finally {
              setUploadingImage(false);
            }
          }
        },
        {
          text: isTamil ? 'ரத்து செய்' : 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateBuyerChatWithFarmerMatch = async (ticketId: string, farmerTitle: string, farmerLoc: string, farmerPrice: number, farmerQty: string) => {
    try {
      const storedMsgs = await AsyncStorage.getItem(`support_msgs_${ticketId}`);
      const list = storedMsgs ? JSON.parse(storedMsgs) : [];
      const matchMsg = {
        id: `sys-match-auto-${Date.now()}`,
        sender: 'agent',
        content: isTamil
          ? `📢 புதிய பயிர்க்கழிவு கண்டறியப்பட்டது! விவசாயி ${farmerTitle} (${farmerLoc}) ₹${farmerPrice} விலையில் வளம் பட்டியலிட்டுள்ளார். நிலை: விவசாயி கண்டறியப்பட்டார்.`
          : `📢 Farmer Found: Farmer ${farmerTitle} in ${farmerLoc} listed matching crop residue at ₹${farmerPrice} for Qty: ${farmerQty}. Status: Farmer Found.`,
        created_at: new Date().toISOString(),
        isSystem: true
      };
      list.push(matchMsg);
      await AsyncStorage.setItem(`support_msgs_${ticketId}`, JSON.stringify(list));
    } catch (e) {
      console.error('Error updating matching buyer chat:', e);
    }
  };

  const handleSubmit = async () => {
    if (!title || !quantity || !price || !location) {
      Alert.alert(
        isTamil ? 'பிழை' : 'Error', 
        isTamil ? 'அனைத்து தேவைப்படும் புலங்களையும் நிரப்பவும்.' : 'Please fill in all required fields'
      );
      return;
    }
    
    setSubmitting(true);
    try {
      // Extract district from location string
      const locClean = location.split(',')[0].trim();
      const pincodeClean = location.match(/\d{6}/) ? location.match(/\d{6}/)?.[0] || '641001' : '641001';

      await addResource({
        title,
        titleTa: title,
        crop: selectedCrop,
        category,
        quantity: `${quantity} kg`,
        price: Number(price),
        location,
        district: locClean,
        village: user?.user_metadata?.village || locClean,
        pincode: pincodeClean,
        image_url: imageUri || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=600',
        description: `Organically harvested surplus residues of ${selectedCrop}.`,
        descriptionTa: `ஆர்கானிக் முறையில் அறுவடை செய்யப்பட்ட ${isTamil ? (selectedCrop === 'Paddy' ? 'நெல்' : selectedCrop === 'Sugarcane' ? 'கரும்பு' : selectedCrop) : selectedCrop} உபரி கழிவுகள்.`
      });

      // Scan active product requests matching this listed crop residue
      const allTicketsStored = await AsyncStorage.getItem('global_support_tickets');
      if (allTicketsStored) {
        const list = JSON.parse(allTicketsStored);
        let matchCount = 0;
        const updatedList = list.map((t: any) => {
          const tProd = t.productName.toLowerCase();
          const listedCrop = selectedCrop.toLowerCase();
          const listedTitle = title.toLowerCase();
          const isMatch = tProd.includes(listedCrop) || listedCrop.includes(tProd) || listedTitle.includes(tProd);

          if (isMatch && (t.status === 'pending' || t.status === 'searching')) {
            matchCount++;
            const updatedTicket = {
              ...t,
              status: 'found',
              matchedSupplier: user?.id,
              matchedSupplierName: title,
              matchedPrice: price
            };

            // Update buyer's active ticket
            AsyncStorage.setItem(`active_ticket_${t.buyerId}`, JSON.stringify(updatedTicket));

            // Append chat message to buyer's chat
            updateBuyerChatWithFarmerMatch(t.id, title, location, Number(price), `${quantity} kg`);

            return updatedTicket;
          }
          return t;
        });

        if (matchCount > 0) {
          await AsyncStorage.setItem('global_support_tickets', JSON.stringify(updatedList));
          // Notify the farmer that their listing matches an active request
          Alert.alert(
            isTamil ? 'பொருத்தம் கண்டறியப்பட்டது!' : 'Automatic Match Found!',
            isTamil
              ? `உங்கள் பயிர்க்கழிவு பட்டியல் ${matchCount} வாங்குபவர்களின் கோரிக்கைகளுடன் பொருந்துகிறது! உதவி குழு தொடர்பு கொள்ளும்.`
              : `Your residue listing matches ${matchCount} active buyer procurement request(s)! Direct matching notification sent to buyers.`
          );
        }
      }

      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success', 
        isTamil ? 'வளம் வெற்றிகரமாக பட்டியலிடப்பட்டது!' : 'Resource listed successfully on AgriConnect!'
      );
      router.push('/(tabs)/profile');
    } catch (err: any) {
      Alert.alert('Listing Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>
        {isTamil ? 'வளங்களை விற்க / பட்டியலிட' : 'List Harvest Surplus Resource'}
      </Text>

      {/* Dynamic Voice Autofill Bar */}
      <TouchableOpacity onPress={handleVoiceInput} disabled={isListening} style={styles.voiceClickArea}>
        <LinearGradient
          colors={isListening ? ['#fee2e2', '#fef2f2'] : ['#f0fdf4', '#dcfce7']}
          style={styles.voiceButton}
        >
          {isListening ? (
            <ActivityIndicator color="#ef4444" size="small" style={{marginRight: 8}} />
          ) : (
            <Mic color="#15803d" size={20} />
          )}
          <Text style={[styles.voiceButtonText, isListening && {color: '#ef4444'}]}>
            {isListening 
              ? (isTamil ? 'கவனித்துக் கொண்டிருக்கிறது...' : 'Listening to Speech...') 
              : (isTamil ? 'குரல் மூலம் தானாக நிரப்ப (Tap to Speak)' : 'Voice Auto-Fill (Tap to Speak)')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Crop Selection Row */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>{isTamil ? 'பயிரைத் தேர்ந்தெடுக்கவும் *' : 'Select Crop *'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropList}>
          {CROPS.map(crop => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.cropChip, selectedCrop.toLowerCase() === crop.name.toLowerCase() && styles.cropChipActive]}
              onPress={() => setSelectedCrop(crop.name)}
            >
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <Text style={[styles.cropText, selectedCrop.toLowerCase() === crop.name.toLowerCase() && styles.cropTextActive]}>
                {isTamil ? crop.nameTa : crop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= STANDARD LISTING FIELDS ================= */}
      <Text style={styles.subHeaderTitle}>
        {isTamil ? 'பட்டியல் விவரங்களை சரிபார்க்கவும்' : 'Resource Listing Details'}
      </Text>

      {/* Image Upload Box */}
      <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick} disabled={uploadingImage}>
        {uploadingImage ? (
          <ActivityIndicator color="#15803d" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
        ) : (
          <View style={{alignItems: 'center'}}>
            <Upload color="#94a3b8" size={32} />
            <Text style={styles.uploadText}>{isTamil ? 'வயல் காய்ந்த பயிர் படம் பதிவேற்றவும்' : 'Upload photo of crop residue'}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Text style={[styles.label, { width: 110, marginBottom: 0 }]}>{isTamil ? 'வளத்தின் பெயர் *' : 'Listing Title *'}</Text>
        <TextInput 
          style={[styles.input, { flex: 1 }]} 
          placeholder={isTamil ? "உதாரணம்: சோள தட்டு கட்டுகள்" : "e.g. Fine Organic Groundnut Shells"} 
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Text style={[styles.label, { width: 110, marginBottom: 0 }]}>{isTamil ? 'உபரியின் வகை *' : 'Category *'}</Text>
        <View style={[styles.categoriesRow, { flex: 1 }]}>
          {['crop residues', 'husk', 'seeds'].map(cat => (
            <TouchableOpacity 
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive, { flex: 1, paddingVertical: 10 }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive, { fontSize: 11 }]}>
                {cat === 'crop residues' ? (isTamil ? 'பயிர்க்கழிவு' : 'Residues') : cat === 'husk' ? (isTamil ? 'உமி' : 'Husk') : (isTamil ? 'விதை' : 'Seeds')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Text style={[styles.label, { width: 110, marginBottom: 0 }]}>{isTamil ? 'அளவு (கிலோ) *' : 'Quantity (kg) *'}</Text>
        <TextInput 
          style={[styles.input, { flex: 1 }]} 
          placeholder="e.g. 2000" 
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Text style={[styles.label, { width: 110, marginBottom: 0 }]}>{isTamil ? 'விலை (₹) *' : 'Total Price (₹) *'}</Text>
        <TextInput 
          style={[styles.input, { flex: 1 }]} 
          placeholder="e.g. 6000" 
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      {/* GPS Integrated Location input */}
      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Text style={[styles.label, { width: 110, marginBottom: 0 }]}>{isTamil ? 'முகவரி *' : 'Pickup Loc *'}</Text>
        <View style={[styles.locationInputContainer, { flex: 1 }]}>
          <MapPin color="#94a3b8" size={18} />
          <TextInput 
            style={styles.locationInput} 
            placeholder={isTamil ? "வட்டம், பின்கோட்" : "District, Pincode"} 
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#cbd5e1"
          />
          <TouchableOpacity style={styles.gpsBtn} onPress={handleDetectLocation} disabled={detectingLocation}>
            {detectingLocation ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Navigation color="white" size={14} />
                <Text style={styles.gpsBtnText}>GPS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitBtnText}>
            {isTamil ? 'வளத்தை வெளியிடு' : 'Publish Resource'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  subHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginTop: 24, marginBottom: 14 },
  voiceClickArea: { marginBottom: 16 },
  voiceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, borderColor: '#bbf7d0', borderWidth: 1 },
  voiceButtonText: { color: '#15803d', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  predictorCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#fef08a', shadowColor: '#ca8a04', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  predictorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#fef9c3', paddingBottom: 10 },
  predictorTitle: { fontSize: 15, fontWeight: 'bold', color: '#854d0e' },
  predictorLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  cropList: { flexDirection: 'row', marginBottom: 16 },
  cropChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cropChipActive: { backgroundColor: 'rgba(21, 128, 61, 0.1)', borderColor: '#15803d' },
  cropEmoji: { fontSize: 16, marginRight: 6 },
  cropText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  cropTextActive: { color: '#15803d' },
  acresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  acresVal: { fontSize: 14, fontWeight: 'bold', color: '#15803d' },
  sliderContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 16 },
  sliderTick: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  sliderTickActive: { backgroundColor: '#15803d' },
  sliderTickText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  sliderTickTextActive: { color: 'white' },
  predictionBox: { backgroundColor: '#fefdeb', borderRadius: 16, padding: 14, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#fcd34d' },
  predictionTitle: { fontSize: 13, fontWeight: 'bold', color: '#854d0e', marginBottom: 10 },
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  predictionLabel: { fontSize: 12, color: '#64748b' },
  predictionValue: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  predictionDesc: { fontSize: 10, color: '#a16207', textAlign: 'right', marginTop: 1 },
  predictionBuyersContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#fef08a', paddingTop: 6 },
  predictionBuyers: { fontSize: 11, color: '#15803d', fontWeight: 'bold', marginTop: 2 },
  tipTitle: { fontSize: 12, fontWeight: 'bold', color: '#a16207', marginTop: 12 },
  tipText: { fontSize: 11, color: '#854d0e', lineHeight: 16, marginTop: 2 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ca8a04', paddingVertical: 10, borderRadius: 8, marginTop: 14, gap: 6 },
  applyBtnTxt: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  imageUpload: { height: 130, backgroundColor: '#f1f5f9', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  uploadText: { color: '#94a3b8', fontSize: 12, marginTop: 8, fontWeight: '500' },
  uploadedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 10, fontSize: 15, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  categoriesRow: { flexDirection: 'row', gap: 8 },
  catChip: { flex: 1, backgroundColor: 'white', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  catChipActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  catChipText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  catChipTextActive: { color: 'white' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  locationInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 12 },
  locationInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, fontSize: 15, color: '#0f172a' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  gpsBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  submitBtn: { backgroundColor: '#15803d', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

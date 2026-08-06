import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { User, Phone, Lock, ChevronRight, Sprout, Building2, Globe, Mail, MapPin, X, ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';


const TAMILNADU_DISTRICTS = [
  { id: 'coimbatore', name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்' },
  { id: 'chennai', name: 'Chennai', nameTa: 'சென்னை' },
  { id: 'salem', name: 'Salem', nameTa: 'சேலம்' },
  { id: 'erode', name: 'Erode', nameTa: 'ஈரோடு' },
  { id: 'madurai', name: 'Madurai', nameTa: 'மதுரை' },
  { id: 'trichy', name: 'Tiruchirappalli (Trichy)', nameTa: 'திருச்சிராப்பள்ளி (திருச்சி)' },
  { id: 'thanjavur', name: 'Thanjavur', nameTa: 'தஞ்சாவூர்' },
  { id: 'tiruppur', name: 'Tiruppur', nameTa: 'திருப்பூர்' },
  { id: 'dindigul', name: 'Dindigul', nameTa: 'திண்டுக்கல்' },
  { id: 'vellore', name: 'Vellore', nameTa: 'வேலூர்' },
  { id: 'thoothukudi', name: 'Thoothukudi', nameTa: 'தூத்துக்குடி' },
  { id: 'tirunelveli', name: 'Tirunelveli', nameTa: 'திருநெல்வேலி' },
  { id: 'kanyakumari', name: 'Kanyakumari', nameTa: 'கன்னியாகுமரி' },
  { id: 'dharmapuri', name: 'Dharmapuri', nameTa: 'தர்மபுரி' },
  { id: 'krishnagiri', name: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி' },
  { id: 'namakkal', name: 'Namakkal', nameTa: 'நாமக்கல்' },
  { id: 'karur', name: 'Karur', nameTa: 'கரூர்' },
  { id: 'theni', name: 'Theni', nameTa: 'தேனி' },
  { id: 'nilgiris', name: 'Nilgiris (Ooty)', nameTa: 'நீலகிரி (ஊட்டி)' },
  { id: 'pudukkottai', name: 'Pudukkottai', nameTa: 'புதுக்கோட்டை' },
  { id: 'ramanathapuram', name: 'Ramanathapuram', nameTa: 'இராமநாதபுரம்' },
  { id: 'sivaganga', name: 'Sivaganga', nameTa: 'சிவகங்கை' },
  { id: 'virudhunagar', name: 'Virudhunagar', nameTa: 'விருதுநகர்' },
  { id: 'cuddalore', name: 'Cuddalore', nameTa: 'கடலூர்' },
  { id: 'nagapattinam', name: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்' },
  { id: 'tiruvarur', name: 'Tiruvarur', nameTa: 'திருவாரூர்' },
  { id: 'viluppuram', name: 'Viluppuram', nameTa: 'விழுப்புரம்' },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை' },
  { id: 'kanchipuram', name: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்' },
  { id: 'tiruvallur', name: 'Tiruvallur', nameTa: 'திருவள்ளூர்' },
  { id: 'perambalur', name: 'Perambalur', nameTa: 'பெரம்பலூர்' },
  { id: 'ariyalur', name: 'Ariyalur', nameTa: 'அரியலூர்' },
  { id: 'tenkasi', name: 'Tenkasi', nameTa: 'தென்காசி' },
  { id: 'chengalpattu', name: 'Chengalpattu', nameTa: 'செங்கல்பட்டு' },
  { id: 'ranipet', name: 'Ranipet', nameTa: 'இராணிப்பேட்டை' },
  { id: 'tirupathur', name: 'Tirupathur', nameTa: 'திருப்பத்தூர்' },
  { id: 'kallakurichi', name: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி' },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை' }
];

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Farmer');
  const [district, setDistrict] = useState('Coimbatore');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Verification states
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loginIdError, setLoginIdError] = useState('');

  const { signIn, signUp, loginAsDemo } = useAuth();
  const { isTamil, toggleLanguage } = useLanguage();
  const router = useRouter();

  // Cooldown timer countdown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = (value: string) => {
    setEmail(value);
    if (!value) { setEmailError(''); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePhone = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    setPhone(numValue);
    if (!numValue) { setPhoneError(''); return; }
    if (numValue.length !== 10) {
      setPhoneError(isTamil ? '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit mobile number');
    } else {
      setPhoneError('');
    }
  };

  const validateLoginId = (value: string) => {
    setLoginId(value);
    if (!value) { setLoginIdError(''); return; }
    const isEmail = value.includes('@');
    const isPhone = /^\d+$/.test(value);
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setLoginIdError(isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter a valid email address');
      } else {
        setLoginIdError('');
      }
    } else if (isPhone) {
      if (value.length !== 10) {
        setLoginIdError(isTamil ? '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit mobile number');
      } else {
        setLoginIdError('');
      }
    } else {
      setLoginIdError(isTamil ? 'சரியான மின்னஞ்சல் அல்லது மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid email or mobile number');
    }
  };

  const sendResetEmail = async (targetEmail: string) => {
    if (!targetEmail) return;
    setLoading(true);
    try {
      const emailToSend = targetEmail.includes('@') ? targetEmail : `${targetEmail}@agriconnect.local`;
      const { error } = await supabase.auth.resetPasswordForEmail(emailToSend, {
        redirectTo: 'http://localhost:5173/reset-password',
      });
      if (error) throw error;
      Alert.alert(
        isTamil ? 'மின்னஞ்சல் அனுப்பப்பட்டது' : 'Email Sent',
        isTamil 
          ? `${emailToSend} முகவரிக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது! உங்கள் மின்னஞ்சல் இன்பாக்ஸைச் சரிபார்க்கவும்.` 
          : `Password reset instructions have been sent to ${emailToSend}. Please check your inbox.`
      );
    } catch (err: any) {
      Alert.alert(isTamil ? 'பிழை' : 'Reset Error', err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    let targetEmail = loginId.trim();
    if (Platform.OS === 'ios') {
      Alert.prompt(
        isTamil ? 'கடவுச்சொல் மீட்டமைப்பு' : 'Reset Password',
        isTamil ? 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்:' : 'Enter your registered email address:',
        [
          { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
          {
            text: isTamil ? 'அனுப்பு' : 'Send Reset Link',
            onPress: async (inputEmail?: string) => {
              if (inputEmail) await sendResetEmail(inputEmail);
            }
          }
        ],
        'plain-text',
        targetEmail
      );
    } else {
      if (!targetEmail) {
        Alert.alert(
          isTamil ? 'கடவுச்சொல் மீட்டமைப்பு' : 'Reset Password',
          isTamil 
            ? 'தயவுசெய்து மேலே உள்ள புலத்தில் உங்கள் மின்னஞ்சல் / மொபைல் எண்ணை உள்ளிட்டு பின்னர் கடவுச்சொல்லை மறந்துவிட்டீர்களா என்பதை சொடுக்கவும்.' 
            : 'Please enter your registered email address or mobile number in the field above first, then tap Forgot Password.'
        );
        return;
      }
      await sendResetEmail(targetEmail);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail
      });
      if (error) throw error;
      Alert.alert(
        isTamil ? 'வெற்றி' : 'Success',
        isTamil ? 'சரிபார்ப்பு மின்னஞ்சல் மீண்டும் அனுப்பப்பட்டது!' : 'Verification email has been resent successfully!'
      );
      setResendCooldown(60);
    } catch (err: any) {
      Alert.alert(isTamil ? 'பிழை' : 'Error', err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    // 1. FOR LOGIN FLOW
    if (isLogin) {
      if (!loginId || !password || loginIdError) {
        Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'சரியான தகவல்களை உள்ளிடவும்' : 'Please provide valid information');
        return;
      }
      setLoading(true);
      try {
        const loginEmail = loginId.includes('@') ? loginId : `${loginId}@agriconnect.local`;
        const loginMethod = signIn || (async (credentials: any) => supabase.auth.signInWithPassword(credentials));
        const { error } = await loginMethod({ email: loginEmail, password });
        if (error) {
          // Check for unconfirmed email error
          if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('verify')) {
            setPendingVerificationEmail(loginEmail);
            setResendCooldown(60);
            return;
          }
          throw error;
        }
      } catch (err: any) {
        Alert.alert(isTamil ? 'பிழை' : 'Authentication Error', err.message);
      } finally {
        setLoading(false);
      }
    } 
    // 2. FOR SIGNUP FLOW (WIZARD STEPS)
    else {
      if (signupStep === 1) {
        if (!name || !phone || !password || !confirmPassword || !email || emailError || phoneError) {
          Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'சரியான தகவல்களை உள்ளிடவும்' : 'Please provide valid information');
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert(isTamil ? 'பிழை' : 'Error', isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
          return;
        }
        setSignupStep(2); // Go to Role Selection step
      } else {
        setLoading(true);
        try {
          const signupEmail = email;
          const signupMethod = signUp || (async (credentials: any) => supabase.auth.signUp(credentials));
          const { error } = await signupMethod({
            email: signupEmail,
            password,
            options: {
              data: {
                full_name: name,
                phone: phone,
                role: role,
                district: district,
                location: district
              }
            }
          });
          if (error) throw error;
          
          // Switch to verification pending view instead of login
          setPendingVerificationEmail(signupEmail);
          setResendCooldown(60);
          setSignupStep(1);
        } catch (err: any) {
          Alert.alert(isTamil ? 'பிழை' : 'Authentication Error', err.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Selection Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Globe color="#15803d" size={18} />
            <Text style={styles.langText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header App Brand */}
        <View style={styles.brandContainer}>
          <LinearGradient
            colors={['#15803d', '#eab308']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandIconWrapper}
          >
            <Sprout size={32} color="white" />
          </LinearGradient>
          <Text style={styles.brandName}>{isTamil ? 'உழவர்வளம்' : 'AgriConnect'}</Text>
          <Text style={styles.brandSubtitle}>
            {isTamil ? 'தமிழ்நாடு விவசாயிகளுக்கான உபரி வள மேலாண்மை' : 'Smart Circular Economy for Tamil Nadu Farmers'}
          </Text>
        </View>

        {/* STANDARD SIGNIN / SIGNUP FORM */}
        {pendingVerificationEmail ? (
          // ================= VERIFICATION PENDING SCREEN =================
          <View style={styles.form}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={[{ backgroundColor: '#fef9c3', marginBottom: 12, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' }]}>
                <Mail size={32} color="#ca8a04" />
              </View>
              <Text style={styles.formTitle}>
                {isTamil ? 'மின்னஞ்சலைச் சரிபார்க்கவும்' : 'Verify Your Email'}
              </Text>
              <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 8 }}>
                {isTamil 
                  ? 'உங்கள் கணக்கைச் செயல்படுத்த சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டுள்ளது.'
                  : 'A verification link has been sent to activate your account.'}
              </Text>
            </View>

            <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bcf0da', padding: 16, borderRadius: 12, marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: '#166534', fontWeight: '600', marginBottom: 4 }}>
                {isTamil ? 'சரிபார்ப்பு மின்னஞ்சல் முகவரி:' : 'We sent a link to:'}
              </Text>
              <Text style={{ fontSize: 16, color: '#15803d', fontWeight: 'bold', marginBottom: 8 }}>
                {pendingVerificationEmail}
              </Text>
              <Text style={{ fontSize: 12, color: '#166534', opacity: 0.8, lineHeight: 16 }}>
                {isTamil 
                  ? 'மின்னஞ்சலில் உள்ள இணைப்பைக் கிளிக் செய்வதன் மூலம் உங்கள் கணக்கு செயல்படத் தொடங்கும்.'
                  : 'Please check your inbox and click the verification link. Once verified, you can return here to log in.'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, resendCooldown > 0 && { backgroundColor: '#cbd5e1' }]} 
              onPress={() => handleResendVerification(pendingVerificationEmail)} 
              disabled={loading || resendCooldown > 0}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {resendCooldown > 0 
                    ? (isTamil ? `மீண்டும் அனுப்பவும் (${resendCooldown}s)` : `Resend Link (${resendCooldown}s)`)
                    : (isTamil ? 'மின்னஞ்சலை மீண்டும் அனுப்பவும்' : 'Resend Verification Email')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => { setPendingVerificationEmail(null); setIsLogin(true); }}
            >
              <Text style={styles.switchText}>
                {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : isLogin ? (
          // ================= LOGIN FORM =================
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {isTamil ? 'உள்நுழைக' : 'Sign In'}
            </Text>

            <View style={[styles.inputContainer, loginIdError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}>
              <User color="#94a3b8" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={isTamil ? "மின்னஞ்சல் அல்லது மொபைல் எண்" : "Email or Mobile Number"}
                placeholderTextColor="#94a3b8"
                value={loginId}
                onChangeText={validateLoginId}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {!!loginIdError && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 16, paddingHorizontal: 16 }}>{loginIdError}</Text>}

            <View style={styles.inputContainer}>
              <Lock color="#94a3b8" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={isTamil ? "கடவுச்சொல்" : "Password"}
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4, marginRight: 4 }}>
                {showPassword ? <EyeOff color="#15803d" size={20} /> : <Eye color="#94a3b8" size={20} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>
                {isTamil ? 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isTamil ? 'உள்நுழைக' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => { setIsLogin(false); setSignupStep(1); }}
            >
              <Text style={styles.switchText}>
                {isTamil ? "புதிய கணக்கு வேண்டுமா? பதிவு செய்" : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ================= SIGNUP FORM (WIZARD FLOW) =================
          <View style={styles.form}>
            <View style={styles.signupHeader}>
              <Text style={styles.formTitle}>
                {isTamil ? 'பதிவு செய்தல்' : 'Create Account'}
              </Text>
              <Text style={styles.stepIndicator}>
                {isTamil ? `படி ${signupStep}/2` : `Step ${signupStep}/2`}
              </Text>
            </View>

            {signupStep === 1 ? (
              <View>
                <View style={styles.inputContainer}>
                  <User color="#94a3b8" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isTamil ? "முழு பெயர்" : "Full Name"}
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, phoneError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}>
                  <Phone color="#94a3b8" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isTamil ? "மொபைல் எண்" : "Mobile Number"}
                    placeholderTextColor="#94a3b8"
                    value={phone}
                    onChangeText={validatePhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {!!phoneError && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 16, paddingHorizontal: 16 }}>{phoneError}</Text>}

                <View style={[styles.inputContainer, emailError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}>
                  <Mail color="#94a3b8" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isTamil ? "மின்னஞ்சல் முகவரி" : "Email Address"}
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={validateEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {!!emailError && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 16, paddingHorizontal: 16 }}>{emailError}</Text>}

                <View style={styles.inputContainer}>
                  <Lock color="#94a3b8" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isTamil ? "கடவுச்சொல்" : "Password"}
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4, marginRight: 4 }}>
                    {showPassword ? <EyeOff color="#15803d" size={20} /> : <Eye color="#94a3b8" size={20} />}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Lock color="#94a3b8" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isTamil ? "கடவுச்சொல்லை உறுதிசெய்" : "Confirm Password"}
                    placeholderTextColor="#94a3b8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4, marginRight: 4 }}>
                    {showConfirmPassword ? <EyeOff color="#15803d" size={20} /> : <Eye color="#94a3b8" size={20} />}
                  </TouchableOpacity>
                </View>

                {/* District Selector Input */}
                <TouchableOpacity 
                  style={[styles.inputContainer, { justifyContent: 'space-between' }]}
                  onPress={() => setShowDistrictModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MapPin color="#15803d" size={20} style={styles.icon} />
                    <Text style={{ fontSize: 14, color: district ? '#0f172a' : '#94a3b8', fontWeight: district ? '600' : 'normal' }}>
                      {district ? (isTamil ? (TAMILNADU_DISTRICTS.find(d => d.name === district)?.nameTa || district) : district) : (isTamil ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select District')}
                    </Text>
                  </View>
                  <ChevronDown color="#64748b" size={18} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
                  <Text style={styles.primaryButtonText}>
                    {isTamil ? 'அடுத்தது' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>
                  {isTamil ? 'உங்களுடைய செயல்பாட்டு பங்கு:' : 'Select Your Platform Role:'}
                </Text>
                
                <View style={styles.roleSelectionGrid}>
                  {[
                    { id: 'Farmer', label: isTamil ? 'விவசாயி' : 'Farmer', desc: isTamil ? 'உபரி வளங்களை விற்க' : 'Sell crop residues', icon: <Sprout color={role === 'Farmer' ? '#15803d' : '#64748b'} size={24} /> },
                    { id: 'Buyer', label: isTamil ? 'வாங்குபவர்' : 'Buyer', desc: isTamil ? 'கழிவுகளை வாங்க' : 'Buy residues & biomass', icon: <Building2 color={role === 'Buyer' ? '#15803d' : '#64748b'} size={24} /> },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.roleCardNew, role === item.id && styles.roleCardNewActive]}
                      onPress={() => setRole(item.id)}
                    >
                      <View style={styles.roleCardIconWrapper}>{item.icon}</View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roleCardTitle, role === item.id && styles.roleCardTitleActive]}>{item.label}</Text>
                        <Text style={styles.roleCardDesc}>{item.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity 
                    style={[styles.primaryButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1' }]} 
                    onPress={() => setSignupStep(1)}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#475569' }]}>
                      {isTamil ? 'பின்செல்' : 'Back'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryButton, { flex: 2 }]} onPress={handleAuth} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isTamil ? 'பதிவு செய்' : 'Register'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {signupStep === 1 && (
              <TouchableOpacity 
                style={styles.switchButton} 
                onPress={() => setIsLogin(true)}
              >
                <Text style={styles.switchText}>
                  {isTamil ? "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக" : "Already have an account? Log in"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      
        {/* District Selector Modal */}
        <Modal
          visible={showDistrictModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDistrictModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
                  {isTamil ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Tamil Nadu District'}
                </Text>
                <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                  <X color="#475569" size={22} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {TAMILNADU_DISTRICTS.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f1f5f9',
                      backgroundColor: district === d.name ? '#f0fdf4' : 'transparent',
                      borderRadius: 8
                    }}
                    onPress={() => {
                      setDistrict(d.name);
                      setShowDistrictModal(false);
                    }}
                  >
                    <MapPin color={district === d.name ? '#15803d' : '#94a3b8'} size={18} style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 14, color: district === d.name ? '#15803d' : '#334155', fontWeight: district === d.name ? 'bold' : 'normal' }}>
                      {isTamil ? d.nameTa : d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 20, 
    paddingBottom: 40,
    justifyContent: 'center' 
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  langText: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 13,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIconWrapper: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  demoCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#fef08a', // Gold/Yellow soft border
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  demoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  demoBadge: {
    backgroundColor: '#fef9c3', // Soft yellow
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  demoBadgeText: {
    color: '#a16207', // Dark yellow
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  demoSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  demoGrid: {
    gap: 10,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderLeftWidth: 4, // Distinctive color-coded role tags
  },
  demoBtnIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  demoBtnInfo: {
    flex: 1,
  },
  demoBtnRole: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1917',
  },
  demoBtnDesc: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  form: { 
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 2 
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f1f5f9', 
    borderRadius: 12, 
    marginBottom: 16, 
    paddingHorizontal: 16 
  },
  icon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 15, 
    color: '#0f172a' 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#475569', 
    marginBottom: 8, 
    marginTop: 4 
  },
  roleContainer: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 16 
  },
  roleButton: { 
    flex: 1, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  roleButtonActive: { 
    backgroundColor: 'rgba(21, 128, 61, 0.1)', 
    borderColor: '#15803d' 
  },
  roleText: { 
    color: '#64748b', 
    fontWeight: '600',
    fontSize: 13 
  },
  roleTextActive: { 
    color: '#15803d' 
  },
  primaryButton: { 
    backgroundColor: '#15803d', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8 
  },
  primaryButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  switchButton: { 
    marginTop: 16, 
    alignItems: 'center' 
  },
  switchText: { 
    color: '#15803d', 
    fontWeight: '600',
    fontSize: 13 
  },
  signupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    fontSize: 13,
    color: '#ca8a04',
    fontWeight: 'bold',
  },
  roleSelectionGrid: {
    gap: 12,
    marginVertical: 12,
  },
  roleCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 12,
  },
  roleCardNewActive: {
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    borderColor: '#15803d',
    borderWidth: 2,
  },
  roleCardIconWrapper: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
  },
  roleCardTitleActive: {
    color: '#15803d',
  },
  roleCardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
});

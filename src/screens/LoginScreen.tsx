import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל תקינה');
      return;
    }

    try {
      setIsLoading(true);
      const result = await login({ email: email.trim(), password });
      
      if (!result.success) {
        Alert.alert('שגיאה בהתחברות', result.error || 'לא ניתן להתחבר');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
        locations={[0, 0.5, 1]}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Image 
                source={require('../utils/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
             
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>ברוכים הבאים</Text>
              <Text style={styles.instructionText}>התחברו לחשבון שלכם</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>אימייל</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="הכנס כתובת אימייל"
                    placeholderTextColor="#8E8E93"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>סיסמה</Text>
                <View style={styles.inputWrapper}>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.inputIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#8E8E93" 
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="הכנס סיסמה"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showPassword}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  השתמש בפרטי ההתחברות שלך לחשבון QuickShop
                </Text>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, (isLoading || loading) && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading || loading}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC']}
                  style={styles.loginButtonGradient}
                >
                  {isLoading || loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>התחבר</Text>
                      <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>שכחת סיסמה?</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}> QuickCommerce מקבוצת © QuickShop כל הזכויות שמורות 2025</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 80,
    marginBottom: 0,
  },
  appTitle: {
    fontSize: 32,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#1C1C1E',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#FFFFFF',
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#007AFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LoginScreen;

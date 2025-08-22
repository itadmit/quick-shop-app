import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, I18nManager, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { 
  NotoSansHebrew_400Regular,
  NotoSansHebrew_500Medium,
  NotoSansHebrew_700Bold,
} from '@expo-google-fonts/noto-sans-hebrew';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Enable RTL layout - commented out for Expo Go compatibility
// I18nManager.allowRTL(true);
// I18nManager.forceRTL(true);

// Orders Stack Navigator
const OrdersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
};

// Main Navigation Component
const MainNavigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Orders') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            } else if (route.name === 'Products') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E7',
            paddingBottom: 20,
            paddingTop: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontFamily: 'NotoSansHebrew-Medium',
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E7',
          },
          headerTitleStyle: {
            fontFamily: 'NotoSansHebrew-Bold',
            fontSize: 18,
            color: '#000',
          },
          headerTitleAlign: 'center',
          headerShown: false,
        })}
      >
        {/* Reversed order for RTL */}
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'פרופיל' }} 
        />
        <Tab.Screen 
          name="Products" 
          component={ProductsScreen} 
          options={{ title: 'מוצרים' }} 
        />
        <Tab.Screen 
          name="Orders" 
          component={OrdersStack} 
          options={{ title: 'הזמנות' }} 
        />
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'בית' }} 
        />
      </Tab.Navigator>
      <StatusBar style="dark" backgroundColor="#E3F2FD" />
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'NotoSansHebrew-Regular': NotoSansHebrew_400Regular,
          'NotoSansHebrew-Medium': NotoSansHebrew_500Medium,
          'NotoSansHebrew-Bold': NotoSansHebrew_700Bold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
        setFontsLoaded(true); // Continue without custom fonts
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>טוען פונטים...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
});

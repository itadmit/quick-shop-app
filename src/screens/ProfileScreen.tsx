import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../hooks/useApi';
import { debugUtils } from '../utils/debugUtils';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { storeInfo } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // כאן נוכל להוסיף קריאות ל-API לרענון הנתונים
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'התנתק',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'פרטי החנות',
      icon: 'storefront-outline',
      action: () => Alert.alert('פרטי החנות', 'בקרוב...'),
    },
    {
      title: 'הגדרות תשלום',
      icon: 'card-outline',
      action: () => Alert.alert('הגדרות תשלום', 'בקרוב...'),
    },
    {
      title: 'הגדרות משלוח',
      icon: 'bicycle-outline',
      action: () => Alert.alert('הגדרות משלוח', 'בקרוב...'),
    },
    {
      title: 'נוטיפיקציות',
      icon: 'notifications-outline',
      action: () => Alert.alert('נוטיפיקציות', 'בקרוב...'),
    },
    {
      title: 'דוחות ואנליטיקה',
      icon: 'analytics-outline',
      action: () => Alert.alert('דוחות ואנליטיקה', 'בקרוב...'),
    },
    {
      title: 'עזרה ותמיכה',
      icon: 'help-circle-outline',
      action: () => Alert.alert('עזרה ותמיכה', 'בקרוב...'),
    },
    {
      title: 'התנתקות',
      icon: 'log-out-outline',
      action: handleLogout,
      isDestructive: true,
    },

    {
      title: 'אודות האפליקציה',
      icon: 'information-circle-outline',
      action: () => Alert.alert('אודות', 'QuickShop Manager v1.0.0'),
    },
  ];

  const dangerItems = [
    {
      title: 'התנתק',
      icon: 'log-out-outline',
      action: () => Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התנתק', style: 'destructive' },
      ]),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
        locations={[0, 0.5, 1]}
        style={styles.gradientContainer}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              title="בודק עדכונים חדשים..."
              titleColor="#8E8E93"
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
        {/* Header Section - כמו בדף הבית */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <Image 
                  source={require('../utils/ico.png')} 
                  style={styles.smallLogo}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>
                  פרופיל
                </Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {user ? `${user.first_name} ${user.last_name}` : 'מנהל החנות'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.profileButton}>
                <View style={styles.profileIcon}>
                  <Ionicons name="person" size={20} color="#007AFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Store Info Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeIcon}>
              <Ionicons name="storefront" size={32} color="#007AFF" />
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{storeInfo?.name || 'חנות דמו'}</Text>
              <Text style={styles.ownerName}>
                {user ? `${user.first_name} ${user.last_name}` : 'מנהל החנות'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>מוצרים</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₪12,450</Text>
            <Text style={styles.statLabel}>מכירות השבוע</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>דירוג</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.isDestructive && styles.destructiveMenuItem
              ]}
              onPress={item.action}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  {!item.isDestructive && (
                    <Ionicons name="chevron-back-outline" size={20} color="#C7C7CC" />
                  )}
                  <Text style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveMenuText,
                    item.isDestructive && { marginRight: 0 }
                  ]}>
                    {item.title}
                  </Text>
                </View>
                <View style={styles.menuItemIcon}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.isDestructive ? "#FF3B30" : "#007AFF"} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerContainer}>
          {dangerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dangerItem}
              onPress={item.action}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="chevron-back-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, styles.dangerText]}>{item.title}</Text>
                </View>
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#FF3B30" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>QuickShop Manager</Text>
          <Text style={styles.versionNumber}>גרסה 1.0.0</Text>
        </View>
        
        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  safeArea: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  smallLogo: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'NotoSansHebrew-Bold',
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerRight: {
    // Only contains profile button now
  },
  profileButton: {
    // No additional margin needed
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 8,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'right',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  editButton: {
    padding: 8,
  },
  storeDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#1C1C1E',
    marginRight: 8,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E7',
    marginHorizontal: 16,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#1C1C1E',
    marginRight: 12,
  },
  menuItemIcon: {
    marginLeft: 16,
  },
  dangerContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dangerText: {
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#8E8E93',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#C7C7CC',
  },
  bottomSpacer: {
    height: 20,
  },
  destructiveMenuItem: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  destructiveMenuText: {
    color: '#FF3B30',
  },

});

export default ProfileScreen;

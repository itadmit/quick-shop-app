import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDashboard, useOrders, useStore } from '../hooks/useApi';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();
  const { orders: recentOrders, loading: ordersLoading } = useOrders({ limit: 3 });
  const { storeInfo, loading: storeLoading } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // כאן נוכל להוסיף קריאות ל-API לרענון הנתונים
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // אם הנתונים עדיין נטענים
  if (dashboardLoading || ordersLoading || storeLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
          locations={[0, 0.5, 1]}
          style={[styles.gradientContainer, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>טוען נתונים...</Text>
        </LinearGradient>
      </View>
    );
  }

  // אם יש שגיאה
  if (dashboardError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
          locations={[0, 0.5, 1]}
          style={[styles.gradientContainer, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>שגיאה בטעינת הנתונים</Text>
          <Text style={styles.errorSubText}>{dashboardError}</Text>
        </LinearGradient>
      </View>
    );
  }

  const stats = dashboardData ? [
    {
      title: 'הזמנות היום',
      value: dashboardData.stats.today_orders.toString(),
      change: '+12%', // נחשב בהמשך מהנתונים
      changeType: 'positive',
      icon: 'receipt-outline',
      color: '#007AFF',
    },
    {
      title: 'מכירות היום',
      value: dashboardData.stats.today_sales 
        ? `₪${Number(dashboardData.stats.today_sales).toLocaleString('he-IL')}` 
        : '₪0',
      change: '+8%',
      changeType: 'positive',
      icon: 'trending-up-outline',
      color: '#34C759',
    },
    {
      title: 'מוצרים פעילים',
      value: dashboardData.stats.total_products.toString(),
      change: '+3',
      changeType: 'positive',
      icon: 'cube-outline',
      color: '#FF9500',
    },
    {
      title: 'הזמנות החודש',
      value: dashboardData.stats.monthly_orders.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: 'calendar-outline',
      color: '#007AFF',
    },
  ] : [
    {
      title: 'הזמנות היום',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: 'receipt-outline',
      color: '#007AFF',
    },
    {
      title: 'מכירות השבוע',
      value: '₪12,450',
      change: '+8%',
      changeType: 'positive',
      icon: 'trending-up-outline',
      color: '#34C759',
    },
    {
      title: 'מוצרים פעילים',
      value: '156',
      change: '+3',
      changeType: 'positive',
      icon: 'cube-outline',
      color: '#FF9500',
    },
    {
      title: 'מלאי נמוך',
      value: '8',
      change: '-2',
      changeType: 'negative',
      icon: 'warning-outline',
      color: '#FF3B30',
    },
  ];

  const quickActions = [
    {
      title: 'הזמנה חדשה',
      icon: 'add-circle-outline',
      color: '#007AFF',
      action: () => {},
    },
    {
      title: 'הוסף מוצר',
      icon: 'cube-outline',
      color: '#34C759',
      action: () => {},
    },
    {
      title: 'דוחות',
      icon: 'bar-chart-outline',
      color: '#FF9500',
      action: () => {},
    },
    {
      title: 'הגדרות',
      icon: 'settings-outline',
      color: '#8E8E93',
      action: () => {},
    },
  ];

  // ההזמנות האחרונות מגיעות מה-hook

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending_payment':
      case 'חדשה':
        return '#007AFF';
      case 'approved':
      case 'paid':
      case 'cash_payment':
      case 'בהכנה':
        return '#FF9500';
      case 'ready':
      case 'shipped':
      case 'מוכנה':
        return '#34C759';
      case 'completed':
      case 'נמסרה':
        return '#8E8E93';
      case 'cancelled':
      case 'abandoned_cart':
      case 'בוטלה':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending_payment':
        return 'חדשה';
      case 'approved':
      case 'paid':
      case 'cash_payment':
        return 'שולם';
      case 'ready':
      case 'shipped':
        return 'מוכנה';
      case 'completed':
        return 'נמסרה';
      case 'cancelled':
        return 'בוטלה';
      case 'abandoned_cart':
        return 'עגלה נטושה';
      case 'חדשה':
      case 'בהכנה':
      case 'מוכנה':
      case 'נמסרה':
      case 'בוטלה':
      case 'שולם':
      case 'עגלה נטושה':
        return status; // אם הסטטוס כבר בעברית, נחזיר אותו כמו שהוא
      default:
        return status || 'לא ידוע';
    }
  };

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
              title="מכין תצוגה"
              titleColor="#8E8E93"
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
        {/* Header Section */}
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
                  שלום, {storeInfo?.name || 'מנהל החנות'} 👋
                </Text>
              </View>
              <Text style={styles.headerDate}>
                {new Date().toLocaleDateString('he-IL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
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

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
                  <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={24} color={stat.color} />
                </View>
                <View style={[
                  styles.changeContainer,
                  { backgroundColor: stat.changeType === 'positive' ? '#34C75915' : '#FF3B3015' }
                ]}>
                  <Text style={[
                    styles.changeText,
                    { color: stat.changeType === 'positive' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>פעולות מהירות</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <LinearGradient
                  colors={[`${action.color}15`, `${action.color}05`]}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={28} color={action.color} />
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>הזמנות אחרונות</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>צפה בהכל</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersContainer}>
            {ordersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>טוען הזמנות...</Text>
              </View>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <TouchableOpacity key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderCustomer}>
                        {order.customer_name}
                      </Text>
                      <Text style={styles.orderId}>הזמנה #{order.id}</Text>
                    </View>
                    <View style={styles.orderRight}>
                      <Text style={styles.orderAmount}>
                        {order.total_formatted || `₪${Number(order.total || 0).toLocaleString('he-IL')}`}
                      </Text>
                      <Text style={styles.orderTime}>
                        {new Date(order.created_at).toLocaleDateString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        }).replace(/\./g, '/')} {new Date(order.created_at).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderFooter}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(order.status)}15` }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) }
                      ]}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>אין הזמנות אחרונות</Text>
              </View>
            )}
          </View>
        </View>
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
  headerTitle: {
    fontSize: 32,
    fontFamily: 'NotoSansHebrew-Bold',
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginRight: 8,
  },
  headerDate: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerRight: {
    // Only contains profile button now
  },
  smallLogo: {
    width: 24,
    height: 24,
    marginBottom: 8,
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 40) / 2 - 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  statHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Medium',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 50) / 2,
    marginBottom: 10,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  ordersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  orderCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  orderHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCustomer: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  orderId: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  orderRight: {
    alignItems: 'flex-start',
  },
  orderAmount: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
  },
  orderTime: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Medium',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

});

export default HomeScreen;

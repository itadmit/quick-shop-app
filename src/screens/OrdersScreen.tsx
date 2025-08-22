import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useOrders } from '../hooks/useApi';
import { Order as ApiOrder } from '../types/api';

const { width } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'חדשה' | 'בהכנה' | 'מוכנה' | 'נמסרה' | 'בוטלה';
  time: string;
  address?: string;
  notes?: string;
}

interface OrdersScreenProps {
  navigation: any;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    orders, 
    loading, 
    error, 
    total,
    refetch,
    updateOrderStatus: updateStatus,
    deleteOrder: removeOrder
  } = useOrders();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('שולם');



  useEffect(() => {
    // Request notification permissions
    registerForPushNotificationsAsync();

    // Listen for notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('שגיאה', 'לא ניתן לקבל הרשאה לנוטיפיקציות');
      return;
    }
  };



  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus(orderId, newStatus);
      Alert.alert('הצלחה', 'סטטוס ההזמנה עודכן בהצלחה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לעדכן את סטטוס ההזמנה');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    Alert.alert(
      'מחיקת הזמנה',
      'האם אתה בטוח שברצונך למחוק הזמנה זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeOrder(orderId);
              Alert.alert('הצלחה', 'ההזמנה נמחקה בהצלחה');
            } catch (error) {
              Alert.alert('שגיאה', 'לא ניתן למחוק את ההזמנה');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'חדשה':
        return '#007AFF';
      case 'בהכנה':
        return '#FF9500';
      case 'מוכנה':
        return '#34C759';
      case 'נמסרה':
        return '#8E8E93';
      case 'בוטלה':
        return '#FF3B30';
      case 'שולם':
        return '#34C759';
      case 'ממתין לתשלום':
        return '#FF9500';
      case 'חדשה':
        return '#007AFF';
      case 'מאושרת':
        return '#34C759';
      case 'בהכנה':
        return '#FF9500';
      case 'מוכן':
        return '#34C759';
      case 'נמסרה':
        return '#8E8E93';
      case 'בוטלה':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'חדשה':
        return 'ellipse-outline';
      case 'בהכנה':
        return 'time-outline';
      case 'מוכנה':
        return 'checkmark-circle-outline';
      case 'נמסרה':
        return 'checkmark-done-circle-outline';
      case 'בוטלה':
        return 'close-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'חדשה':
        return 'בהכנה';
      case 'בהכנה':
        return 'מוכנה';
      case 'מוכנה':
        return 'נמסרה';
      default:
        return currentStatus;
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toString().includes(searchQuery) ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus !== '') {
      if (selectedStatus === 'שולם') {
        matchesStatus = order.paid_status === 1;
      } else if (selectedStatus === 'ממתין לתשלום') {
        matchesStatus = order.paid_status === 0;
      } else {
        matchesStatus = order.status_text === selectedStatus;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      console.log(`Changing to page ${newPage}, total pages: ${totalPages}`);
      // כאן אפשר להוסיף קריאה ל-API לקבלת העמוד החדש
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderOrderCard = (order: ApiOrder) => {
    // Parse order items from JSON
    let orderItems: any[] = [];
    try {
      if (order.order_items_json) {
        orderItems = JSON.parse(order.order_items_json);
      }
    } catch (e) {
      console.error('Error parsing order items:', e);
    }

    // Build address string
    const addressParts = [
      order.street,
      order.building,
      order.apartment,
      order.floor,
      order.city,
      order.postal_code
    ].filter(Boolean);
    const address = addressParts.join(', ');

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Header with status */}
        <View style={styles.orderHeader}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(order.status_text)}15` }
            ]}>
              <Ionicons 
                name={getStatusIcon(order.status_text)} 
                size={16} 
                color={getStatusColor(order.status_text)} 
              />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(order.status_text) }
              ]}>
                {order.status_text}
              </Text>
            </View>
          </View>
          <Text style={styles.orderTime}>{order.created_time}</Text>
        </View>

        {/* Customer info */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>{order.customer_name}</Text>
          <Text style={styles.orderId}>הזמנה #{order.id}</Text>
        </View>

        {/* Order items summary */}
        <View style={styles.itemsSummary}>
          <Text style={styles.itemsCount}>
            {orderItems.length} מוצרים
          </Text>
          <Text style={styles.totalAmount}>{order.total_formatted}</Text>
        </View>

        {/* Address and notes */}
        {(address || order.order_notes) && (
          <View style={styles.detailsSection}>
            {address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>{address}</Text>
                <Ionicons name="location-outline" size={16} color="#8E8E93" />
              </View>
            )}
            {order.order_notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>{order.order_notes}</Text>
                <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
              </View>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('התקשרות', `התקשר ל${order.customer_name}?`)}
          >
            <Ionicons name="call" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('וואטסאפ', `שלח הודעה ל${order.customer_name}?`)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>



          <TouchableOpacity
            style={styles.viewOrderButton}
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
          >
           
            <Ionicons name="chevron-back-outline" size={16} color="#FFFFFF" />
            <Text style={styles.viewOrderButtonText}>צפה בהזמנה</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
              title="בודק הזמנות חדשות..."
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
                  הזמנות
                </Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {filteredOrders.length} הזמנות
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.profileButton}>
                <View style={styles.profileIcon}>
                  <Ionicons name="receipt" size={20} color="#007AFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="חפש הזמנות..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>

          {/* Status Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilterContainer}
            contentContainerStyle={styles.statusFilterContent}
          >
            {[
              'שולם',
              'ממתין לתשלום',
              'חדשה',
              'מאושרת',
              'בהכנה',
              'מוכן',
              'נמסרה',
              'בוטלה'
            ].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterButton,
                  { 
                    backgroundColor: selectedStatus === status ? '#007AFF' : '#F8F9FA',
                    borderColor: selectedStatus === status ? '#007AFF' : '#E5E5E7'
                  }
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.statusFilterButtonText,
                  { 
                    color: selectedStatus === status ? '#FFFFFF' : '#8E8E93'
                  }
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>טוען הזמנות...</Text>
          </View>
        ) : (
          <>
            <View style={styles.ordersContainer}>
              {(() => {
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = currentPage * pageSize;
                const currentPageOrders = filteredOrders.slice(startIndex, endIndex);
                return currentPageOrders.map(renderOrderCard);
              })()}
              
              {/* Bottom Spacer for pull-to-refresh */}
              <View style={styles.bottomSpacer} />
            </View>
            
            {/* Pagination */}
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { opacity: currentPage === 1 ? 0.5 : 1 }
                ]}
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={20} color="#007AFF" />
                <Text style={styles.paginationButtonText}>הקודם</Text>
              </TouchableOpacity>
              
              <View style={styles.pageInfo}>
                <Text style={styles.pageInfoText}>
                  עמוד {currentPage} מתוך {totalPages}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { opacity: currentPage === totalPages ? 0.5 : 1 }
                ]}
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Text style={styles.paginationButtonText}>הבא</Text>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
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
    // Empty view to push content to the right
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    minWidth: 80,
    justifyContent: 'center',
  },
  paginationButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageInfoText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    marginLeft: 12,
    color: '#1C1C1E',
    textAlign: 'right',
  },
  statusFilterContainer: {
    maxHeight: 50,
  },
  statusFilterContent: {
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    minWidth: 80,
    alignItems: 'center',
  },
  statusFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusFilterButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },


  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'NotoSansHebrew-Medium',
    fontWeight: '600',
  },
  orderTime: {
    fontSize: 13,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  customerSection: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  customerName: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'right',
    marginBottom: 3,
  },
  orderId: {
    fontSize: 15,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  itemsCount: {
    fontSize: 15,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#6C757D',
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    fontWeight: '700',
  },
  detailsSection: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#6C757D',
    textAlign: 'right',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#FF3B30',
    fontWeight: '600',
  },
  viewOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  viewOrderButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#FFFFFF',
    marginRight: 4,
    fontWeight: '600',
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 100, // Adjust height as needed for pull-to-refresh effect
  },

});

export default OrdersScreen;

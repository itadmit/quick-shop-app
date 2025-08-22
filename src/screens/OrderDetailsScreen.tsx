import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { Order } from '../types/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrderDetailsScreenProps {
  route: {
    params: {
      orderId: number;
    };
  };
  navigation: any;
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching order details for ID:', orderId);
      
      // בדיקה שהטוקן קיים
      const isAuth = await apiService.isAuthenticated();
      console.log('Is authenticated:', isAuth);
      
      // בדיקת ping לשרת
      try {
        const pingResponse = await apiService.ping();
        console.log('Ping response:', pingResponse);
      } catch (pingErr) {
        console.error('Ping error:', pingErr);
      }
      
      const response = await apiService.getOrder(orderId);
      console.log('Order details response:', response);
      setOrder(response);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת פרטי ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'חדשה':
        return '#007AFF';
      case 'בהכנה':
        return '#FF9500';
      case 'מוכן':
        return '#34C759';
      case 'נמסרה':
        return '#8E8E93';
      case 'בוטלה':
        return '#FF3B30';
      case 'שולם':
        return '#34C759';
      case 'ממתין לתשלום':
        return '#FF9500';
      case 'תשלום במזומן':
        return '#007AFF';
      case 'הושלם':
        return '#34C759';
      case 'הועבר למשלוח':
        return '#007AFF';
      case 'הזמנה מבוטלת':
        return '#FF3B30';
      case 'עגלה נטושה':
        return '#8E8E93';
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
      case 'מוכן':
        return 'checkmark-circle-outline';
      case 'נמסרה':
        return 'checkmark-done-circle-outline';
      case 'בוטלה':
        return 'close-circle-outline';
      case 'שולם':
        return 'checkmark-circle';
      case 'ממתין לתשלום':
        return 'time-outline';
      case 'תשלום במזומן':
        return 'card-outline';
      case 'הושלם':
        return 'checkmark-done-circle';
      case 'הועבר למשלוח':
        return 'car-outline';
      case 'הזמנה מבוטלת':
        return 'close-circle';
      case 'עגלה נטושה':
        return 'cart-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      await apiService.updateOrderStatus(order.id, newStatus);
      
      // עדכון מקומי
      setOrder(prev => prev ? { ...prev, status_text: newStatus } : null);
      
      Alert.alert('הצלחה', 'סטטוס ההזמנה עודכן בהצלחה');
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לעדכן את סטטוס ההזמנה');
    } finally {
      setUpdating(false);
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('שגיאה', 'לא ניתן לבצע שיחה טלפונית');
        }
      })
      .catch((err) => console.error('Error making phone call:', err));
  };

  const openWhatsApp = (phoneNumber: string, customerName: string) => {
    const message = `שלום ${customerName}, בנוגע להזמנה #${order?.id}`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('שגיאה', 'וואטסאפ לא מותקן במכשיר');
        }
      })
      .catch((err) => console.error('Error opening WhatsApp:', err));
  };

  const openTracking = (trackingUrl: string) => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
          locations={[0, 0.5, 1]}
          style={styles.gradientContainer}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>טוען פרטי הזמנה...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error || !order) {
    return (
      <LinearGradient
        colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        <View style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-forward" size={24} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>פרטי הזמנה</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
            <Text style={styles.errorText}>{error || 'הזמנה לא נמצאה'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
              <Text style={styles.retryButtonText}>נסה שוב</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Parse order items from API response
  let orderItems: any[] = [];
  try {
    if (order.order_items && Array.isArray(order.order_items)) {
      orderItems = order.order_items;
    } else if (order.order_items_json) {
      // Fallback to JSON parsing if needed
      orderItems = JSON.parse(order.order_items_json);
    }
  } catch (e) {
    console.error('Error parsing order items:', e);
    orderItems = [];
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
    <LinearGradient
      colors={['#E3F2FD', '#F8F9FA', '#E8EAF6']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-forward" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הזמנה #{order.id}</Text>
          <View style={styles.placeholder} />
        </View>

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
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(order.status_text)}15` }
              ]}>
          
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(order.status_text) }
                ]}>
                  {order.status_text}
                </Text>
                <Ionicons 
                  name={getStatusIcon(order.status_text)} 
                  size={20} 
                  color={getStatusColor(order.status_text)} 
                />
              </View>


              
          
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
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
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </View>
            </View>
          </View>

          {/* Customer Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>פרטי לקוח</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.customerName}>{`${order.first_name} ${order.last_name}`}</Text>
              <View style={styles.contactRow}>
                
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => makePhoneCall(order.phone || '')}
                  >
                    <Ionicons name="call" size={18} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => openWhatsApp(order.phone || '', `${order.first_name || ''} ${order.last_name || ''}`)}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.contactText}>{order.phone}</Text>
              </View>
              {order.email && (
                <Text style={styles.contactText}>{order.email}</Text>
              )}
            </View>
          </View>

          {/* Order Items Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bag-outline" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>פריטי ההזמנה</Text>
            </View>
            <View style={styles.cardContent}>
              {orderItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name || item.product_name || 'פריט לא ידוע'}</Text>
                    <Text style={styles.itemQuantity}>כמות: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      {item.price_formatted || item.total_formatted || `₪${Number(item.price || item.total || 0).toLocaleString()}`}
                    </Text>
                  </View>

                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>סה"כ:</Text>
                <Text style={styles.totalAmount}>{order.total_formatted}</Text>
              </View>
            </View>
          </View>

          {/* Address Card */}
          {address && (
            <View style={styles.card}>
           <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>כתובת משלוח</Text>
            </View>
              <View style={styles.cardContent}>
                <Text style={styles.addressText}>{address}</Text>
              </View>
            </View>
          )}

          {/* Notes Card */}
          {order.order_notes && (
            <View style={styles.card}>
                          <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>הערות</Text>
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </View>
              <View style={styles.cardContent}>
                <Text style={styles.notesText}>{order.order_notes}</Text>
              </View>
            </View>
          )}

          {/* Tracking Card */}
          {order.tracking_number && (
            <View style={styles.card}>
                          <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>מעקב משלוח</Text>
              <Ionicons name="cube-outline" size={20} color="#007AFF" />
            </View>
              <View style={styles.cardContent}>
                <View style={styles.trackingRow}>
                  <Text style={styles.trackingNumber}>{order.tracking_number}</Text>
                  {order.tracking_url && (
                    <TouchableOpacity
                      style={styles.trackingButton}
                      onPress={() => openTracking(order.tracking_url!)}
                    >
                      <Text style={styles.trackingButtonText}>עקוב</Text>
                      <Ionicons name="open-outline" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {order.status_text !== 'נמסרה' && order.status_text !== 'בוטלה' && (
            <View style={styles.actionButtons}>
              {order.status_text === 'חדשה' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => updateOrderStatus('בהכנה')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>אשר הזמנה</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {order.status_text === 'בהכנה' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.readyButton]}
                  onPress={() => updateOrderStatus('מוכנה')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>סמן כמוכנה</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {order.status_text === 'מוכנה' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deliveredButton]}
                  onPress={() => updateOrderStatus('נמסרה')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>סמן כנמסרה</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {order.status_text === 'חדשה' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => updateOrderStatus('בוטלה')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>בטל הזמנה</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 50, // ריווח מעל ה-status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 25, // ריווח נוסף מעל
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'center',
    fontWeight: '700',
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'right',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'right',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    marginRight: 8,
  },
  orderTime: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    marginRight: 8,
  },
  cardContent: {
    padding: 20,
  },
  customerName: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'right',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    textAlign: 'right',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'left',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E5E7',
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'left',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#007AFF',
    textAlign: 'right',
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#1C1C1E',
    textAlign: 'right',
    lineHeight: 24,
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#1C1C1E',
    textAlign: 'right',
    lineHeight: 24,
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    textAlign: 'right',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  trackingButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
    marginRight: 4,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#FFFFFF',
  },
  approveButton: {
    backgroundColor: '#FF9500',
  },
  readyButton: {
    backgroundColor: '#34C759',
  },
  deliveredButton: {
    backgroundColor: '#8E8E93',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  gradientContainer: {
    flex: 1,
  },
});

export default OrderDetailsScreen;

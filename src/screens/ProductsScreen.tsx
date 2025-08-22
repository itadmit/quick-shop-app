import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts, useStore } from '../hooks/useApi';
import { apiService } from '../services/api';

import { Product } from '../types/api';

const { width } = Dimensions.get('window');

const ProductsScreen = () => {
  const insets = useSafeAreaInsets();
  const { products, loading, error, refetch } = useProducts();
  const { storeInfo } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<string[]>(['הכל']);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiService.getCategories();
        if (response.success && response.data) {
          const categoryNames = ['הכל', ...response.data.map((cat: any) => cat.name)];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to default categories
        setCategories(['הכל', 'חלב וביצים', 'לחם ומאפים', 'פירות וירקות', 'בשר ודגים']);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'הכל' || (product.categories && product.categories.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setEditModalVisible(true);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      Alert.alert('שגיאה', 'שם המוצר הוא שדה חובה');
      return;
    }

    try {
      // כאן נוכל להוסיף קריאה ל-API לעדכון המוצר
      // await apiService.updateProduct(editingProduct.id, editingProduct);
      
      setEditModalVisible(false);
      setEditingProduct(null);
      refetch(); // רענון הנתונים מה-API
      
      Alert.alert('הצלחה', 'המוצר עודכן בהצלחה');
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לעדכן את המוצר');
    }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      // כאן נוכל להוסיף קריאה ל-API לעדכון סטטוס המוצר
      // await apiService.updateProduct(productId, { is_active: !product.is_active });
      
      refetch(); // רענון הנתונים מה-API
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לעדכן את סטטוס המוצר');
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#FF3B30';
    if (stock <= 5) return '#FF9500';
    return '#34C759';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'אזל';
    if (stock <= 5) return 'מלאי נמוך';
    return `${stock} יחידות`;
  };

  const getProductImageUrl = (product: Product) => {
    // Use new API image_url first (this is what the API returns)
    if (product.image_url) {
      return product.image_url;
    }
    
    // Fallback to gallery_urls array
    if (product.gallery_urls && product.gallery_urls.length > 0) {
      return product.gallery_urls[0];
    }
    
    // Fallback to legacy fields
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    
    if (product.product_image && storeInfo?.slug) {
      return `https://quickshopil-storage.s3.amazonaws.com/uploads/${storeInfo.slug}/${product.product_image}`;
    }
    
    return null;
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={[
        styles.productCard,
        !product.is_active && styles.inactiveCard
      ]}
      onPress={() => openEditModal(product)}
    >
      <View style={styles.productHeader}>
        <View style={styles.productImageContainer}>
          {getProductImageUrl(product) ? (
            <Image
              source={{ uri: getProductImageUrl(product)! }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#8E8E93" />
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[
            styles.productName,
            !product.is_active && styles.inactiveText
          ]}>
            {product.name}
          </Text>
          <Text style={[
            styles.productDescription,
            !product.is_active && styles.inactiveText
          ]}>
            {product.description || 'אין תיאור'}
          </Text>
          <Text style={styles.productCategory}>
            {product.categories && product.categories.length > 0 
              ? product.categories.join(', ') 
              : (product.category_names || 'אין קטגוריה')}
          </Text>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => toggleProductStatus(product.id)}
          >
            <Ionicons
              name={product.is_active ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={product.is_active ? '#34C759' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productFooter}>
        <View style={styles.priceContainer}>
          <Text style={[
            styles.productPrice,
            !product.is_active && styles.inactiveText
          ]}>
            ₪{Number(product.regular_price || 0).toFixed(2)}
          </Text>
        </View>
        <View style={[
          styles.stockBadge,
          { backgroundColor: `${getStockColor(product.inventory_quantity || 0)}15` }
        ]}>
          <Text style={[
            styles.stockText,
            { color: getStockColor(product.inventory_quantity || 0) }
          ]}>
            {getStockText(product.inventory_quantity || 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
                  מוצרים
                </Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {filteredProducts.length} מוצרים
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.profileButton}>
                <View style={styles.profileIcon}>
                  <Ionicons name="cube" size={20} color="#007AFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="חפש מוצרים..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categoriesLoading ? (
              <View style={styles.categoriesLoading}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.categoriesLoadingText}>טוען קטגוריות...</Text>
              </View>
            ) : (
              categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={styles.productsContainer}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsCount}>
              {filteredProducts.length} מוצרים
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>הוסף מוצר</Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('נדרש להתחבר מחדש') && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    // Navigate to login screen
                    // For now, just refresh
                    refetch();
                  }}
                >
                  <Text style={styles.retryButtonText}>נסה שוב</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.productsListContainer}>
            {filteredProducts.map(renderProductCard)}
            
            {/* Bottom Spacer for pull-to-refresh */}
            <View style={styles.bottomSpacer} />
          </View>
        </View>
        </ScrollView>

        {/* Edit Product Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButton}>ביטול</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>עריכת מוצר</Text>
              <TouchableOpacity onPress={saveProduct}>
                <Text style={styles.saveButton}>שמור</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Product Image */}
              <View style={styles.modalImageContainer}>
                {editingProduct && getProductImageUrl(editingProduct) ? (
                  <Image
                    source={{ uri: getProductImageUrl(editingProduct)! }}
                    style={styles.modalProductImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#8E8E93" />
                    <Text style={styles.modalImageText}>אין תמונה</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>שם המוצר</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingProduct?.name || ''}
                  onChangeText={(text) =>
                    setEditingProduct(prev => prev ? { ...prev, name: text } : null)
                  }
                  textAlign="right"
                  placeholder="הכנס שם מוצר"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>תיאור</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editingProduct?.description || ''}
                  onChangeText={(text) =>
                    setEditingProduct(prev => prev ? { ...prev, description: text } : null)
                  }
                  textAlign="right"
                  placeholder="הכנס תיאור מוצר"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>מחיר (₪)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingProduct?.regular_price?.toString() || ''}
                    onChangeText={(text) =>
                      setEditingProduct(prev => prev ? { ...prev, regular_price: parseFloat(text) || 0 } : null)
                    }
                    textAlign="right"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>מלאי</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingProduct?.inventory_quantity?.toString() || ''}
                    onChangeText={(text) =>
                      setEditingProduct(prev => prev ? { ...prev, inventory_quantity: parseInt(text) || 0 } : null)
                    }
                    textAlign="right"
                    placeholder="0"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>קטגוריה</Text>
                <View style={styles.categorySelector}>
                  {categories.slice(1).map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categorySelectorButton,
                        editingProduct?.categories?.includes(category) && styles.selectedCategorySelectorButton
                      ]}
                      onPress={() =>
                        setEditingProduct(prev => prev ? { 
                          ...prev, 
                          categories: prev.categories ? [...prev.categories, category] : [category]
                        } : null)
                      }
                    >
                      <Text style={[
                        styles.categorySelectorText,
                        editingProduct?.categories?.includes(category) && styles.selectedCategorySelectorText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>מוצר פעיל</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    editingProduct?.is_active === 1 && styles.switchActive
                  ]}
                  onPress={() =>
                    setEditingProduct(prev => prev ? { ...prev, is_active: prev.is_active === 1 ? 0 : 1 } : null)
                  }
                >
                  <View style={[
                    styles.switchThumb,
                    editingProduct?.is_active === 1 && styles.switchThumbActive
                  ]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  },
  categoriesContainer: {
    maxHeight: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  categoriesContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  categoriesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  categoriesLoadingText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginRight: 8,
  },

  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsCount: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
    marginLeft: 4,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
  inactiveCard: {
    opacity: 0.6,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'right',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    textAlign: 'right',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
    textAlign: 'right',
  },
  inactiveText: {
    color: '#C7C7CC',
  },
  productActions: {
    marginLeft: 12,
  },
  toggleButton: {
    padding: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
    textAlign: 'right',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'NotoSansHebrew-Medium',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansHebrew-Bold',
    color: '#1C1C1E',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProductImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Regular',
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Regular',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    color: '#1C1C1E',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  selectedCategorySelectorButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categorySelectorText: {
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
  },
  selectedCategorySelectorText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'NotoSansHebrew-Medium',
    color: '#1C1C1E',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#34C759',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  bottomSpacer: {
    height: 20,
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
  searchFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },

  productsListContainer: {
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FFF2F2',
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'right',
    marginHorizontal: 12,
    fontFamily: 'NotoSansHebrew-Regular',
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'NotoSansHebrew-Medium',
    fontWeight: '500',
  },
});

export default ProductsScreen;

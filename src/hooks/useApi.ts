import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { 
  DashboardData, 
  Order, 
  Product, 
  OrderFilters, 
  ProductFilters 
} from '../types/api';
import { useAuth } from '../contexts/AuthContext';

// Hook לנתוני דשבורד
export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAuth = await apiService.isAuthenticated();
      if (!isAuth) {
        setError('משתמש לא מחובר');
        return;
      }
      
      const data = await apiService.getDashboardData();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני דשבורד');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
};

// Hook להזמנות
export const useOrders = (filters: OrderFilters = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAuth = await apiService.isAuthenticated();
      if (!isAuth) {
        setError('משתמש לא מחובר');
        return;
      }
      
      const response = await apiService.getOrders(filters);
      setOrders(response.orders);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הזמנות');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      // עדכון מקומי מיידי
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status as any }
            : order
        )
      );

      // בעתיד נשלח לשרת:
      // await apiService.updateOrderStatus(orderId, status);
    } catch (err) {
      // במקרה של שגיאה, נחזיר את המצב הקודם
      fetchOrders();
      throw err;
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      // עדכון מקומי מיידי
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setTotal(prev => prev - 1);

      // בעתיד נשלח לשרת:
      // await apiService.deleteOrder(orderId);
    } catch (err) {
      // במקרה של שגיאה, נחזיר את המצב הקודם
      fetchOrders();
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(filters)]);

  return { 
    orders, 
    loading, 
    error, 
    total,
    refetch: fetchOrders,
    updateOrderStatus,
    deleteOrder
  };
};

// Hook למוצרים
export const useProducts = () => {
  const { user } = useAuth();
  const { storeInfo } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // נשתמש ב-store slug מהמשתמש המחובר
      const storeSlug = user?.store_slug || 'yogev'; // ברירת מחדל
      console.log('Using store slug:', storeSlug);
      const response = await apiService.getProducts(storeSlug as any);
      
      if (response.success && response.data) {
        // המרת הנתונים מהפורמט החדש לפורמט הישן
        const convertedProducts = response.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          regular_price: product.regular_price || 0,
          sale_price: product.sale_price || null,
          inventory_quantity: product.inventory_quantity || 0,
          is_active: product.is_active !== undefined ? (product.is_active ? 1 : 0) : 1,
          product_image: product.image_url || null,
          images: product.gallery_urls || [],
          categories: product.category_names || [],
          category_names: product.category_names ? product.category_names.join(', ') : '',
          product_slug: product.slug || '',
          slug: product.slug || '',
          product_type: product.product_type || 'regular',
          type: product.product_type || 'regular',
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
          product_url: product.product_url || '',
          // שדות נוספים מהפורמט החדש
          variants: product.variants || [],
          options: product.options || [],
          badge_text: product.badge_text || null,
          badge_color: product.badge_color || null,
          store_id: user?.store_id || 1,
          display_order: product.display_order || 0,
          is_hidden: product.is_hidden || 0,
          sku: product.sku || '',
        } as Product));
        
        setProducts(convertedProducts);
      } else {
        setError('שגיאה בטעינת מוצרים');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בטעינת מוצרים';
      
      // אם הבעיה היא אימות, נציע התחברות מחדש
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('אין טוקן אימות')) {
        setError('נדרש להתחבר מחדש. ייתכן שהתחברת ממכשיר אחר.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch };
};

// Hook לנתוני חנות
export const useStore = () => {
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAuth = await apiService.isAuthenticated();
      if (!isAuth) {
        setError('משתמש לא מחובר');
        return;
      }
      
      const data = await apiService.getStoreInfo();
      setStoreInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני חנות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  return { storeInfo, loading, error, refetch: fetchStoreInfo };
};

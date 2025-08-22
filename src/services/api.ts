import { 
  DashboardData, 
  Order, 
  Product, 
  OrdersResponse, 
  ProductsResponse, 
  OrderFilters, 
  ProductFilters,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  PingResponse
} from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// הגדרות API
const API_BASE_URL = 'https://quick-shop.co.il/api2';

class ApiService {
  private authToken: string | null = null;
  private storeSlug: string | null = null;
  private authLoaded: boolean = false;

  constructor() {
    this.loadStoredAuth();
  }

  private async loadStoredAuth() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const slug = await AsyncStorage.getItem('store_slug');
      
      console.log('Loading stored auth - token:', token ? 'exists' : 'missing');
      console.log('Loading stored auth - slug:', slug ? 'exists' : 'missing');
      
      if (token) {
        this.authToken = token;
      }
      if (slug) {
        this.storeSlug = slug;
      }
      
      this.authLoaded = true;
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.authLoaded = true;
    }
  }

  private async ensureAuthLoaded() {
    if (!this.authLoaded) {
      await this.loadStoredAuth();
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // וודא שהאימות נטען
    await this.ensureAuthLoaded();
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (this.authToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      console.log(`Auth Token: ${this.authToken ? 'Present' : 'Missing'}`);
      console.log(`Full headers:`, config.headers);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized - clearing auth data');
          await this.clearAuth();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Response:`, data);
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }



  // Authentication
  async setAuthToken(token: string) {
    this.authToken = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  async setStoreSlug(slug: string) {
    this.storeSlug = slug;
    try {
      await AsyncStorage.setItem('store_slug', slug);
    } catch (error) {
      console.error('Error storing store slug:', error);
    }
  }

  async clearAuth() {
    this.authToken = null;
    this.storeSlug = null;
    try {
      await AsyncStorage.multiRemove(['auth_token', 'store_slug']);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    await this.ensureAuthLoaded();
    return !!this.authToken;
  }

  // Login API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: credentials.email,
          password: credentials.password,
        }),
      });

      // אם השרת מחזיר 401, זה אומר שהנתונים שגויים
      if (response.status === 401) {
        return {
          success: false,
          error: 'אימייל או סיסמה שגויים',
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user && data.token) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.name?.split(' ')[0] || data.user.first_name || '',
          last_name: data.user.name?.split(' ').slice(1).join(' ') || data.user.last_name || '',
          phone: data.user.phone || '',
          auth_token: data.token,
          created_at: new Date().toISOString(),
        };

        await this.setAuthToken(data.token);
        if (data.user.store_slug) {
          await this.setStoreSlug(data.user.store_slug);
        }
        
        // שמירת פרטי המשתמש
        try {
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
        } catch (error) {
          console.error('Error storing user data:', error);
        }

        return {
          success: true,
          user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          error: data.error || 'שגיאה בהתחברות',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      return {
        success: false,
        error: 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט ונסה שוב.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // בעתיד נשלח לשרת:
      // await this.makeRequest('/auth/logout.php', { method: 'POST' });
      
      await this.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // גם במקרה של שגיאה, נמחק את הנתונים המקומיים
      await this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.authToken) {
      return null;
    }

    try {
      // בדיקת תקפות הטוקן מול השרת
      const pingResponse = await this.ping();
      
      if (pingResponse.success && pingResponse.user_id) {
        // הטוקן תקף, נחזיר משתמש עם הטוקן הנוכחי
        // נשמור את פרטי המשתמש מה-AsyncStorage או נחזיר משתמש בסיסי
        const storedUser = await this.getStoredUser();
        if (storedUser) {
          return {
            ...storedUser,
            auth_token: this.authToken,
          };
        }
        
        // אם אין משתמש שמור, נחזיר משתמש בסיסי עם הטוקן
        return {
          id: pingResponse.user_id,
          email: 'user@quickshop.com',
          first_name: 'משתמש',
          last_name: 'קוויק שופ',
          phone: '',
          auth_token: this.authToken,
          created_at: new Date().toISOString(),
        };
      } else {
        // הטוקן לא תקף
        console.log('Token validation failed, clearing auth data');
        await this.clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // אם יש שגיאה בבדיקת הטוקן, ננקה את האימות
      await this.clearAuth();
      return null;
    }
  }

  private async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Dashboard API
  async getDashboardData(): Promise<DashboardData> {
    return this.makeRequest<DashboardData>('/dashboard.php');
  }

  // Ping API - בדיקת תקפות טוקן
  async ping(): Promise<PingResponse> {
    return this.makeRequest<PingResponse>('/ping.php');
  }

  // Notifications API
  async getNotifications(): Promise<any> {
    return this.makeRequest('/notifications.php');
  }

  // Stats API
  async getStats(type: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    return this.makeRequest(`/stats.php?type=${type}`);
  }

  // Orders API
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/orders.php${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<OrdersResponse>(endpoint);
  }

  async getOrder(orderId: number): Promise<Order> {
    console.log('Getting order with ID:', orderId);
    console.log('Current auth token:', this.authToken ? 'exists' : 'missing');
    console.log('Current store slug:', this.storeSlug);
    
    if (!this.storeSlug) {
      throw new Error('Store slug is missing');
    }
    
    const response = await this.makeRequest<{ success: boolean; order: Order }>(`/orders.php?id=${orderId}&store=${this.storeSlug}`);
    return response.order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
    return this.makeRequest<ApiResponse<Order>>('/orders.php', {
      method: 'PUT',
      body: JSON.stringify({ id: orderId, status }),
    });
  }

  async deleteOrder(orderId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>('/orders.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: orderId }),
    });
  }

  // קבלת מוצרים
  async getProducts(storeSlug: string, filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      // בדיקת תקפות הטוקן לפני הבקשה
      await this.ensureAuthLoaded();
      
      if (!this.authToken) {
        throw new Error('אין טוקן אימות. אנא התחבר מחדש.');
      }
      
      console.log('Fetching products for store:', storeSlug);
      console.log('Auth Token:', this.authToken ? 'Present' : 'Missing');
      
      const url = `https://quick-shop.co.il/api/stores/${storeSlug}/products-manager`;
      const queryParams = new URLSearchParams();
      
      // הוספת פרמטרים לפילטור
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.category_id) queryParams.append('category_id', filters.category_id.toString());
      if (filters.search) queryParams.append('q', filters.search);
      if (filters.sort_by) queryParams.append('sort', filters.sort_by);
      if (filters.sort_dir) queryParams.append('sort_dir', filters.sort_dir);
      
      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      console.log('Full URL:', fullUrl);
      
      const headers = {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
      
      console.log('Full headers:', headers);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Error for getProducts:', error);
      throw error;
    }
  }

  async getProduct(productId: number): Promise<Product> {
    if (!this.storeSlug) {
      throw new Error('Store slug is missing');
    }

    const response = await this.makeRequest<ProductResponse>(`/api/stores/${this.storeSlug}/products?ids=${productId}`);
    if (response.success && response.data && response.data.length > 0) {
      return response.data[0];
    }
    throw new Error('Product not found');
  }

  async createProduct(productData: any): Promise<any> {
    return this.makeRequest('/products.php', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: number, productData: any): Promise<any> {
    return this.makeRequest('/products.php', {
      method: 'PUT',
      body: JSON.stringify({ id: productId, ...productData }),
    });
  }

  // Categories API
  async getCategories(): Promise<any> {
    if (!this.storeSlug) {
      throw new Error('Store slug is missing');
    }
    return this.makeRequest(`/api/stores/${this.storeSlug}/categories`);
  }

  // Product Galleries API
  async getProductGalleries(productId: number): Promise<any> {
    if (!this.storeSlug) {
      throw new Error('Store slug is missing');
    }
    return this.makeRequest(`/api/stores/${this.storeSlug}/product-galleries?product_id=${productId}`);
  }

  // Media API
  async getMedia(filters: { page?: number; limit?: number; filter_type?: string } = {}): Promise<any> {
    if (!this.storeSlug) {
      throw new Error('Store slug is missing');
    }
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/stores/${this.storeSlug}/media${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Store API
  async getStoreInfo(): Promise<any> {
    const response = await this.makeRequest<{ store: any }>('/store.php');
    return response.store; // מחזיר רק את האובייקט store
  }

  // Upload API
  async uploadFile(file: File | Blob, fileName?: string): Promise<{ success: boolean; filename?: string; url?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', file, fileName);

    try {
      const response = await fetch(`${API_BASE_URL}/upload.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'שגיאה בהעלאת קובץ',
      };
    }
  }

  // Helper methods for demo data (זמני עד שנחבר לשרת אמיתי)
  async getDemoData(): Promise<{
    dashboardData: DashboardData;
    orders: Order[];
    products: Product[];
  }> {
    // נתונים דמו בהתאם למבנה האמיתי
    const dashboardData: DashboardData = {
      stats: {
        today_orders: 24,
        today_sales: 1250.50,
        monthly_orders: 156,
        monthly_sales: 12450.75,
        total_products: 89,
      },
      weekly_sales: [
        { date: '2024-01-15', orders_count: 5, total_sales: 320.50 },
        { date: '2024-01-14', orders_count: 8, total_sales: 450.25 },
        { date: '2024-01-13', orders_count: 3, total_sales: 180.00 },
      ],
      recent_orders: [],
      popular_products: [],
    };

    const orders: Order[] = [
      {
        id: 1234,
        order_number: 'QS-1234',
        customer_name: 'יוסי כהן',
        customer_email: 'yossi@example.com',
        customer_phone: '050-1234567',
        total: 245.00,
        total_formatted: '₪245.00',
        status: 'new',
        status_text: 'חדשה',
        created_at: '2024-01-15 10:30:00',
        created_date: '2024-01-15',
        created_time: '10:30',
        items: [
          {
            id: 1,
            product_name: 'חלב 3% ליטר',
            quantity: 2,
            price: 6.5,
            price_formatted: '₪6.50',
            total: 13.0,
            total_formatted: '₪13.00',
          },
          {
            id: 2,
            product_name: 'לחם שחור',
            quantity: 1,
            price: 8.9,
            price_formatted: '₪8.90',
            total: 8.9,
            total_formatted: '₪8.90',
          },
        ],
        shipping_address: {
          first_name: 'יוסי',
          last_name: 'כהן',
          address: 'רחוב הרצל 15',
          city: 'תל אביב',
          phone: '050-1234567',
        },
        notes: 'אנא צלצלו כשתגיעו',
      },
      {
        id: 1235,
        order_number: 'QS-1235',
        customer_name: 'שרה לוי',
        customer_email: 'sara@example.com',
        customer_phone: '052-9876543',
        total: 189.00,
        total_formatted: '₪189.00',
        status: 'approved',
        status_text: 'מאושרת',
        created_at: '2024-01-15 10:15:00',
        created_date: '2024-01-15',
        created_time: '10:15',
        items: [
          {
            id: 3,
            product_name: 'גבינה צהובה',
            quantity: 1,
            price: 25.9,
            price_formatted: '₪25.90',
            total: 25.9,
            total_formatted: '₪25.90',
          },
        ],
        shipping_address: {
          first_name: 'שרה',
          last_name: 'לוי',
          address: 'רחוב דיזנגוף 45',
          city: 'תל אביב',
          phone: '052-9876543',
        },
      },
    ];

    const products: Product[] = [
      {
        id: 1,
        store_id: 1,
        name: 'חלב 3% ליטר',
        description: 'חלב טרי ואיכותי',
        regular_price: 6.50,
        sale_price: 5.90,
        product_image: 'https://example.com/milk.jpg',
        created_at: '2024-01-01 00:00:00',
        is_active: 1,
        is_hidden: 0,
        display_order: 1,
        inventory_quantity: 50,
      },
      {
        id: 2,
        store_id: 1,
        name: 'לחם שחור',
        description: 'לחם טרי מהתנור',
        regular_price: 8.90,
        product_image: 'https://example.com/bread.jpg',
        created_at: '2024-01-01 00:00:00',
        is_active: 1,
        is_hidden: 0,
        display_order: 2,
        inventory_quantity: 25,
      },
    ];

    return { dashboardData, orders, products };
  }
}

export const apiService = new ApiService();
export default apiService;

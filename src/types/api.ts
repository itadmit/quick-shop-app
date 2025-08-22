// טיפוסי נתונים בהתאם ל-API של QuickShop

export interface Store {
  id: number;
  slug: string;
  name: string;
  user_id: number;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  theme?: string;
  primary_color?: string;
  secondary_color?: string;
  logo?: string;
  created_at?: string;
  total_products?: number;
  today_orders?: number;
  today_sales?: number | null;
  // All other fields from server response
  add_to_cart_behavior?: string;
  announcement_speed?: number;
  announcement_text_color?: string;
  announcement_text_size?: number;
  announcement_type?: string;
  announcements?: string;
  aspect_ratio?: string | null;
  background_color?: string;
  banner_image?: string | null;
  border_radius?: string | null;
  border_width?: string | null;
  bottom_bar_color?: string;
  button_add_to_cart_color?: string;
  button_add_to_cart_text_color?: string;
  button_checkout_color?: string;
  button_checkout_text_color?: string;
  category_page_settings?: string | null;
  close_orders_outside_hours?: number;
  cloudflare_hostname_id?: string | null;
  cloudflare_www_hostname_id?: string | null;
  countdown_timer_date?: string | null;
  countdown_timer_text?: string | null;
  countdown_timer_time?: string;
  cover_image?: string | null;
  custom_domain?: string | null;
  delivery_areas?: string;
  delivery_by_area?: number;
  delivery_enabled?: number;
  delivery_min_order_amount?: string | null;
  delivery_nationwide?: number;
  delivery_price?: string | null;
  delivery_type?: string;
  desktop_columns?: number;
  display_product_mode?: string;
  display_type?: string;
  dns_verified?: number;
  enable_countdown_timer?: number;
  enable_topbar?: number;
  enable_topbar_announcements?: number;
  facebook?: string | null;
  favicon?: string | null;
  fb_access_token?: string | null;
  fb_pixel_id?: string | null;
  filter_settings?: string | null;
  font_family?: string;
  footer_bg_color?: string;
  footer_border_color?: string | null;
  footer_copyright_text?: string;
  footer_font_size?: string | null;
  footer_form_button_bg?: string | null;
  footer_form_button_rounded?: number;
  footer_form_button_text?: string;
  footer_image?: string | null;
  footer_line_height?: string | null;
  footer_link_color?: string | null;
  footer_link_hover_color?: string | null;
  footer_mobile_accordion?: number;
  footer_mobile_padding?: string | null;
  footer_padding_bottom?: string | null;
  footer_padding_top?: string | null;
  footer_show_built_with?: number;
  footer_show_copyright?: number;
  footer_social_size?: string | null;
  footer_social_spacing?: string | null;
  footer_text_color?: string | null;
  free_shipping_areas?: string;
  free_shipping_min_amount?: string | null;
  gtm_id?: string | null;
  header_layout?: string;
  header_sticky?: number;
  hours?: string | null;
  instagram?: string | null;
  international_shipping_enabled?: number;
  inventory_display_type?: string;
  invert_logo_black?: number;
  invert_logo_white?: number;
  is_active?: number;
  kitchen_mode?: number;
  logo_desktop_width?: number;
  logo_mobile_width?: number;
  maintenance_message?: string;
  maintenance_password?: string | null;
  meta_description?: string;
  meta_title?: string;
  middle_bar_color?: string;
  mobile_columns?: number;
  mobile_menu_border_color?: string;
  mobile_menu_enable_upsell?: number;
  mobile_menu_show_borders?: number;
  mobile_menu_style?: string;
  mobile_menu_upsell_bg_color?: string;
  mobile_menu_upsell_button_bg_color?: string;
  mobile_menu_upsell_button_link?: string;
  mobile_menu_upsell_button_text?: string;
  mobile_menu_upsell_button_text_color?: string;
  mobile_menu_upsell_text?: string | null;
  mobile_menu_upsell_text_color?: string;
  mobile_menu_upsell_title?: string;
  no_delivery_no_pickup?: number;
  open_in_popup?: string | null;
  other_social_link?: string | null;
  pickup_address?: string;
  pickup_enabled?: number;
  purchase_email?: string | null;
  purchase_phone?: string | null;
  sand_delivery_per_product?: number;
  show_description?: string | null;
  ssl_last_check?: string | null;
  ssl_status?: string;
  ssl_validation_errors?: string | null;
  store_type?: string;
  tablet_columns?: number;
  topbar_color?: string;
  topbar_sticky?: number;
  topbar_text_color?: string;
  updated_at?: string | null;
  variation_buttons_bg_color?: string;
  variation_buttons_text_color?: string;
}

export interface Order {
  id: number;
  order_number?: string;
  // Legacy fields (kept for backward compatibility)
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  order_items_json?: string; // JSON string from server
  
  // New fields from API
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  order_items: OrderItem[]; // Direct array from server
  
  total: string;
  total_formatted: string;
  subtotal?: string;
  subtotal_formatted?: string;
  status: string;
  status_text: string;
  created_at: string;
  created_date: string;
  created_time: string;
  
  // Additional fields from server
  store_id?: number;
  customer_id?: number;
  city?: string;
  postal_code?: string;
  delivery_method?: string;
  delivery_price?: string;
  payment_method?: string;
  payment_method_text?: string;
  paid_status?: number;
  is_deleted?: number;
  viewed?: number;
  building?: string;
  apartment?: string;
  floor?: string;
  street?: string;
  country?: string;
  company_name?: string;
  order_notes?: string;
  short_greeting?: string;
  receive_updates?: number;
  discount_amount?: string;
  coupon_code?: string;
  order_token?: string;
  shipping_provider?: string;
  shipping_status?: string;
  auto_discounts_json?: string;
  payment_details?: string;
  payment_updated_at?: string;
  pos_order?: number;
  
  // Legacy display fields
  items?: OrderItem[]; // Parsed items for display
  shipping_address?: ShippingAddress;
  notes?: string;
  tracking_number?: string;
  tracking_url?: string;
}

export interface OrderItem {
  id?: number;
  product_name?: string;
  name?: string; // New field from API
  variant_name?: string;
  quantity: number;
  price?: number;
  price_formatted?: string;
  total?: number;
  total_formatted?: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code?: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable';
  regular_price: number;
  sale_price?: number;
  inventory_quantity: number;
  images: string[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  categories: string[];
  product_url: string;
  badge_text?: string;
  badge_color?: string;
  // Legacy fields for backward compatibility
  description?: string;
  regular_price_formatted?: string;
  sale_price_formatted?: string;
  is_on_sale?: boolean;
  discount_percent?: number;
  image_url?: string;
  gallery_urls?: string[];
  product_type?: 'regular' | 'variable';
  variant_count?: number;
  category_names?: string;
  category_ids?: string;
  attribute_options?: Record<string, string[]>;
  custom_fields?: CustomField[];
  category_id?: string;
  product_image?: string;
  product_gallery?: string[];
  is_active?: number;
  // שדות נוספים מהפורמט החדש
  display_order?: number;
  is_hidden?: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  regular_price: number;
  sale_price?: number;
  inventory_quantity: number;
  options: Record<string, string>;
  display_type?: string;
  color_code?: string;
  // Legacy fields for backward compatibility
  attributes?: Record<string, string>;
  regular_price_formatted?: string;
  sale_price_formatted?: string;
  image_url?: string;
  gallery_urls?: string[];
  variant_image?: string;
  variant_gallery?: string[];
  ignore_inventory?: number;
}

export interface ProductOption {
  name: string;
  values: string[];
  display_type?: string;
}

export interface CustomField {
  field_title?: string;
  field_content?: string;
  field_type?: string;
  field_name?: string;
  field_value?: string;
  display_order?: number;
}

export interface DashboardStats {
  today_orders: number;
  today_sales: number | null;
  monthly_orders: number;
  monthly_sales: number | null;
  total_products: number;
}

export interface WeeklySales {
  date: string;
  orders_count: number;
  total_sales: number;
}

export interface PopularProduct {
  id: number;
  name: string;
  product_image?: string;
  regular_price: number;
  sale_price?: number;
  orders_count: number;
  total_quantity: number;
}

export interface DashboardData {
  stats: DashboardStats;
  weekly_sales: WeeklySales[];
  recent_orders: Order[];
  popular_products: PopularProduct[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
}

// תגובה מה-API החדש למוצרים
export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  sort?: {
    current: string;
    available_options: Record<string, string>;
  };
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

// פרמטרים לחיפוש והפילטור
export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category_id?: string;
  ids?: string;
  q?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
  debug?: number;
}

// Authentication types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  auth_token: string;
  created_at: string;
  store_slug?: string;
  store_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    name?: string;
    email: string;
    store_id?: number;
    store_slug?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  token?: string;
  error?: string;
}

export interface PingResponse {
  success: boolean;
  message?: string;
  user_id?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

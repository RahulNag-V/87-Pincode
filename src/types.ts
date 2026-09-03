export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  requires_verification?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  description: string;
  details?: string;
  price: number;
  sale_price?: number | null;
  category_id: string;
  category_name?: string;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  max_stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  order_notes?: string;
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug?: string;
  product_image?: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string; // e.g. "87PC-1024"
  order_number?: string; // alias for id
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  shipping_fee?: number; // alias for shipping
  discount: number;
  total: number;
  total_amount?: number; // alias for total
  status: OrderStatus;
  cancellation_reason?: string;
  cancellation_requested_at?: string;
  tracking_number?: string;
  courier_name?: string;
  internal_notes?: string;
  whatsapp_url?: string;
  whatsapp_message?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  comment?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'cancellation' | 'promotion';
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  badge?: string;
  is_active: boolean;
  display_order: number;
  position: 'hero' | 'promo' | 'editorial';
}

export interface ProductReview {
  id: string;
  product_id: string;
  product_name?: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  store_name: string;
  tagline: string;
  currency_symbol: string;
  currency_code: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  announcement_text: string;
  announcement_enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_cta_text: string;
  hero_cta_link: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  sections_config: {
    hero: boolean;
    categories: boolean;
    featured: boolean;
    promo_banner: boolean;
    new_arrivals: boolean;
    best_sellers: boolean;
    craftsmanship: boolean;
    reviews: boolean;
    newsletter: boolean;
  };
}

export interface ContactSettings {
  shop_email: string;
  phone_number: string;
  whatsapp_number: string; // The owner's WhatsApp number (e.g., 919876543210)
  address: string;
  business_hours: string;
  google_maps_url: string;
  directions_url?: string;
}

export interface AdminAnalytics {
  total_revenue: number;
  total_orders: number;
  confirmed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  total_customers: number;
  total_products: number;
  low_stock_count: number;
  recent_orders: Order[];
}

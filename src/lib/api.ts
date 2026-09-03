import {
  UserProfile,
  Category,
  Product,
  Banner,
  Order,
  NotificationItem,
  ProductReview,
  SiteSettings,
  ContactSettings,
  CartItem,
  DeliveryAddress,
  AdminAnalytics
} from '../types.js';

const TOKEN_KEY = '87pincode_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { full_name: string; email: string; password: string; confirm_password?: string; phone?: string }) =>
    request<{ user: UserProfile; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  oauthLogin: (payload: { provider: 'google' | 'apple'; email: string; full_name?: string }) =>
    request<{ user: UserProfile; token: string }>('/api/auth/oauth', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ user: UserProfile | null }>('/api/auth/me'),

  updateProfile: (payload: { full_name?: string; phone?: string }) =>
    request<{ user: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  verifyEmail: (email: string) =>
    request<{ success: boolean; message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resendVerification: (email: string) =>
    request<{ success: boolean; message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  logout: () => {
    setStoredToken(null);
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  // Public Store Data
  getSettings: () => request<{ site: SiteSettings; contact: ContactSettings }>('/api/site-settings'),
  getCategories: () => request<Category[]>('/api/categories'),
  getBanners: () => request<Banner[]>('/api/banners'),
  getProducts: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const query = searchParams.toString();
    return request<Product[]>(`/api/products${query ? `?${query}` : ''}`);
  },
  getProductBySlug: (slug: string) =>
    request<{ product: Product; related: Product[]; reviews: ProductReview[] }>(`/api/products/${slug}`),

  // Reviews
  submitReview: (payload: { product_id: string; rating: number; comment: string }) =>
    request<{ review: ProductReview; message: string }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    request<{ success: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Cart Sync
  syncCart: (guest_items: CartItem[]) =>
    request<{ items: CartItem[] }>('/api/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ guest_items })
    }),

  // Orders
  createOrder: (payload: {
    items: { product_id: string; size: string; color: string; quantity: number }[];
    delivery_address: DeliveryAddress;
  }) =>
    request<{
      success: boolean;
      order: Order;
      whatsapp_url: string;
      whatsapp_message: string;
      shop_whatsapp_number: string;
      message: string;
    }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMyOrders: () => request<Order[]>('/api/orders/my-orders'),

  getOrderDetails: (orderId: string) =>
    request<{ order: Order; history: any[]; contact_whatsapp: string }>(`/api/orders/${orderId}`),

  requestCancellation: (orderId: string, reason: string) =>
    request<{
      success: boolean;
      order: Order;
      whatsapp_url: string;
      whatsapp_message: string;
      message: string;
    }>(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // Wishlist API
  getWishlist: () => request<{ wishlist: string[] }>('/api/wishlist'),
  toggleWishlist: (product_id: string) =>
    request<{ wishlist: string[] }>('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id })
    }),
  syncWishlist: (product_ids: string[]) =>
    request<{ wishlist: string[] }>('/api/wishlist/sync', {
      method: 'POST',
      body: JSON.stringify({ product_ids })
    }),

  // Admin APIs
  admin: {
    uploadImage: (data: string, filename: string) =>
      request<{ success: boolean; url: string; filename: string; size: number }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ data, filename })
      }),
    getOverview: () => request<AdminAnalytics & { low_stock_products: any[] }>('/api/admin/overview'),
    getOrders: (params: { status?: string; search?: string } = {}) => {
      const q = new URLSearchParams(params as any).toString();
      return request<Order[]>(`/api/admin/orders${q ? `?${q}` : ''}`);
    },
    updateOrderStatus: (
      id: string,
      payload: { status: string; tracking_number?: string; courier_name?: string; internal_notes?: string }
    ) =>
      request<{ success: boolean; order: Order }>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    getProducts: () => request<Product[]>('/api/admin/products'),
    createProduct: (payload: Partial<Product>) =>
      request<Product>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateProduct: (id: string, payload: Partial<Product>) =>
      request<Product>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteProduct: (id: string) =>
      request<{ success: boolean }>(`/api/admin/products/${id}`, {
        method: 'DELETE'
      }),
    getCategories: () => request<Category[]>('/api/admin/categories'),
    createCategory: (payload: Partial<Category>) =>
      request<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateCategory: (id: string, payload: Partial<Category>) =>
      request<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteCategory: (id: string) =>
      request<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      }),
    updateInventory: (id: string, stock: number) =>
      request<Product>(`/api/admin/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock })
      }),
    getBanners: () => request<Banner[]>('/api/admin/banners'),
    createBanner: (payload: Partial<Banner>) =>
      request<Banner>('/api/admin/banners', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateBanner: (id: string, payload: Partial<Banner>) =>
      request<Banner>(`/api/admin/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteBanner: (id: string) =>
      request<{ success: boolean }>(`/api/admin/banners/${id}`, {
        method: 'DELETE'
      }),
    getReviews: () => request<ProductReview[]>('/api/admin/reviews'),
    updateReviewStatus: (id: string, is_approved: boolean) =>
      request<ProductReview>(`/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_approved })
      }),
    deleteReview: (id: string) =>
      request<{ success: boolean }>(`/api/admin/reviews/${id}`, {
        method: 'DELETE'
      }),
    getCustomers: () => request<any[]>('/api/admin/customers'),
    updateCustomerRole: (id: string, role: 'customer' | 'admin') =>
      request<{ success: boolean; user: any }>(`/api/admin/customers/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      }),
    getNewsletters: () => request<any[]>('/api/admin/newsletters'),
    updateSiteSettings: (payload: Partial<SiteSettings>) =>
      request<SiteSettings>('/api/admin/settings/site', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    updateContactSettings: (payload: Partial<ContactSettings>) =>
      request<ContactSettings>('/api/admin/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
  }
};

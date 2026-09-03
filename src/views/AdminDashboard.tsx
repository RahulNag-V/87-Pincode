import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  Star,
  Users,
  Settings,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  Menu,
  X,
  ExternalLink,
  MessageCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useStore } from '../context/StoreContext.js';
import {
  Order,
  Product,
  Category,
  Banner,
  ProductReview,
  AdminAnalytics,
  SiteSettings,
  ContactSettings
} from '../types.js';
import { api } from '../lib/api.js';
import { ImageUpload } from '../components/ImageUpload.js';

interface AdminDashboardProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, isAdmin } = useAuth();
  const { site, contact, refreshSettings } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'inventory' | 'banners' | 'reviews' | 'customers' | 'settings'
  >('overview');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview Data
  const [analytics, setAnalytics] = useState<AdminAnalytics & { low_stock_products: any[] } | null>(null);

  // Orders Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState({
    status: '',
    courier_name: '',
    tracking_number: '',
    internal_notes: ''
  });

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Categories Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Banners Data
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  // Reviews Data
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Customers Data
  const [customers, setCustomers] = useState<any[]>([]);

  // Site Settings Form
  const [siteForm, setSiteForm] = useState<SiteSettings>(site || ({} as SiteSettings));
  const [contactForm, setContactForm] = useState<ContactSettings>(contact || ({} as ContactSettings));

  // Quick feedback notification helper
  const notify = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Load active tab data
  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await api.admin.getOverview();
          setAnalytics(res);
        } else if (activeTab === 'orders') {
          const res = await api.admin.getOrders({
            status: orderFilterStatus || undefined,
            search: orderSearchQuery || undefined
          });
          setOrders(res);
        } else if (activeTab === 'products' || activeTab === 'inventory') {
          const res = await api.admin.getProducts();
          setProducts(res);
          const cats = await api.admin.getCategories();
          setCategories(cats);
        } else if (activeTab === 'categories') {
          const res = await api.admin.getCategories();
          setCategories(res);
        } else if (activeTab === 'banners') {
          const res = await api.admin.getBanners();
          setBanners(res);
        } else if (activeTab === 'reviews') {
          const res = await api.admin.getReviews();
          setReviews(res);
        } else if (activeTab === 'customers') {
          const res = await api.admin.getCustomers();
          setCustomers(res);
        } else if (activeTab === 'settings') {
          if (site) setSiteForm(site);
          if (contact) setContactForm(contact);
        }
      } catch (err: any) {
        notify('error', err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, isAdmin, orderFilterStatus, orderSearchQuery]);

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#080808] text-center p-6 text-[#F5F2EA]">
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="font-editorial text-2xl font-bold">Admin Atelier Access Restricted</h2>
        <p className="text-xs text-[#9B9B9B] mt-2 max-w-sm">
          You must be authenticated with an Atelier Administrator account to enter this control center.
        </p>
        <button
          onClick={() => navigate('home')}
          className="mt-6 px-6 py-2.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.admin.updateOrderStatus(selectedOrder.id, {
        status: orderStatusUpdate.status || selectedOrder.status,
        courier_name: orderStatusUpdate.courier_name,
        tracking_number: orderStatusUpdate.tracking_number,
        internal_notes: orderStatusUpdate.internal_notes
      });
      notify('success', `Order #${selectedOrder.order_number} status updated to ${orderStatusUpdate.status}`);
      // Refresh list
      const updated = await api.admin.getOrders();
      setOrders(updated);
      setSelectedOrder(null);
    } catch (err: any) {
      notify('error', err.message || 'Failed to update order status');
    }
  };

  // Handle Product Save (Create / Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (editingProduct.id) {
        await api.admin.updateProduct(editingProduct.id, editingProduct);
        notify('success', 'Product updated successfully');
      } else {
        await api.admin.createProduct(editingProduct);
        notify('success', 'New product created in catalog');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      const res = await api.admin.getProducts();
      setProducts(res);
    } catch (err: any) {
      notify('error', err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to retire this product from the atelier?')) return;
    try {
      await api.admin.deleteProduct(id);
      notify('success', 'Product deleted from catalog');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete product');
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      if (editingCategory.id) {
        await api.admin.updateCategory(editingCategory.id, editingCategory);
        notify('success', 'Category updated');
      } else {
        await api.admin.createCategory(editingCategory);
        notify('success', 'Category created');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      const res = await api.admin.getCategories();
      setCategories(res);
    } catch (err: any) {
      notify('error', err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this category? Associated products should be reassigned.')) return;
    try {
      await api.admin.deleteCategory(id);
      notify('success', 'Category deleted');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete category');
    }
  };

  // Handle Inventory Inline Update
  const handleQuickStockUpdate = async (productId: string, stock: number) => {
    try {
      await api.admin.updateInventory(productId, stock);
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock } : p)));
      notify('success', 'Stock level updated');
    } catch (err: any) {
      notify('error', err.message || 'Failed to update stock');
    }
  };

  // Handle Banner Save
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      if (editingBanner.id) {
        await api.admin.updateBanner(editingBanner.id, editingBanner);
        notify('success', 'Banner updated');
      } else {
        await api.admin.createBanner(editingBanner);
        notify('success', 'Banner created');
      }
      setBannerModalOpen(false);
      setEditingBanner(null);
      const res = await api.admin.getBanners();
      setBanners(res);
    } catch (err: any) {
      notify('error', err.message || 'Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to remove this editorial banner?')) return;
    try {
      await api.admin.deleteBanner(id);
      notify('success', 'Banner removed');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete banner');
    }
  };

  // Handle Review Moderation
  const handleToggleReviewStatus = async (reviewId: string, current: boolean) => {
    try {
      await api.admin.updateReviewStatus(reviewId, !current);
      setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, is_approved: !current } : r)));
      notify('success', `Review ${!current ? 'Approved' : 'Unapproved'}`);
    } catch (err: any) {
      notify('error', err.message || 'Failed to update review status');
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.updateSiteSettings(siteForm);
      await api.admin.updateContactSettings(contactForm);
      await refreshSettings();
      notify('success', 'Site & Contact settings saved successfully. Updated across all client storefront pages!');
    } catch (err: any) {
      notify('error', err.message || 'Failed to save settings');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Dispatch', icon: Package },
    { id: 'products', label: 'Products Suite', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'inventory', label: 'Inventory Control', icon: Sliders },
    { id: 'banners', label: 'Editorial Banners', icon: ImageIcon },
    { id: 'reviews', label: 'Patron Reviews', icon: Star },
    { id: 'customers', label: 'Customers & Roles', icon: Users },
    { id: 'settings', label: 'Site & WhatsApp Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#0D0D0D] border-b border-[#1C1C1C] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#D5D2CA] hover:text-[#C9A227]"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-editorial text-lg font-bold tracking-[0.2em] text-[#F5F2EA]">
              87 PINCODE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#E0B84F] font-bold tracking-widest uppercase">
              Admin Atelier
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('home')}
            className="text-xs uppercase tracking-wider text-[#9B9B9B] hover:text-[#E0B84F] flex items-center space-x-1"
          >
            <span>View Live Storefront</span>
            <ExternalLink size={13} />
          </button>
          <span className="text-xs text-[#666666] hidden sm:inline">|</span>
          <span className="text-xs font-semibold text-[#D5D2CA] hidden sm:inline">{user?.full_name}</span>
        </div>
      </header>

      {/* Floating Alert */}
      {alertMsg && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded shadow-2xl text-xs flex items-center space-x-2 animate-in fade-in duration-200 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-950 border border-emerald-800 text-emerald-200'
              : 'bg-red-950 border border-red-800 text-red-200'
          }`}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Main Admin Body: Sidebar + Main Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-[#0A0A0A] border-r border-[#1C1C1C] flex flex-col justify-between p-4 shrink-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1 mt-14 lg:mt-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedOrder(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-[#C9A227] text-[#080808] shadow-lg shadow-[#C9A227]/20 font-bold'
                      : 'text-[#9B9B9B] hover:text-[#F5F2EA] hover:bg-[#141414]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[#111111] rounded border border-[#1C1C1C] text-[11px] text-[#888888] space-y-1">
            <p className="font-semibold text-[#D5D2CA]">WhatsApp Concierge</p>
            <p className="font-mono text-[#E0B84F] truncate">+{contact?.whatsapp_number || '919876543210'}</p>
          </div>
        </aside>

        {/* Content Stage */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#080808]">
          {loading ? (
            <div className="py-24 text-center text-xs uppercase tracking-widest text-[#C9A227] animate-pulse">
              Syncing Atelier Management Records...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && analytics && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                      Atelier Business Intelligence
                    </h2>
                    <p className="text-xs text-[#9B9B9B] mt-1">
                      Real-time revenue, orders, client accounts, and low-inventory alerts.
                    </p>
                  </div>

                  {/* 4 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
                      <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B] block mb-2">
                        Gross Order Volume
                      </span>
                      <span className="text-2xl font-bold text-[#E0B84F]">
                        ₹{analytics.total_revenue.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-5 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
                      <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B] block mb-2">
                        Total Orders
                      </span>
                      <span className="text-2xl font-bold text-[#F5F2EA]">
                        {analytics.total_orders}
                      </span>
                    </div>

                    <div className="p-5 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
                      <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B] block mb-2">
                        Pending Confirmation
                      </span>
                      <span className="text-2xl font-bold text-amber-400">
                        {analytics.pending_orders}
                      </span>
                    </div>

                    <div className="p-5 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
                      <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B] block mb-2">
                        Registered Patrons
                      </span>
                      <span className="text-2xl font-bold text-[#F5F2EA]">
                        {analytics.total_customers}
                      </span>
                    </div>
                  </div>

                  {/* Low Stock Alerts (Requirement #30) */}
                  <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={18} className="text-amber-400" />
                        <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
                          Low Inventory Alert (≤ 5 Remaining)
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="text-xs uppercase tracking-wider text-[#C9A227] hover:underline"
                      >
                        Adjust Stock Levels →
                      </button>
                    </div>

                    {analytics.low_stock_products.length === 0 ? (
                      <p className="text-xs text-[#888888]">All creations are adequately stocked.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.low_stock_products.map(p => (
                          <div
                            key={p.id}
                            className="p-3 rounded bg-[#141414] border border-amber-500/30 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#F5F2EA]">{p.name}</p>
                              <p className="text-[10px] text-[#888888]">SKU: {p.sku}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">
                              {p.stock} left
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS & DISPATCH */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                        Orders & WhatsApp Confirmations
                      </h2>
                      <p className="text-xs text-[#9B9B9B] mt-1">
                        Review customer dispatches, update timeline milestones, or moderate cancellations.
                      </p>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center space-x-3">
                      <select
                        value={orderFilterStatus}
                        onChange={e => setOrderFilterStatus(e.target.value)}
                        className="bg-[#141414] border border-[#262626] rounded px-3 py-2 text-xs text-[#F5F2EA] uppercase outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCEL_REQUESTED">Cancellation Requested</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Details Modal / Drawer if selected */}
                  {selectedOrder ? (
                    <div className="bg-[#0D0D0D] border border-[#C9A227]/40 rounded p-6 sm:p-8 space-y-6">
                      <div className="flex justify-between items-start pb-4 border-b border-[#1C1C1C]">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B]">
                            Order Number
                          </span>
                          <h3 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                            #{selectedOrder.order_number}
                          </h3>
                          <p className="text-xs text-[#9B9B9B]">
                            Customer: <strong>{selectedOrder.customer_name}</strong> ({selectedOrder.customer_email})
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-[#9B9B9B] hover:text-[#F5F2EA]"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* If cancellation was requested */}
                      {selectedOrder.status === 'CANCEL_REQUESTED' && (
                        <div className="p-4 rounded bg-orange-950/40 border border-orange-800 text-xs text-orange-200 space-y-2">
                          <p className="font-semibold">⚠️ Customer Requested Cancellation</p>
                          <p>
                            Reason: "{selectedOrder.cancellation_reason || 'Customer requested via WhatsApp'}"
                          </p>
                          <div className="pt-2 flex space-x-3">
                            <button
                              onClick={async () => {
                                await api.admin.updateOrderStatus(selectedOrder.id, {
                                  status: 'CANCELLED',
                                  internal_notes: 'Cancellation approved by admin'
                                });
                                notify('success', 'Order cancelled');
                                setSelectedOrder(null);
                                const updated = await api.admin.getOrders();
                                setOrders(updated);
                              }}
                              className="px-3 py-1.5 rounded bg-red-900 hover:bg-red-800 text-white font-bold"
                            >
                              Approve & Cancel Order
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status Update Form */}
                      <form onSubmit={handleUpdateOrderStatus} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Transition Status
                          </label>
                          <select
                            value={orderStatusUpdate.status || selectedOrder.status}
                            onChange={e => setOrderStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          >
                            <option value="PENDING_CONFIRMATION">PENDING_CONFIRMATION</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Courier Name (If Shipped)
                          </label>
                          <input
                            type="text"
                            value={orderStatusUpdate.courier_name}
                            onChange={e => setOrderStatusUpdate(prev => ({ ...prev, courier_name: e.target.value }))}
                            placeholder="BlueDart / Delhivery / DHL Express"
                            className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Tracking / Waybill Number
                          </label>
                          <input
                            type="text"
                            value={orderStatusUpdate.tracking_number}
                            onChange={e => setOrderStatusUpdate(prev => ({ ...prev, tracking_number: e.target.value }))}
                            placeholder="e.g. BD987123998IN"
                            className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Internal Atelier Notes
                          </label>
                          <input
                            type="text"
                            value={orderStatusUpdate.internal_notes}
                            onChange={e => setOrderStatusUpdate(prev => ({ ...prev, internal_notes: e.target.value }))}
                            placeholder="e.g. Confirmed with customer on WhatsApp"
                            className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 pt-2">
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold"
                          >
                            Save Status Milestone
                          </button>
                        </div>
                      </form>

                      {/* Items In this Order */}
                      <div className="pt-4 border-t border-[#1C1C1C]">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-[#F5F2EA] mb-3">
                          Items ({selectedOrder.items.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-[#D5D2CA] p-2 bg-[#141414] rounded">
                              <span>{i.product_name} ({i.size} / {i.color}) × {i.quantity}</span>
                              <span className="font-bold">₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Orders Table */}
                  <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141414] text-[#9B9B9B] uppercase tracking-wider border-b border-[#1C1C1C]">
                        <tr>
                          <th className="p-4">Order #</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">WhatsApp Phone</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-[#111111] transition-colors">
                            <td className="p-4 font-mono font-bold text-[#F5F2EA]">#{order.order_number}</td>
                            <td className="p-4 text-[#D5D2CA]">{order.delivery_address.full_name}</td>
                            <td className="p-4 font-mono text-[#C9A227]">{order.delivery_address.phone}</td>
                            <td className="p-4 font-bold text-[#F5F2EA]">₹{order.total_amount.toLocaleString('en-IN')}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-[#1A1A1A] border border-[#2B2B2B]">
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-[#888888]">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOrderStatusUpdate({
                                    status: order.status,
                                    courier_name: order.courier_name || '',
                                    tracking_number: order.tracking_number || '',
                                    internal_notes: order.internal_notes || ''
                                  });
                                }}
                                className="px-3 py-1.5 rounded bg-[#181818] border border-[#2B2B2B] hover:border-[#C9A227] text-xs font-semibold text-[#E0B84F]"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                        Catalog & Creations ({products.length})
                      </h2>
                      <p className="text-xs text-[#9B9B9B] mt-1">
                        Add new bespoke pieces, edit pricing, update photography, or adjust sizes.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct({
                          name: '',
                          slug: '',
                          description: '',
                          category_id: categories[0]?.id || '',
                          price: 25000,
                          stock: 10,
                          sizes: ['S', 'M', 'L', 'XL'],
                          colors: ['Midnight Black', 'Gold Accents'],
                          images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80'],
                          is_featured: false,
                          is_bestseller: false,
                          is_new_arrival: true,
                          sku: `87PC-${Math.floor(1000 + Math.random() * 9000)}`
                        });
                        setProductModalOpen(true);
                      }}
                      className="px-4 py-2 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5"
                    >
                      <Plus size={15} />
                      <span>New Product</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(prod => (
                      <div
                        key={prod.id}
                        className="bg-[#0D0D0D] border border-[#1C1C1C] rounded p-4 flex flex-col justify-between"
                      >
                        <div>
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-48 object-cover rounded mb-3 bg-[#151515]"
                          />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-[#C9A227]">
                                {prod.category_name}
                              </span>
                              <h3 className="font-editorial text-sm font-semibold text-[#F5F2EA]">
                                {prod.name}
                              </h3>
                              <p className="text-[10px] text-[#666666]">SKU: {prod.sku}</p>
                            </div>
                            <span className="text-xs font-bold text-[#E0B84F]">
                              ₹{(prod.sale_price ?? prod.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#1C1C1C] flex items-center justify-between text-xs">
                          <span className="text-[#888888]">Stock: <strong>{prod.stock}</strong></span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-[#9B9B9B] hover:text-[#C9A227]"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-[#9B9B9B] hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                        Collections & Categories ({categories.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory({
                          name: '',
                          slug: '',
                          description: '',
                          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
                          display_order: categories.length + 1
                        });
                        setCategoryModalOpen(true);
                      }}
                      className="px-4 py-2 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5"
                    >
                      <Plus size={15} />
                      <span>New Men's Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                      <div key={cat.id} className="bg-[#0D0D0D] border border-[#1C1C1C] rounded p-4">
                        <img src={cat.image} alt={cat.name} className="w-full h-36 object-cover rounded mb-3" />
                        <h3 className="font-editorial text-base font-bold text-[#F5F2EA]">{cat.name}</h3>
                        <p className="text-xs text-[#9B9B9B] mt-1 line-clamp-2">{cat.description}</p>
                        <div className="pt-3 mt-3 border-t border-[#1C1C1C] flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                            className="p-1.5 text-[#9B9B9B] hover:text-[#C9A227]"
                            title="Edit Category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-[#9B9B9B] hover:text-red-400"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                      Inventory Control & Rapid Stock Adjustment
                    </h2>
                    <p className="text-xs text-[#9B9B9B] mt-1">
                      Update inventory counts directly. Low inventory (≤ 5) is automatically highlighted.
                    </p>
                  </div>

                  <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141414] text-[#9B9B9B] uppercase tracking-wider border-b border-[#1C1C1C]">
                        <tr>
                          <th className="p-4">Piece</th>
                          <th className="p-4">SKU</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Current Stock</th>
                          <th className="p-4">Quick Adjust</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-[#111111]">
                            <td className="p-4 font-semibold text-[#F5F2EA]">{p.name}</td>
                            <td className="p-4 font-mono text-[#888888]">{p.sku}</td>
                            <td className="p-4 text-[#9B9B9B]">{p.category_name}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                p.stock <= 5 ? 'bg-amber-950 text-amber-300' : 'text-[#D5D2CA]'
                              }`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={p.stock}
                                  id={`stock-input-${p.id}`}
                                  className="w-20 bg-[#141414] border border-[#2B2B2B] rounded px-2 py-1 text-xs text-[#F5F2EA] outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const input = document.getElementById(`stock-input-${p.id}`) as HTMLInputElement;
                                    if (input) {
                                      handleQuickStockUpdate(p.id, Number(input.value));
                                    }
                                  }}
                                  className="px-3 py-1 bg-[#181818] border border-[#2B2B2B] hover:border-[#C9A227] text-xs text-[#E0B84F] rounded font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: BANNERS */}
              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                        Editorial Banners & Hero Showcase
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBanner({
                          title: '',
                          subtitle: '',
                          cta_text: 'DISCOVER',
                          cta_link: '/shop',
                          image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80',
                          badge: 'AUTUMN / WINTER',
                          position: 'hero',
                          is_active: true,
                          display_order: 1
                        });
                        setBannerModalOpen(true);
                      }}
                      className="px-4 py-2 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5"
                    >
                      <Plus size={15} />
                      <span>New Banner</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map(b => (
                      <div key={b.id} className="bg-[#0D0D0D] border border-[#1C1C1C] rounded overflow-hidden">
                        <img src={b.image_url} alt={b.title} className="w-full h-48 object-cover" />
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-[#C9A227]">{b.position} • Order {b.display_order}</span>
                          <h3 className="font-editorial text-base font-bold text-[#F5F2EA]">{b.title}</h3>
                          <p className="text-xs text-[#9B9B9B]">{b.subtitle}</p>
                          <div className="pt-3 border-t border-[#1C1C1C] flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setBannerModalOpen(true);
                              }}
                              className="p-1.5 text-[#9B9B9B] hover:text-[#C9A227]"
                              title="Edit Banner"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id)}
                              className="p-1.5 text-[#9B9B9B] hover:text-red-400"
                              title="Delete Banner"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                    Patron Testimonials Moderation ({reviews.length})
                  </h2>

                  <div className="space-y-4">
                    {reviews.map(rev => (
                      <div key={rev.id} className="p-4 rounded bg-[#0D0D0D] border border-[#1C1C1C] flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-[#F5F2EA] text-xs">{rev.user_name}</span>
                            <span className="text-[10px] text-[#C9A227]">★ {rev.rating}/5</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              rev.is_approved ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {rev.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-[#D5D2CA] mt-1">"{rev.comment}"</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleReviewStatus(rev.id, rev.is_approved)}
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              rev.is_approved ? 'bg-[#1C1C1C] text-[#9B9B9B]' : 'bg-[#C9A227] text-[#080808]'
                            }`}
                          >
                            {rev.is_approved ? 'Unapprove' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                    Registered Patrons & Roles ({customers.length})
                  </h2>

                  <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141414] text-[#9B9B9B] uppercase tracking-wider border-b border-[#1C1C1C]">
                        <tr>
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Promote / Demote</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]">
                        {customers.map(c => (
                          <tr key={c.id} className="hover:bg-[#111111]">
                            <td className="p-4 font-semibold text-[#F5F2EA]">{c.full_name}</td>
                            <td className="p-4 text-[#9B9B9B]">{c.email}</td>
                            <td className="p-4 font-mono text-[#C9A227]">{c.phone || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                c.role === 'admin' ? 'bg-[#C9A227]/20 text-[#E0B84F]' : 'bg-[#1A1A1A] text-[#9B9B9B]'
                              }`}>
                                {c.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={async () => {
                                  const newRole = c.role === 'admin' ? 'customer' : 'admin';
                                  await api.admin.updateCustomerRole(c.id, newRole);
                                  notify('success', `User updated to ${newRole}`);
                                  const updated = await api.admin.getCustomers();
                                  setCustomers(updated);
                                }}
                                className="px-3 py-1 bg-[#181818] border border-[#2B2B2B] hover:border-[#C9A227] text-xs text-[#E0B84F] rounded"
                              >
                                Toggle Role ({c.role === 'admin' ? 'Set as Customer' : 'Set as Admin'})
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 9: SITE & WHATSAPP SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-4xl">
                  <div>
                    <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                      Site Configuration & WhatsApp Concierge
                    </h2>
                    <p className="text-xs text-[#9B9B9B] mt-1">
                      Control the client-facing website, WhatsApp routing number, announcement bar, and fees.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    {/* WhatsApp Routing Configuration (Requirement #20 & #33) */}
                    <div className="p-6 rounded bg-[#0D0D0D] border border-[#C9A227]/40 space-y-4">
                      <div className="flex items-center space-x-2 text-[#C9A227]">
                        <MessageCircle size={20} />
                        <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
                          Shop WhatsApp Order Routing Number
                        </h3>
                      </div>
                      <p className="text-xs text-[#9B9B9B]">
                        This is the WhatsApp number that receives order confirmation messages, custom tailoring requests, and client cancellation inquiries.
                      </p>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                          WhatsApp Number (International format without +)
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.whatsapp_number || ''}
                          onChange={e => setContactForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          placeholder="919876543210"
                          className="w-full max-w-md bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs font-mono text-[#F5F2EA] outline-none"
                        />
                      </div>
                    </div>

                    {/* Announcement Bar & Shipping Thresholds */}
                    <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C] space-y-4">
                      <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
                        Storefront Announcement & Shipping Rules
                      </h3>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="announcement-toggle"
                          checked={siteForm.announcement_enabled}
                          onChange={e => setSiteForm(prev => ({ ...prev, announcement_enabled: e.target.checked }))}
                          className="accent-[#C9A227]"
                        />
                        <label htmlFor="announcement-toggle" className="text-xs text-[#D5D2CA]">
                          Enable Top Announcement Strip
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                          Announcement Bar Text
                        </label>
                        <input
                          type="text"
                          value={siteForm.announcement_text || ''}
                          onChange={e => setSiteForm(prev => ({ ...prev, announcement_text: e.target.value }))}
                          className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Free Shipping Minimum (₹)
                          </label>
                          <input
                            type="number"
                            value={siteForm.free_shipping_threshold}
                            onChange={e => setSiteForm(prev => ({ ...prev, free_shipping_threshold: Number(e.target.value) }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Standard Shipping Fee (₹)
                          </label>
                          <input
                            type="number"
                            value={siteForm.standard_shipping_fee}
                            onChange={e => setSiteForm(prev => ({ ...prev, standard_shipping_fee: Number(e.target.value) }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact & Atelier Physical Details */}
                    <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C] space-y-4">
                      <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
                        Contact Information Management
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Shop Support Email
                          </label>
                          <input
                            type="email"
                            value={contactForm.shop_email || ''}
                            onChange={e => setContactForm(prev => ({ ...prev, shop_email: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={contactForm.phone_number || ''}
                            onChange={e => setContactForm(prev => ({ ...prev, phone_number: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Atelier Physical Address
                          </label>
                          <input
                            type="text"
                            value={contactForm.address || ''}
                            onChange={e => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Business / Salon Hours
                          </label>
                          <input
                            type="text"
                            value={contactForm.business_hours || ''}
                            onChange={e => setContactForm(prev => ({ ...prev, business_hours: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                            Google Maps Link
                          </label>
                          <input
                            type="text"
                            value={contactForm.google_maps_url || ''}
                            onChange={e => setContactForm(prev => ({ ...prev, google_maps_url: e.target.value }))}
                            className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-xl"
                    >
                      Save All Settings
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Edit / Create Modal */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F0F0F] border border-[#262626] rounded p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#F5F2EA]"
            >
              <X size={20} />
            </button>

            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] mb-6">
              {editingProduct.id ? 'Edit Atelier Creation' : 'Create New Creation'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Category</label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={e => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setEditingProduct(prev => ({
                        ...prev,
                        category_id: e.target.value,
                        category_name: cat?.name
                      }));
                    }}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={e => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Sale Price (₹ Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ''}
                    onChange={e => setEditingProduct(prev => ({
                      ...prev,
                      sale_price: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 0}
                    onChange={e => setEditingProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUpload
                    value={editingProduct.images?.[0] || ''}
                    onChange={url => setEditingProduct(prev => ({ ...prev, images: [url] }))}
                    label="Primary Atelier Creation Photograph"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B]">
                      Men's Sizing (Comma-separated)
                    </label>
                    <div className="flex gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }))}
                        className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#C9A227] hover:text-black text-[#D5D2CA] transition-colors"
                      >
                        Tops / Shirts
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, sizes: ['30', '32', '34', '36', '38', '40'] }))}
                        className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#C9A227] hover:text-black text-[#D5D2CA] transition-colors"
                      >
                        Waist / Denim
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'] }))}
                        className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#C9A227] hover:text-black text-[#D5D2CA] transition-colors"
                      >
                        Footwear
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, sizes: ['One Size'] }))}
                        className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#C9A227] hover:text-black text-[#D5D2CA] transition-colors"
                      >
                        One Size
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editingProduct.sizes?.join(', ') || ''}
                    onChange={e => setEditingProduct(prev => ({
                      ...prev,
                      sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="e.g. S, M, L, XL, XXL"
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Colors & Finishes (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.colors?.join(', ') || ''}
                    onChange={e => setEditingProduct(prev => ({
                      ...prev,
                      colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    }))}
                    placeholder="e.g. Midnight Black, Charcoal Slate, Raw Indigo"
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-[#D5D2CA]">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured || false}
                    onChange={e => setEditingProduct(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="accent-[#C9A227]"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-[#D5D2CA]">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_bestseller || false}
                    onChange={e => setEditingProduct(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                    className="accent-[#C9A227]"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-[#D5D2CA]">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_new_arrival || false}
                    onChange={e => setEditingProduct(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                    className="accent-[#C9A227]"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold rounded mt-4 transition-all"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Edit / Create Modal */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F0F0F] border border-[#262626] rounded p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setCategoryModalOpen(false);
                setEditingCategory(null);
              }}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#F5F2EA]"
              aria-label="Close category modal"
            >
              <X size={20} />
            </button>

            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] mb-6">
              {editingCategory.id ? 'Edit Category' : 'Create New Collection / Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => {
                    const name = e.target.value;
                    setEditingCategory(prev => ({
                      ...prev,
                      name,
                      slug: prev?.slug && prev.id ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    }));
                  }}
                  placeholder="e.g. T-Shirts, Shirts, Trousers, Jackets, Footwear"
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. t-shirts, jackets, footwear"
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.display_order ?? 1}
                  onChange={e => setEditingCategory(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                />
              </div>

              <div>
                <ImageUpload
                  value={editingCategory.image || ''}
                  onChange={url => setEditingCategory(prev => ({ ...prev, image: url }))}
                  label="Category Cover Photograph"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Atmospheric summary of this curation..."
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2.5 rounded bg-[#1A1A1A] hover:bg-[#252525] text-xs uppercase tracking-wider text-[#D5D2CA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold transition-all shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Edit / Create Modal */}
      {bannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0F0F0F] border border-[#262626] rounded p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setBannerModalOpen(false);
                setEditingBanner(null);
              }}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#F5F2EA]"
              aria-label="Close banner modal"
            >
              <X size={20} />
            </button>

            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] mb-6">
              {editingBanner.id ? 'Edit Editorial Banner' : 'Create Editorial Banner'}
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={editingBanner.title || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Royal Bengal Heritage Collection"
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Crafted in purest 24-karat gold inlay & bespoke cashmere"
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. AUTUMN / WINTER"
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Position</label>
                  <select
                    value={editingBanner.position || 'hero'}
                    onChange={e => setEditingBanner(prev => ({ ...prev, position: e.target.value as any }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  >
                    <option value="hero">Hero Carousel</option>
                    <option value="editorial">Editorial Spotlight</option>
                    <option value="promotional">Promotional Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={editingBanner.cta_text || 'DISCOVER'}
                    onChange={e => setEditingBanner(prev => ({ ...prev, cta_text: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">CTA Destination Link</label>
                  <input
                    type="text"
                    value={editingBanner.cta_link || '/shop'}
                    onChange={e => setEditingBanner(prev => ({ ...prev, cta_link: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingBanner.display_order ?? 1}
                    onChange={e => setEditingBanner(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full bg-[#141414] border border-[#2B2B2B] rounded p-2 text-xs text-[#F5F2EA]"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 text-xs text-[#D5D2CA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBanner.is_active ?? true}
                      onChange={e => setEditingBanner(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="accent-[#C9A227]"
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <ImageUpload
                    value={editingBanner.image_url || ''}
                    onChange={url => setEditingBanner(prev => ({ ...prev, image_url: url }))}
                    label="Editorial Banner Photograph"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => {
                    setBannerModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="px-4 py-2.5 rounded bg-[#1A1A1A] hover:bg-[#252525] text-xs uppercase tracking-wider text-[#D5D2CA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold transition-all shadow-md"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

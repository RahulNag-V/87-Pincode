import React, { useState, useEffect } from 'react';
import {
  Package,
  Heart,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  X,
  Eye,
  Check,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { Order, Product } from '../types.js';
import { api } from '../lib/api.js';
import { LogoutGratitudeModal } from '../components/LogoutGratitudeModal.js';

interface AccountViewProps {
  initialTab?: string;
  initialOrderId?: string;
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  initialTab = 'orders',
  initialOrderId,
  navigate
}) => {
  const { user, logout, refreshUser } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessData, setCancelSuccessData] = useState<{
    whatsapp_url: string;
    whatsapp_message: string;
  } | null>(null);
  const [cancelCopied, setCancelCopied] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const list = await api.getMyOrders();
        setOrders(list);
        if (initialOrderId) {
          const found = list.find(o => o.id === initialOrderId);
          if (found) setSelectedOrder(found);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [initialOrderId]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }
      try {
        const all = await api.getProducts();
        setWishlistProducts(all.filter(p => wishlistIds.includes(p.id)));
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };
    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      await api.updateProfile({ full_name: fullName, phone });
      await refreshUser();
      setProfileMessage('Atelier profile updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleOpenCancelModal = (order: Order) => {
    setCancelOrderId(order.id);
    setCancelReason('');
    setCancelError('');
    setCancelSuccessData(null);
    setCancelCopied(false);
    setCancelModalOpen(true);
  };

  const handleSubmitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelOrderId || !cancelReason.trim()) return;

    setCancelSubmitting(true);
    setCancelError('');
    try {
      const res = await api.requestCancellation(cancelOrderId, cancelReason.trim());

      // Try opening WhatsApp
      if (res.whatsapp_url) {
        try {
          window.open(res.whatsapp_url, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Popup blocked or not permitted in current context:', e);
        }
      }

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === cancelOrderId ? { ...o, status: 'CANCEL_REQUESTED' as const } : o))
      );
      if (selectedOrder && selectedOrder.id === cancelOrderId) {
        setSelectedOrder(prev => (prev ? { ...prev, status: 'CANCEL_REQUESTED' as const } : null));
      }

      setCancelSuccessData({
        whatsapp_url: res.whatsapp_url,
        whatsapp_message: res.whatsapp_message
      });
    } catch (err: any) {
      setCancelError(err.message || 'Failed to submit cancellation request.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase tracking-wider font-semibold">
            Pending WhatsApp Confirmation
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase tracking-wider font-semibold">
            Confirmed by Atelier
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] uppercase tracking-wider font-semibold">
            Tailoring in Progress
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] uppercase tracking-wider font-semibold">
            Dispatched / In Transit
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">
            Delivered
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] uppercase tracking-wider font-semibold">
            Cancellation Requested
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-wider font-semibold">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const stages = [
    { key: 'PENDING_CONFIRMATION', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStageIndex = (status: Order['status']) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#1A1A1A] gap-8">
          {[
            { id: 'orders', label: 'Orders & Timeline', icon: Package },
            { id: 'wishlist', label: `Wishlist (${wishlistIds.length})`, icon: Heart },
            { id: 'profile', label: 'Client Profile', icon: UserIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedOrder(null);
                }}
                className={`flex items-center space-x-2 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-[#C9A227] text-[#E0B84F]'
                    : 'border-transparent text-[#9B9B9B] hover:text-[#F5F2EA]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Orders & Timeline */}
        {activeTab === 'orders' && (
          <div className="mt-8">
            {loadingOrders ? (
              <div className="py-20 text-center text-xs uppercase tracking-widest text-[#C9A227] animate-pulse">
                Retrieving Dispatch Records...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center bg-[#0D0D0D] border border-[#1A1A1A] rounded p-8">
                <Package size={48} className="text-[#333333] mx-auto mb-3" />
                <p className="font-editorial text-lg text-[#F5F2EA]">No Orders Placed Yet</p>
                <p className="text-xs text-[#9B9B9B] mt-1 max-w-sm mx-auto">
                  Your tailored orders and WhatsApp confirmation history will appear here.
                </p>
                <button
                  onClick={() => navigate('shop')}
                  className="mt-6 px-6 py-2.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold"
                >
                  Explore Collections
                </button>
              </div>
            ) : selectedOrder ? (
              /* Single Order Detailed View with 5-Stage Visual Timeline */
              <div className="space-y-8 animate-in fade-in duration-200">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs uppercase tracking-widest text-[#9B9B9B] hover:text-[#C9A227] flex items-center space-x-1"
                >
                  <span>← Return to Orders List</span>
                </button>

                <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded p-6 sm:p-8 space-y-8">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1A1A1A] gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B]">
                        Order #{selectedOrder.order_number || selectedOrder.id}
                      </span>
                      <h2 className="font-editorial text-2xl font-bold text-[#F5F2EA] mt-1">
                        ₹{(selectedOrder.total ?? selectedOrder.total_amount ?? 0).toLocaleString('en-IN')}
                      </h2>
                      <span className="text-[11px] text-[#666666]">
                        Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusBadge(selectedOrder.status)}

                      {/* Request Cancellation Button */}
                      {['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'].includes(
                        selectedOrder.status
                      ) && (
                        <button
                          onClick={() => handleOpenCancelModal(selectedOrder)}
                          className="px-3 py-1.5 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs uppercase tracking-wider font-semibold hover:bg-red-900/50 transition-all flex items-center space-x-1"
                        >
                          <RotateCcw size={12} />
                          <span>Request Cancellation</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 5-Stage Visual Progress Timeline */}
                  {!['CANCEL_REQUESTED', 'CANCELLED'].includes(selectedOrder.status) && (
                    <div className="py-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-[#9B9B9B] font-semibold mb-6">
                        Atelier Dispatch Timeline
                      </h3>
                      <div className="relative">
                        <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-[#1F1F1F] -translate-y-1/2 z-0" />
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                          {stages.map((stage, idx) => {
                            const currentIdx = getStageIndex(selectedOrder.status);
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div
                                key={stage.key}
                                className={`flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0 ${
                                  isCompleted ? 'text-[#E0B84F]' : 'text-[#444444]'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isCompleted
                                      ? 'bg-[#C9A227] text-[#080808] shadow-lg shadow-[#C9A227]/30'
                                      : 'bg-[#141414] border border-[#2B2B2B] text-[#666666]'
                                  } ${isCurrent ? 'ring-2 ring-[#C9A227] ring-offset-2 ring-offset-[#0D0D0D]' : ''}`}
                                >
                                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider mt-2">
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Courier Tracking info if shipped */}
                  {selectedOrder.status === 'SHIPPED' && selectedOrder.tracking_number && (
                    <div className="p-4 rounded bg-[#151208] border border-[#C9A227]/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck size={20} className="text-[#C9A227]" />
                        <div>
                          <p className="text-xs font-semibold text-[#F5F2EA]">
                            Dispatched via {selectedOrder.courier_name || 'Priority Express'}
                          </p>
                          <p className="text-[11px] text-[#D6C28A] font-mono">
                            Waybill / Tracking: {selectedOrder.tracking_number}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#9B9B9B]">Estimated Delivery in 2-3 Business Days</span>
                    </div>
                  )}

                  {/* Garment Items in this order */}
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#9B9B9B] font-semibold mb-4">
                      Pieces Included
                    </h3>
                    <div className="divide-y divide-[#1A1A1A] border-y border-[#1A1A1A]">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-4 flex items-center justify-between space-x-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-14 h-18 object-cover rounded bg-[#141414]"
                            />
                            <div>
                              <h4 className="text-xs font-semibold text-[#F5F2EA]">
                                {item.product_name}
                              </h4>
                              <div className="flex items-center space-x-2 text-[11px] text-[#888888] mt-0.5">
                                <span>Size: <strong className="text-[#D5D2CA]">{item.size}</strong></span>
                                <span>•</span>
                                <span>Color: <strong className="text-[#D5D2CA]">{item.color}</strong></span>
                                <span>•</span>
                                <span>Qty: <strong className="text-[#D5D2CA]">{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#F5F2EA]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-xs text-[#9B9B9B]">
                    <div className="p-4 rounded bg-[#111111] border border-[#1A1A1A]">
                      <h4 className="uppercase tracking-wider font-semibold text-[#F5F2EA] mb-2">
                        Delivery Address
                      </h4>
                      <p className="text-[#D5D2CA]">{selectedOrder.delivery_address.full_name}</p>
                      <p>{selectedOrder.delivery_address.street}</p>
                      {selectedOrder.delivery_address.landmark && <p>{selectedOrder.delivery_address.landmark}</p>}
                      <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}</p>
                      <p className="mt-1 text-[#C9A227]">WhatsApp: {selectedOrder.delivery_address.phone}</p>
                      {selectedOrder.delivery_address.order_notes && (
                        <p className="mt-2 text-[11px] italic text-[#888888]">
                          Notes: "{selectedOrder.delivery_address.order_notes}"
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded bg-[#111111] border border-[#1A1A1A] space-y-2">
                      <h4 className="uppercase tracking-wider font-semibold text-[#F5F2EA] mb-2">
                        Financial Summary
                      </h4>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-[#F5F2EA]">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Shipping</span>
                        <span className="text-[#F5F2EA]">
                          {((selectedOrder.shipping ?? selectedOrder.shipping_fee ?? 0) === 0) ? 'FREE' : `₹${(selectedOrder.shipping ?? selectedOrder.shipping_fee ?? 0).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-[#E0B84F] pt-2 border-t border-[#1C1C1C]">
                        <span>Total Paid / Payable</span>
                        <span>₹{(selectedOrder.total ?? selectedOrder.total_amount ?? 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-5 rounded bg-[#0D0D0D] border border-[#1C1C1C] hover:border-[#C9A227]/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded bg-[#141414] border border-[#222222] flex items-center justify-center text-[#C9A227]">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-[#F5F2EA]">
                            #{order.order_number || order.id}
                          </span>
                          <span className="text-[11px] text-[#666666]">
                            • {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#9B9B9B] mt-0.5">
                          {order.items.length} items • ₹{(order.total ?? order.total_amount ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusBadge(order.status)}
                      <ChevronRight size={16} className="text-[#666666]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="mt-8">
            {wishlistProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#0D0D0D] border border-[#1A1A1A] rounded p-8">
                <Heart size={48} className="text-[#333333] mx-auto mb-3" />
                <p className="font-editorial text-lg text-[#F5F2EA]">Your Wishlist is Empty</p>
                <p className="text-xs text-[#9B9B9B] mt-1">
                  Save pieces you admire while browsing the collection.
                </p>
                <button
                  onClick={() => navigate('shop')}
                  className="mt-6 px-6 py-2.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold"
                >
                  Browse Creations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="group bg-[#0D0D0D] border border-[#1C1C1C] rounded overflow-hidden flex flex-col justify-between"
                  >
                    <div
                      onClick={() => navigate('product', { slug: prod.slug })}
                      className="cursor-pointer"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full aspect-[3/4] object-cover"
                      />
                      <div className="p-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#C9A227]">
                          {prod.category_name}
                        </span>
                        <h3 className="font-editorial text-sm font-semibold text-[#F5F2EA] mt-1 line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs font-bold text-[#F5F2EA] mt-2">
                          ₹{(prod.sale_price ?? prod.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex space-x-2">
                      <button
                        onClick={() => {
                          const s = prod.sizes[0] || 'Standard';
                          const c = prod.colors[0] || 'Standard';
                          addItem(prod, s, c, 1);
                        }}
                        className="flex-1 py-2 rounded bg-[#181818] hover:bg-[#C9A227] hover:text-[#080808] text-[#F5F2EA] text-xs uppercase tracking-wider font-semibold transition-all"
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="px-3 py-2 rounded bg-[#181818] text-[#666666] hover:text-red-400 transition-colors"
                        title="Remove from wishlist"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Profile */}
        {activeTab === 'profile' && (
          <div className="mt-8 max-w-xl">
            <form
              onSubmit={handleUpdateProfile}
              className="bg-[#0D0D0D] border border-[#1C1C1C] rounded p-6 sm:p-8 space-y-6"
            >
              <h3 className="font-editorial text-lg font-bold text-[#F5F2EA] pb-3 border-b border-[#1A1A1A]">
                Personal Atelier Profile
              </h3>

              {profileMessage && (
                <div className="p-3 rounded bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#E0B84F] text-xs">
                  {profileMessage}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-xs text-[#666666] outline-none cursor-not-allowed"
                />
                <span className="text-[10px] text-[#666666] mt-1 block">
                  Email verification is tied to your primary authentication credential.
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                  Primary WhatsApp Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-3 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold rounded transition-all disabled:opacity-50"
                >
                  {profileSaving ? 'Saving Changes...' : 'Update Profile'}
                </button>
                <div className="flex items-center space-x-2">
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => navigate('admin')}
                      className="px-4 py-2.5 rounded bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E0B84F] text-xs uppercase tracking-wider font-semibold hover:bg-[#C9A227]/25 transition-all"
                    >
                      Admin Atelier
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGratitude(true)}
                    className="px-4 py-2.5 rounded bg-[#141414] border border-[#2B2B2B] hover:border-red-500/50 text-xs uppercase tracking-wider text-red-400 hover:bg-[#1C1C1C] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cancellation Request Modal (Requirement #25) */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#262626] rounded p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setCancelModalOpen(false);
                setCancelSuccessData(null);
              }}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#F5F2EA]"
            >
              <X size={20} />
            </button>

            {cancelSuccessData ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>

                <h3 className="font-editorial text-xl font-bold text-[#F5F2EA]">
                  Cancellation Request Logged
                </h3>

                <p className="text-xs text-[#9B9B9B] leading-relaxed">
                  Your order status has been updated to <strong>CANCEL REQUESTED</strong>. Please proceed to send the pre-filled notification via WhatsApp to complete the concierge cancellation.
                </p>

                <a
                  href={cancelSuccessData.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-[#080808] text-xs uppercase tracking-widest font-bold rounded transition-all shadow-lg"
                >
                  <MessageCircle size={16} />
                  <span>OPEN WHATSAPP CHAT</span>
                  <ExternalLink size={12} />
                </a>

                <div className="text-left bg-[#0A0A0A] border border-[#1C1C1C] rounded p-3">
                  <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#1C1C1C]">
                    <span className="text-[10px] uppercase tracking-wider text-[#777777]">Pre-filled Message</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(cancelSuccessData.whatsapp_message);
                        setCancelCopied(true);
                        setTimeout(() => setCancelCopied(false), 2000);
                      }}
                      className="text-[10px] text-[#C9A227] hover:underline flex items-center space-x-1"
                    >
                      <Copy size={10} />
                      <span>{cancelCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-[#AAAAAA] whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {cancelSuccessData.whatsapp_message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelSuccessData(null);
                  }}
                  className="w-full py-2.5 rounded bg-[#1A1A1A] hover:bg-[#252525] text-xs text-[#D5D2CA] transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] mb-2">
                  Request Order Cancellation
                </h3>
                <p className="text-xs text-[#9B9B9B] mb-6 leading-relaxed">
                  In accordance with our atelier policy, submitting this request will notify the proprietor on
                  WhatsApp to halt garment preparation and arrange cancellation.
                </p>

                {cancelError && (
                  <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-200 text-xs mb-4">
                    {cancelError}
                  </div>
                )}

                <form onSubmit={handleSubmitCancellation} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                      Reason for Cancellation *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="e.g. Changed sizing preference, placed duplicate order by mistake..."
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded p-3 text-xs text-[#F5F2EA] outline-none resize-none"
                    />
                  </div>

                  <div className="p-3 rounded bg-[#141414] border border-[#222222] text-[11px] text-[#888888]">
                    Clicking confirm will update the status to <strong>CANCEL REQUESTED</strong> and open WhatsApp with your cancellation request.
                  </div>

                  <button
                    type="submit"
                    disabled={cancelSubmitting}
                    className="w-full py-3 bg-red-800 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-bold rounded transition-all disabled:opacity-50"
                  >
                    {cancelSubmitting ? 'Processing Request...' : 'Confirm & Open WhatsApp Cancellation'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout Gratitude Modal */}
      <LogoutGratitudeModal
        isOpen={showGratitude}
        userName={user?.full_name}
        onConfirmLogout={async () => {
          await logout();
          setShowGratitude(false);
          navigate('home');
        }}
        onCancel={() => setShowGratitude(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useStore } from '../context/StoreContext.js';
import { DeliveryAddress } from '../types.js';
import { api } from '../lib/api.js';

interface CartViewProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const CartView: React.FC<CartViewProps> = ({ navigate }) => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shipping, total } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { site, contact } = useStore();

  const [address, setAddress] = useState<DeliveryAddress>({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    order_notes: ''
  });

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: keyof DeliveryAddress, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Rule 6: Customer MUST be authenticated before ordering
    if (!isAuthenticated) {
      openAuthModal(() => {
        // Callback after modal closes with successful login
      });
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your atelier cart is empty.');
      return;
    }

    // Validation
    if (!address.full_name || !address.phone || !address.street || !address.city || !address.pincode) {
      setErrorMessage('Please fill in all mandatory delivery address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map(i => ({
          product_id: i.product_id,
          size: i.size,
          color: i.color,
          quantity: i.quantity
        })),
        delivery_address: address
      };

      const res = await api.createOrder(orderPayload);

      // Clear local cart
      clearCart();

      // Try opening WhatsApp in new tab (may be blocked by browser/iframe popup blocker)
      if (res.whatsapp_url) {
        try {
          window.open(res.whatsapp_url, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Popup blocked or not permitted in current context:', e);
        }
      }

      // Navigate to order success screen with order details
      navigate('order-success', {
        order: res.order,
        whatsapp_url: res.whatsapp_url,
        whatsapp_message: res.whatsapp_message,
        shop_whatsapp_number: res.shop_whatsapp_number
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate order. Please verify connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#080808] text-center p-6">
        <ShoppingBag size={56} className="text-[#2A2A2A] mb-4 stroke-1" />
        <h2 className="font-editorial text-2xl text-[#F5F2EA] font-bold">Your Atelier Bag is Empty</h2>
        <p className="text-xs text-[#9B9B9B] mt-2 max-w-sm">
          Select from our curated collections of virgin wool tailoring, mulberry silk, and gold hardware.
        </p>
        <button
          onClick={() => navigate('shop')}
          className="mt-6 px-8 py-3 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#E0B84F] transition-all"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="pb-8 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-semibold">
              Checkout & Concierge
            </span>
            <h1 className="font-editorial text-3xl font-bold text-[#F5F2EA] mt-1">
              Your Atelier Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h1>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="hidden sm:flex items-center space-x-1 text-xs uppercase tracking-wider text-[#9B9B9B] hover:text-[#C9A227]"
          >
            <ArrowLeft size={14} />
            <span>Continue Browsing</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded bg-red-950/40 border border-red-800/80 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Unauthenticated Alert Callout if not logged in */}
        {!isAuthenticated && (
          <div className="mt-6 p-4 rounded bg-[#16140D] border border-[#C9A227]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Lock size={18} className="text-[#C9A227] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#F5F2EA]">Client Authentication Required</p>
                <p className="text-[11px] text-[#9B9B9B]">
                  Please sign in or create an account to finalize your order. Your bag will remain safe.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-4 py-2 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold whitespace-nowrap"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Two-Column Layout: Address on Left, Order Summary on Right */}
        <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Delivery Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
              <div className="flex items-center space-x-2 pb-4 border-b border-[#1A1A1A] mb-6">
                <MapPin size={18} className="text-[#C9A227]" />
                <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
                  Delivery Address & Client Contact
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.full_name}
                    onChange={e => handleInputChange('full_name', e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Street Address & Apartment/Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={e => handleInputChange('street', e.target.value)}
                    placeholder="Penthouse 4B, The Gilded Residency, 12th Main Road"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={address.landmark || ''}
                    onChange={e => handleInputChange('landmark', e.target.value)}
                    placeholder="Near Private Club"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={e => handleInputChange('state', e.target.value)}
                    placeholder="Karnataka"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={e => handleInputChange('pincode', e.target.value)}
                    placeholder="560038"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2.5 text-xs text-[#F5F2EA] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Bespoke Tailoring Instructions / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={address.order_notes || ''}
                    onChange={e => handleInputChange('order_notes', e.target.value)}
                    placeholder="Special requests, custom monogram initials, or delivery timing..."
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Atelier Order Items Review Strip */}
            <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C]">
              <h3 className="font-editorial text-base font-bold text-[#F5F2EA] mb-4">
                Pieces in this Dispatch
              </h3>
              <div className="divide-y divide-[#181818]">
                {items.map(item => (
                  <div key={`${item.product_id}-${item.size}-${item.color}`} className="py-4 flex space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded bg-[#141414] shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold text-[#F5F2EA] line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id, item.size, item.color)}
                            className="text-[#666666] hover:text-red-400 p-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-[#9B9B9B] mt-1">
                          <span>Size: <strong className="text-[#D5D2CA]">{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-[#D5D2CA]">{item.color}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#2B2B2B] rounded bg-[#141414]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                            className="p-1 text-[#9B9B9B] hover:text-[#F5F2EA]"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="px-2 text-xs text-[#F5F2EA] font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                            disabled={item.quantity >= item.max_stock}
                            className="p-1 text-[#9B9B9B] hover:text-[#F5F2EA] disabled:opacity-30"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#F5F2EA]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cost Summary & WhatsApp Dispatch Button (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded bg-[#0D0D0D] border border-[#1C1C1C] sticky top-28 space-y-6">
              <h3 className="font-editorial text-lg font-bold text-[#F5F2EA] pb-3 border-b border-[#1A1A1A]">
                Summary & Concierge Confirmation
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#9B9B9B]">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-[#F5F2EA]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-[#9B9B9B]">
                  <span>Priority Atelier Shipping</span>
                  <span className="text-[#F5F2EA]">
                    {shipping === 0 ? (
                      <span className="text-[#E0B84F] font-semibold">COMPLIMENTARY</span>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                <div className="border-t border-[#1F1F1F] pt-3 flex justify-between text-base font-bold text-[#F5F2EA]">
                  <span>Total Order Value</span>
                  <span className="text-[#E0B84F] text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Informative WhatsApp Confirmation Notice */}
              <div className="p-4 rounded bg-[#111111] border border-[#222222] text-[11px] text-[#A6A6A6] space-y-2">
                <div className="flex items-center space-x-2 text-[#E0B84F] font-semibold">
                  <MessageCircle size={15} />
                  <span>How WhatsApp Order Confirmation Works</span>
                </div>
                <p className="leading-relaxed">
                  1. Your order is registered with an official <strong>#87PC</strong> order number.
                </p>
                <p className="leading-relaxed">
                  2. You will be redirected to WhatsApp with your order specifications and delivery address pre-filled.
                </p>
                <p className="leading-relaxed">
                  3. The boutique owner confirms stock, custom tailoring, and answers any inquiries before dispatch.
                </p>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                id="place-order-whatsapp-btn"
                disabled={submitting}
                className="w-full py-4 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold rounded flex items-center justify-center space-x-2 transition-all shadow-xl hover:shadow-[#C9A227]/30 disabled:opacity-50"
              >
                <MessageCircle size={18} />
                <span>{submitting ? 'GENERATING ATELIER DISPATCH...' : 'PLACE ORDER & OPEN WHATSAPP'}</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-[#777777]">
                <ShieldCheck size={14} className="text-[#C9A227]" />
                <span>Secure Client Protocol • No Automated Online Charging</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

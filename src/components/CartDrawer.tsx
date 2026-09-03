import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { useAuth } from '../context/AuthContext.js';

interface CartDrawerProps {
  onProceedToOrder: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToOrder,
  onContinueShopping
}) => {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    shipping,
    total,
    isCartDrawerOpen,
    closeCartDrawer
  } = useCart();
  const { site } = useStore();
  const { isAuthenticated, openAuthModal } = useAuth();

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = site?.free_shipping_threshold ?? 2999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleOrderClick = () => {
    closeCartDrawer();
    if (!isAuthenticated) {
      openAuthModal(() => {
        onProceedToOrder();
      });
    } else {
      onProceedToOrder();
    }
  };

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#0D0D0D] border-l border-[#1C1C1C] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1C1C1C] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} className="text-[#C9A227]" />
            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#F5F2EA]">
              Your Cart ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-1.5 text-[#9B9B9B] hover:text-[#F5F2EA] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-6 py-3 bg-[#141414] border-b border-[#1C1C1C]">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            {remainingForFreeShipping > 0 ? (
              <span className="text-[#D5D2CA]">
                Add <span className="text-[#E0B84F] font-semibold">₹{remainingForFreeShipping.toLocaleString('en-IN')}</span> more for complimentary priority shipping
              </span>
            ) : (
              <span className="text-[#E0B84F] font-semibold flex items-center space-x-1">
                <span>✓</span>
                <span>You have unlocked complimentary priority shipping</span>
              </span>
            )}
            <span className="text-[#9B9B9B]">{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="w-full h-1 bg-[#222222] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C9A227] transition-all duration-300"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto divide-y divide-[#181818]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag size={48} className="text-[#333333] mb-4 stroke-1" />
              <p className="text-sm text-[#F5F2EA] font-medium">Your cart is empty</p>
              <p className="text-xs text-[#9B9B9B] mt-1 max-w-xs">
                Explore our curated collections of virgin wool overcoats, pure mulberry silk, and gold accents.
              </p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  onContinueShopping();
                }}
                className="mt-6 px-6 py-2.5 rounded bg-[#181818] border border-[#2B2B2B] hover:border-[#C9A227] text-xs uppercase tracking-widest text-[#E0B84F] font-semibold transition-all"
              >
                Discover Collections
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="py-4 flex space-x-4 group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-24 object-cover rounded bg-[#1C1C1C] shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-[#F5F2EA] line-clamp-1 pr-2">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.product_id, item.size, item.color)}
                        className="text-[#666666] hover:text-red-400 transition-colors p-0.5"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-[#9B9B9B]">
                      <span>Size: <strong className="text-[#D5D2CA]">{item.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-[#D5D2CA]">{item.color}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#2B2B2B] rounded bg-[#141414]">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                        className="p-1 text-[#9B9B9B] hover:text-[#F5F2EA] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-medium text-[#F5F2EA]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                        disabled={item.quantity >= item.max_stock}
                        className="p-1 text-[#9B9B9B] hover:text-[#F5F2EA] disabled:opacity-30 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-[#F5F2EA]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-[#666666]">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with instant totals and Order Now trigger */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#1C1C1C] bg-[#0A0A0A] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#9B9B9B]">
                <span>Subtotal</span>
                <span className="text-[#F5F2EA]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#9B9B9B]">
                <span>Priority Shipping</span>
                <span className="text-[#F5F2EA]">
                  {shipping === 0 ? <span className="text-[#E0B84F] font-semibold">FREE</span> : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="border-t border-[#1F1F1F] pt-2 flex justify-between text-sm font-bold text-[#F5F2EA]">
                <span>Estimated Total</span>
                <span className="text-[#E0B84F] text-base">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              id="cart-drawer-order-now-btn"
              onClick={handleOrderClick}
              className="w-full py-3.5 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold rounded flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-[#C9A227]/20"
            >
              <span>PROCEED TO ORDER VIA WHATSAPP</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#888888]">
              <ShieldCheck size={13} className="text-[#C9A227]" />
              <span>Authentic Guarantee • WhatsApp Direct Confirmation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

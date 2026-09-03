import React from 'react';
import {
  CheckCircle2,
  MessageCircle,
  Package,
  Copy,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../types.js';

interface OrderSuccessViewProps {
  params: {
    order?: Order;
    whatsapp_url?: string;
    whatsapp_message?: string;
    shop_whatsapp_number?: string;
  };
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ params, navigate }) => {
  const { order, whatsapp_url, whatsapp_message, shop_whatsapp_number } = params;

  const [copied, setCopied] = React.useState(false);

  const handleCopyMessage = () => {
    if (whatsapp_message) {
      navigator.clipboard.writeText(whatsapp_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg p-8 sm:p-12 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>

          <span className="text-[11px] uppercase tracking-[0.3em] text-[#C9A227] font-semibold">
            Order Created Successfully
          </span>

          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#F5F2EA] mt-2 mb-4">
            Confirmation in Progress
          </h1>

          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded bg-[#141414] border border-[#2B2B2B] text-xs font-mono text-[#D6C28A] mb-6">
            <span>Order Number: <strong>#{order?.order_number || order?.id || '87PC-PROCESSED'}</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">PENDING CONFIRMATION</span>
          </div>

          <p className="text-xs sm:text-sm text-[#D5D2CA] max-w-xl mx-auto leading-relaxed mb-8">
            Your order has been registered in the atelier database. Please ensure you have sent the generated confirmation message to our boutique concierge on WhatsApp.
          </p>

          {/* Primary Action: Open WhatsApp Button (Fallback if popup was blocked) */}
          {whatsapp_url && (
            <div className="space-y-4 mb-10">
              <a
                href={whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded bg-[#25D366] hover:bg-[#20bd5a] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-xl"
              >
                <MessageCircle size={18} />
                <span>CONTINUE TO WHATSAPP CONCIERGE</span>
                <ExternalLink size={14} />
              </a>

              <p className="text-[11px] text-[#888888]">
                If WhatsApp did not open automatically, tap the green button above.
              </p>
            </div>
          )}

          {/* WhatsApp Message Preview & Copy */}
          {whatsapp_message && (
            <div className="text-left bg-[#080808] border border-[#1A1A1A] rounded p-4 mb-8">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A] mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[#9B9B9B] font-semibold">
                  Pre-filled WhatsApp Message
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="text-[11px] text-[#C9A227] hover:underline flex items-center space-x-1"
                >
                  <Copy size={12} />
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-[#D5D2CA] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {whatsapp_message}
              </pre>
            </div>
          )}

          {/* Order Details Accordion / Summary */}
          {order && (
            <div className="text-left bg-[#121212] border border-[#222222] rounded p-6 mb-8 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#F5F2EA] font-semibold pb-2 border-b border-[#222222]">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-[#D5D2CA]">
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Total Items:</span>
                  <span>{order.items.reduce((s, i) => s + i.quantity, 0)} pieces</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Subtotal:</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9B9B9B]">Priority Shipping:</span>
                  <span>{((order.shipping ?? order.shipping_fee ?? 0) === 0) ? 'COMPLIMENTARY' : `₹${(order.shipping ?? order.shipping_fee ?? 0).toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between font-bold text-[#E0B84F] pt-2 border-t border-[#1F1F1F]">
                  <span>Total Amount:</span>
                  <span>₹{(order.total ?? order.total_amount ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#9B9B9B]">
                <strong>Delivery Recipient:</strong> {order.delivery_address.full_name}, {order.delivery_address.street}, {order.delivery_address.city} - {order.delivery_address.pincode}
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('account', { tab: 'orders', orderId: order?.id })}
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#181818] border border-[#2B2B2B] hover:border-[#C9A227] text-xs uppercase tracking-wider text-[#F5F2EA] font-semibold flex items-center justify-center space-x-2"
            >
              <Package size={15} className="text-[#C9A227]" />
              <span>Track Order In Account</span>
            </button>

            <button
              onClick={() => navigate('shop')}
              className="w-full sm:w-auto px-6 py-3 rounded text-xs uppercase tracking-wider text-[#9B9B9B] hover:text-[#E0B84F]"
            >
              Continue Exploring Shop →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { api } from '../lib/api.js';

interface FooterProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { site, contact, categories } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    setError('');
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#080808] border-t border-charcoal text-[#9B9B9B] text-xs pt-16 pb-10 modern-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-charcoal">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="luxury-serif text-2xl font-bold tracking-[0.25em] text-[#F5F2EA]">
                87 PINCODE
              </span>
              <span className="w-1.5 h-1.5 rounded-full gold-bg"></span>
            </div>
            <p className="text-xs leading-relaxed text-[#D5D2CA]/70 max-w-sm">
              An exclusive men's clothing and fashion atelier dedicated to architectural menswear silhouettes,
              heavyweight textiles, and 24K gilded accents. Every order is personally confirmed through our
              bespoke WhatsApp concierge.
            </p>

            {/* Direct WhatsApp Concierge CTA */}
            {contact?.whatsapp_number && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${contact.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hello 87 Pincode, I would like to enquire about your menswear atelier collections.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded surface-dark border border-charcoal hover:border-[#C9A227] gold-text text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  <MessageCircle size={15} className="gold-text" />
                  <span>Connect with Menswear Concierge</span>
                </a>
              </div>
            )}
          </div>

          {/* Curated Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2EA] mb-4">
              Men's Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate('category', { slug: cat.slug })}
                    className="hover:text-[#E0B84F] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('shop')}
                  className="gold-text hover:underline"
                >
                  View All Menswear →
                </button>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2EA] mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('account', { tab: 'orders' })} className="hover:text-[#E0B84F]">
                  Track Order & Timeline
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-[#E0B84F]">
                  Order via WhatsApp Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-[#E0B84F]">
                  Craftsmanship & Sizing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-[#E0B84F]">
                  Cancellation & Alterations
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2EA] mb-4">
              Private Circular
            </h4>
            <p className="text-[11px] text-[#9B9B9B] mb-3 leading-relaxed">
              Receive private salon invitations and early previews of limited numbered runs.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs gold-text py-2">
                <CheckCircle2 size={16} />
                <span>You are subscribed to 87 Pincode.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full surface-dark border border-charcoal focus:border-[#C9A227] px-3 py-2 text-xs text-[#F5F2EA] placeholder-[#666666] rounded outline-none pr-8 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 gold-text hover:brightness-125"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-400">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Contact Info & Atelier Details Strip */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-[#888888] border-b border-charcoal pb-8">
          <div className="flex items-start space-x-2">
            <MapPin size={14} className="gold-text mt-0.5 shrink-0" />
            <span>{contact?.address || '87 Pincode Atelier, Luxury Fashion District, Bengaluru, India'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={14} className="gold-text shrink-0" />
            <span>{contact?.phone_number || '+91 98765 43210'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={14} className="gold-text shrink-0" />
            <span>{contact?.shop_email || 'concierge@87pincode.com'}</span>
          </div>
        </div>

        {/* Bottom Legal & WhatsApp Support Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-[#888888] space-y-4 sm:space-y-0">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} 87 PINCODE. All rights reserved.</span>
            <button onClick={() => navigate('contact')} className="hover:text-[#C9A227] transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('contact')} className="hover:text-[#C9A227] transition-colors">Terms of Service</button>
          </div>
          
          <div className="flex items-center gap-3 text-xs normal-case tracking-normal">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest text-[#D5D2CA]">WhatsApp Concierge Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

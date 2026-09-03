import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const ContactView: React.FC = () => {
  const { contact } = useStore();

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('Bespoke Tailoring Consultation');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cleanWhatsAppNumber = (contact?.whatsapp_number || '919876543210').replace(/[^\d]/g, '');
  const cleanPhoneNumber = (contact?.phone_number || '+919876543210').replace(/[^\d+]/g, '');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A227] font-semibold">
            ATELIER RECEPTION
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#F5F2EA] mt-2 mb-4">
            Contact & Concierge
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9B9B] leading-relaxed font-light">
            Whether inquiring about private salon viewings, bespoke pattern alterations, or order confirmations,
            our atelier concierge is directly accessible.
          </p>
        </div>

        {/* 4 Direct Action Buttons Strip (Requirement #33: Call, Email, WhatsApp, Get Directions) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {/* 1. WhatsApp Button */}
          <a
            href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent('Hello 87 Pincode, I am reaching out for atelier assistance.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded bg-[#0D0D0D] border border-[#222222] hover:border-[#25D366] group transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5F2EA] group-hover:text-[#25D366]">
              WhatsApp Direct
            </span>
            <span className="text-[11px] text-[#888888]">Instant Concierge</span>
          </a>

          {/* 2. Call Button */}
          <a
            href={`tel:${cleanPhoneNumber}`}
            className="p-5 rounded bg-[#0D0D0D] border border-[#222222] hover:border-[#C9A227] group transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5F2EA] group-hover:text-[#E0B84F]">
              Direct Call
            </span>
            <span className="text-[11px] text-[#888888]">{contact?.phone_number || '+91 98765 43210'}</span>
          </a>

          {/* 3. Email Button */}
          <a
            href={`mailto:${contact?.shop_email || 'concierge@87pincode.com'}`}
            className="p-5 rounded bg-[#0D0D0D] border border-[#222222] hover:border-[#C9A227] group transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5F2EA] group-hover:text-[#E0B84F]">
              Private Dispatch
            </span>
            <span className="text-[11px] text-[#888888]">{contact?.shop_email || 'concierge@87pincode.com'}</span>
          </a>

          {/* 4. Directions Button */}
          <a
            href={contact?.google_maps_url || 'https://maps.google.com/?q=Indiranagar+Bengaluru'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded bg-[#0D0D0D] border border-[#222222] hover:border-[#C9A227] group transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5F2EA] group-hover:text-[#E0B84F]">
              Get Directions
            </span>
            <span className="text-[11px] text-[#888888]">Google Maps Navigation</span>
          </a>
        </div>

        {/* Detailed Address, Hours & Message Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Atelier Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-8 bg-[#0D0D0D] border border-[#1C1C1C] rounded p-8">
            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] pb-4 border-b border-[#1A1A1A]">
              Atelier Location & Hours
            </h3>

            <div className="space-y-6 text-xs text-[#9B9B9B]">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F5F2EA] uppercase tracking-wider mb-1">
                    Atelier Headquarters
                  </h4>
                  <p className="leading-relaxed">
                    {contact?.address || '87 Pincode Atelier, 4th Avenue Luxury District, Indiranagar, Bengaluru, Karnataka 560038, India'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F5F2EA] uppercase tracking-wider mb-1">
                    Visiting & Salon Hours
                  </h4>
                  <p className="leading-relaxed">
                    {contact?.business_hours || 'Monday – Saturday: 10:00 AM – 8:30 PM IST | Sunday: 11:00 AM – 6:00 PM IST'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageCircle size={18} className="text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F5F2EA] uppercase tracking-wider mb-1">
                    WhatsApp Order Policy
                  </h4>
                  <p className="leading-relaxed">
                    Every order initiated via our shopping bag is routed directly to the boutique owner's verified WhatsApp number ({contact?.whatsapp_number}) to guarantee personal oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#1C1C1C] rounded p-8">
            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] pb-4 border-b border-[#1A1A1A] mb-6">
              Inquire with Atelier Concierge
            </h3>

            {submitted ? (
              <div className="p-6 rounded bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-[#F5F2EA]">Inquiry Received</h4>
                <p className="text-xs text-[#D5D2CA]">
                  An atelier concierge will contact you via WhatsApp or Email within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={e => setInquiryName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={e => setInquiryEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Subject / Department
                  </label>
                  <select
                    value={inquirySubject}
                    onChange={e => setInquirySubject(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
                  >
                    <option value="Bespoke Tailoring Consultation">Bespoke Tailoring Consultation</option>
                    <option value="Order & WhatsApp Inquiries">Order & WhatsApp Inquiries</option>
                    <option value="Private Salon Viewing">Private Salon Viewing Appointment</option>
                    <option value="Garment Alterations & Sizing">Garment Alterations & Sizing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryMessage}
                    onChange={e => setInquiryMessage(e.target.value)}
                    placeholder="Tell us about the piece or bespoke commission you have in mind..."
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded p-3 text-xs text-[#F5F2EA] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold rounded transition-all flex items-center justify-center space-x-2"
                >
                  <Send size={15} />
                  <span>Send Concierge Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

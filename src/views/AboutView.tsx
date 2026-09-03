import React from 'react';
import { Sparkles, Shield, Compass, MessageCircle, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Brand Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#C9A227] font-semibold">
            THE ATELIER MANIFESTO
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#F5F2EA] mt-3 mb-6 leading-tight">
            Precision in Shadow. Distinction in Gold.
          </h1>
          <p className="text-sm sm:text-base text-[#D5D2CA] leading-relaxed font-light">
            Founded with an uncompromising devotion to master tailoring, <strong>87 Pincode</strong> is an exclusive
            men's clothing and fashion atelier. We redefine contemporary menswear through pure architectural silhouettes,
            heavyweight textiles, and personal WhatsApp concierge patronage.
          </p>
        </div>

        {/* Large Editorial Imagery */}
        <div className="relative rounded overflow-hidden border border-[#222222] aspect-[16/9] sm:aspect-[21/9]">
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1800&q=85"
            alt="87 Pincode Menswear Atelier Craftsmanship"
            className="w-full h-full object-cover brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded bg-[#0D0D0D] border border-[#1C1C1C] space-y-3">
            <span className="text-xs font-mono text-[#C9A227]">01 / MATERIALS</span>
            <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
              Virgin Fibers & 24K Hardware
            </h3>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              We exclusively commission Grade-A virgin worsted wool, mulberry silk, and Mongolian cashmere.
              Every zipper, button, and buckle is individually dipped in 24-karat gold with ceramic protection.
            </p>
          </div>

          <div className="p-8 rounded bg-[#0D0D0D] border border-[#1C1C1C] space-y-3">
            <span className="text-xs font-mono text-[#C9A227]">02 / ARCHITECTURE</span>
            <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
              Savile Row Patterning
            </h3>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              Our silhouettes eschew transient fast-fashion trends in favor of structured shoulders, sculpted
              waists, and mathematical drape that commands room presence effortlessly.
            </p>
          </div>

          <div className="p-8 rounded bg-[#0D0D0D] border border-[#1C1C1C] space-y-3">
            <span className="text-xs font-mono text-[#C9A227]">03 / PATRONAGE</span>
            <h3 className="font-editorial text-lg font-bold text-[#F5F2EA]">
              Personal WhatsApp Concierge
            </h3>
            <p className="text-xs text-[#9B9B9B] leading-relaxed">
              We reject automated payment gateways and dispassionate algorithms. Every single order is confirmed
              directly with the atelier proprietor on WhatsApp, establishing a personal relationship.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-12 rounded bg-[#0D0D0D] border border-[#C9A227]/30 text-center space-y-6">
          <h2 className="font-editorial text-3xl font-bold text-[#F5F2EA]">
            Experience the 87 Pincode Menswear Wardrobe
          </h2>
          <p className="text-xs text-[#9B9B9B] max-w-lg mx-auto leading-relaxed">
            Discover our active runway suite or contact our atelier directly for custom sizing consultations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('shop')}
              className="px-8 py-3.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#E0B84F] transition-all"
            >
              Shop Menswear Collections
            </button>
            <button
              onClick={() => navigate('contact')}
              className="px-8 py-3.5 rounded bg-[#141414] border border-[#2B2B2B] text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2EA] hover:border-[#C9A227] transition-all"
            >
              Contact Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

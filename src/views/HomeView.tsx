import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Shield, Compass, Star, ChevronRight, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { Product, Banner, ProductReview } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductMasonryGrid } from '../components/ProductMasonryGrid.js';
import { api } from '../lib/api.js';

interface HomeViewProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const { site, contact, categories } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bannersData, productsData, reviewsData] = await Promise.all([
          api.getBanners().catch(() => []),
          api.getProducts().catch(() => []),
          api.admin.getReviews().catch(() => [])
        ]);

        setBanners(bannersData);
        setFeaturedProducts(productsData.filter(p => p.is_featured).slice(0, 4));
        setNewArrivals(productsData.filter(p => p.is_new_arrival).slice(0, 4));
        setBestSellers(productsData.filter(p => p.is_bestseller).slice(0, 4));
        setReviews(reviewsData.filter(r => r.is_approved).slice(0, 3));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const heroBanner = banners.find(b => b.position === 'hero') || {
    id: 'default-hero',
    title: site?.hero_title || 'THE BESPOKE MEN\'S WARDROBE',
    subtitle: site?.hero_subtitle || 'Sculpted in midnight shades and elevated with selective 24K gilded craftsmanship.',
    cta_text: site?.hero_cta_text || 'EXPLORE MENSWEAR',
    cta_link: site?.hero_cta_link || '/shop',
    image_url: site?.hero_image || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1800&q=85',
    badge: 'MEN\'S AUTUMN / WINTER 2026',
    is_active: true,
    display_order: 1,
    position: 'hero' as const
  };

  const promoBanner = banners.find(b => b.position === 'promo') || banners[1];

  const sectionsConfig = site?.sections_config || {
    hero: true,
    categories: true,
    featured: true,
    promo_banner: true,
    new_arrivals: true,
    best_sellers: true,
    craftsmanship: true,
    reviews: true,
    newsletter: true
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA]">
      {/* 1. EDITORIAL HERO SECTION */}
      {sectionsConfig.hero && (
        <section id="hero-section" className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          {/* Hero Background Image with Editorial Vignette */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBanner.image_url}
              alt="87 Pincode Haute Couture Hero"
              className="w-full h-full object-cover object-center brightness-[0.55] contrast-[1.1] scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-black/60" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080808]/30 to-[#080808]" />
          </div>

          {/* Hero Editorial Typography */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 flex flex-col items-center">
            {heroBanner.badge && (
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#080808]/80 border border-[#C9A227]/40 gold-text text-[10px] uppercase tracking-[0.3em] font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full gold-bg animate-pulse"></span>
                <span>{heroBanner.badge}</span>
              </div>
            )}

            <h1 className="luxury-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F2EA] max-w-4xl leading-[1.05] mb-6 drop-shadow-md">
              {heroBanner.title}
            </h1>

            <p className="modern-sans text-sm sm:text-base text-[#D5D2CA]/90 font-light tracking-wide max-w-2xl mx-auto mb-10 leading-relaxed">
              {heroBanner.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <button
                id="hero-cta-shop-btn"
                onClick={() => navigate('shop')}
                className="w-full sm:w-auto px-10 py-4 rounded gold-bg hover:brightness-110 text-black text-xs uppercase tracking-widest font-bold transition-all shadow-xl flex items-center justify-center space-x-2"
              >
                <span>{heroBanner.cta_text || 'SHOP COLLECTION'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                id="hero-cta-categories-btn"
                onClick={() => navigate('categories')}
                className="w-full sm:w-auto px-10 py-4 rounded bg-[#080808]/70 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#080808] text-xs uppercase tracking-widest font-bold transition-all backdrop-blur-sm"
              >
                EXPLORE STORE
              </button>
            </div>

            {/* Metric Highlights from Theme */}
            <div className="mt-14 flex flex-wrap gap-8 sm:gap-14 items-center justify-center pt-8 border-t border-charcoal/80">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl luxury-serif italic gold-text">87+</span>
                <span className="text-[10px] uppercase tracking-widest opacity-60 modern-sans">Master Artisans</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl luxury-serif italic gold-text">1.2k</span>
                <span className="text-[10px] uppercase tracking-widest opacity-60 modern-sans">Happy Connoisseurs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl luxury-serif italic gold-text">Verified</span>
                <span className="text-[10px] uppercase tracking-widest opacity-60 modern-sans">Gold Standard</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ANNOUNCEMENT & COMMITMENT RIBBON (BELOW HERO SECTION) */}
      {site?.announcement_enabled && (
        <div
          id="hero-announcement-ribbon"
          className="w-full bg-[#0D0D0D] border-y border-[#1C1C1C] py-3.5 px-4 sm:px-6 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2.5 text-[11px] uppercase tracking-[0.22em] text-[#D6C28A] font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C9A227] animate-pulse shrink-0"></span>
              <span>
                {site?.announcement_text ||
                  'COMPLIMENTARY NATIONWIDE PRIORITY SHIPPING ON ORDERS ABOVE ₹2,999 • BESPOKE WHATSAPP CONCIERGE'}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] text-[#9B9B9B] hidden md:flex shrink-0">
              <span className="flex items-center space-x-1.5">
                <span className="text-[#C9A227]">✦</span>
                <span>Authentic 24K Accents</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-[#C9A227]">✦</span>
                <span>Direct WhatsApp Concierge</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-[#C9A227]">✦</span>
                <span>Express Priority Dispatch</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORY ARCHETYPE GRID */}
      {sectionsConfig.categories && (
        <section id="categories-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-semibold">
                MEN'S FASHION DEPARTMENTS
              </span>
              <h2 className="luxury-serif text-2xl sm:text-3xl font-bold text-[#F5F2EA] mt-1">
                Men's Clothing Categories
              </h2>
            </div>
            <button
              onClick={() => navigate('categories')}
              className="mt-4 md:mt-0 text-xs uppercase tracking-[0.2em] gold-text hover:brightness-125 flex items-center space-x-1"
            >
              <span>View All {categories.length || 10} Categories</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => navigate('category', { slug: cat.slug })}
                className={`group relative h-96 rounded overflow-hidden cursor-pointer surface-dark border border-charcoal hover:border-[#C9A227]/60 transition-all duration-500 ${
                  idx === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.7]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/20" />

                <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-[0.25em] gold-text font-semibold">
                    Men's Department {idx + 1}
                  </span>
                  <h3 className="luxury-serif text-xl sm:text-2xl font-bold text-[#F5F2EA] mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#D5D2CA]/80 mt-1 line-clamp-2 max-w-lg modern-sans">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center space-x-1.5 text-xs gold-text font-semibold uppercase tracking-widest mt-3 group-hover:translate-x-1 transition-transform">
                    <span>Shop {cat.name}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. FEATURED PIECES (EDITORIAL PRESENTATION) */}
      {sectionsConfig.featured && (
        <section id="featured-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold">
              THE SIGNATURE SUITE
            </span>
            <h2 className="luxury-serif text-3xl sm:text-4xl font-bold text-[#F5F2EA] mt-2">
              Featured Men's Garments
            </h2>
            <p className="text-xs sm:text-sm text-[#9B9B9B] mt-3 leading-relaxed font-light modern-sans">
              Sculpted exclusively for the discerning man. Heavyweight combed cottons, raw Japanese denim, and precision tailoring.
            </p>
          </div>

          <ProductMasonryGrid
            products={featuredProducts}
            onSelectProduct={slug => navigate('product', { slug })}
            maxColumns={4}
            pageSize={8}
          />

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('shop')}
              className="px-10 py-3.5 rounded surface-dark border border-[#2B2B2B] hover:border-[#C9A227] gold-text text-xs uppercase tracking-[0.2em] font-semibold transition-all hover:brightness-110"
            >
              Browse Complete Menswear Catalog
            </button>
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS IN MENSWEAR */}
      {sectionsConfig.new_arrivals && newArrivals.length > 0 && (
        <section id="new-arrivals-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-semibold">
                LATEST ATELIER RELEASES
              </span>
              <h2 className="luxury-serif text-2xl sm:text-3xl font-bold text-[#F5F2EA] mt-1">
                New Arrivals in Menswear
              </h2>
            </div>
            <button
              onClick={() => navigate('shop', { filter: 'new_arrival' })}
              className="mt-4 md:mt-0 text-xs uppercase tracking-[0.2em] gold-text hover:brightness-125 flex items-center space-x-1"
            >
              <span>View All New Pieces</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <ProductMasonryGrid
            products={newArrivals}
            onSelectProduct={slug => navigate('product', { slug })}
            maxColumns={4}
            pageSize={8}
          />
        </section>
      )}

      {/* 5. BEST SELLERS */}
      {sectionsConfig.best_sellers && bestSellers.length > 0 && (
        <section id="bestsellers-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-charcoal">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-semibold">
                MOST COVETED SILHOUETTES
              </span>
              <h2 className="luxury-serif text-2xl sm:text-3xl font-bold text-[#F5F2EA] mt-1">
                Men's Best Sellers
              </h2>
            </div>
            <button
              onClick={() => navigate('shop', { filter: 'bestseller' })}
              className="mt-4 md:mt-0 text-xs uppercase tracking-[0.2em] gold-text hover:brightness-125 flex items-center space-x-1"
            >
              <span>View All Bestsellers</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <ProductMasonryGrid
            products={bestSellers}
            onSelectProduct={slug => navigate('product', { slug })}
            maxColumns={4}
            pageSize={8}
          />
        </section>
      )}

      {/* 6. BRAND STORY: THE 87 PINCODE MAN */}
      <section id="brand-story-section" className="py-24 bg-[#0A0A0A] border-b border-charcoal relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded overflow-hidden border border-charcoal aspect-[4/5] surface-dark">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85"
                  alt="87 Pincode Menswear Atelier"
                  className="w-full h-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 rounded bg-[#111111] border gold-border shadow-2xl hidden sm:block max-w-xs">
                <span className="text-[9px] uppercase tracking-[0.3em] gold-text font-bold block mb-1">MENSWEAR MANDATE</span>
                <p className="text-xs text-[#F5F2EA] font-serif italic">
                  "Exclusively designed for men. No compromises, no trends, pure sartorial authority."
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.35em] gold-text font-bold">
                THE 87 PINCODE DESTINATION
              </span>
              <h2 className="luxury-serif text-3xl sm:text-5xl font-bold text-[#F5F2EA] leading-tight">
                Architectural Menswear Crafted for Longevity
              </h2>
              <p className="modern-sans text-sm text-[#D5D2CA] leading-relaxed font-light">
                87 Pincode is strictly an atelier for men's fashion and clothing. We rejected the impersonal sprawl of general retail to dedicate our craft entirely to the male silhouette.
              </p>
              <p className="modern-sans text-sm text-[#9B9B9B] leading-relaxed font-light">
                From 280 GSM heavyweight combed tees to selvedge denim woven on shuttle looms and bespoke linen kurtas, every piece is engineered with mathematical proportions and hand-polished 24K gold accents.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-charcoal">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#F5F2EA] font-bold">100% Menswear</h4>
                  <p className="text-[11px] text-[#9B9B9B] mt-1">Exclusively tailored clothing, footwear, and accessories.</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#F5F2EA] font-bold">Bespoke Fit</h4>
                  <p className="text-[11px] text-[#9B9B9B] mt-1">Direct WhatsApp sizing concierge with atelier master tailors.</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('about')}
                  className="px-8 py-3.5 rounded bg-[#151515] border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#080808] transition-all text-xs uppercase tracking-widest font-bold flex items-center space-x-2"
                >
                  <span>Read Our Philosophy</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL EDITORIAL BANNER */}
      {sectionsConfig.promo_banner && promoBanner && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded overflow-hidden border border-charcoal surface-dark min-h-[420px] flex items-center">
            <div className="absolute inset-0 z-0">
              <img
                src={promoBanner.image_url}
                alt={promoBanner.title}
                className="w-full h-full object-cover brightness-[0.45] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/70 to-transparent" />
            </div>

            <div className="relative z-10 p-8 sm:p-14 max-w-xl">
              {promoBanner.badge && (
                <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold block mb-3">
                  {promoBanner.badge}
                </span>
              )}
              <h2 className="luxury-serif text-2xl sm:text-4xl font-bold text-[#F5F2EA] leading-tight mb-4">
                {promoBanner.title}
              </h2>
              <p className="modern-sans text-xs sm:text-sm text-[#D5D2CA] mb-8 leading-relaxed font-light">
                {promoBanner.subtitle}
              </p>
              <button
                onClick={() => navigate('shop')}
                className="px-10 py-4 gold-bg text-black text-xs uppercase tracking-widest font-bold rounded hover:brightness-110 transition-all shadow-lg flex items-center space-x-2"
              >
                <span>{promoBanner.cta_text || 'DISCOVER NOW'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. CRAFTSMANSHIP & ATELIER STANDARDS */}
      {sectionsConfig.craftsmanship && (
        <section className="py-20 bg-[#080808] border-y border-charcoal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="p-8 rounded surface-dark border border-charcoal">
                <div className="w-10 h-10 rounded bg-[#C9A227]/10 flex items-center justify-center gold-text mb-6">
                  <Sparkles size={20} />
                </div>
                <h3 className="luxury-serif text-lg font-bold text-[#F5F2EA] mb-2">
                  24K Gilded Accents
                </h3>
                <p className="text-xs text-[#9B9B9B] leading-relaxed modern-sans">
                  Every button, zipper puller, and crest is individually electroplated with genuine 24K gold
                  and protected by an anti-tarnish micro-ceramic coating.
                </p>
              </div>

              <div className="p-8 rounded surface-dark border border-charcoal">
                <div className="w-10 h-10 rounded bg-[#C9A227]/10 flex items-center justify-center gold-text mb-6">
                  <Compass size={20} />
                </div>
                <h3 className="luxury-serif text-lg font-bold text-[#F5F2EA] mb-2">
                  Savile Row Tailoring
                </h3>
                <p className="text-xs text-[#9B9B9B] leading-relaxed modern-sans">
                  Full canvas chest pieces, hand-padded lapels, and hand-stitched silk buttonholes ensure
                  silhouettes drape with natural architectural authority.
                </p>
              </div>

              <div className="p-8 rounded surface-dark border border-charcoal">
                <div className="w-10 h-10 rounded bg-[#C9A227]/10 flex items-center justify-center gold-text mb-6">
                  <MessageCircle size={20} />
                </div>
                <h3 className="luxury-serif text-lg font-bold text-[#F5F2EA] mb-2">
                  WhatsApp Concierge
                </h3>
                <p className="text-xs text-[#9B9B9B] leading-relaxed modern-sans">
                  No impersonal automated checkouts. Every order connects you directly with the boutique
                  proprietor on WhatsApp to confirm sizing, bespoke requests, and tracking.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. VERIFIED CLIENT REVIEWS */}
      {sectionsConfig.reviews && reviews.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold">
              PATRON TESTIMONIALS
            </span>
            <h2 className="luxury-serif text-3xl font-bold text-[#F5F2EA] mt-1">
              Reflections of Elegance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-6 rounded surface-dark border border-charcoal flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 gold-text mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#D5D2CA] leading-relaxed italic modern-sans">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-charcoal flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#F5F2EA]">{rev.user_name}</span>
                  <span className="gold-text font-medium">{rev.product_name || 'Verified Patron'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discreet Live Atelier Order Status Pill */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none z-30">
        <div className="bg-green-600/10 border border-green-600/25 px-3.5 py-1.5 rounded-full text-green-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>Order #87PC-1024 Confirmed</span>
        </div>
      </div>
    </div>
  );
};

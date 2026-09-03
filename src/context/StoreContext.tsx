import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, ContactSettings, Category } from '../types.js';
import { api } from '../lib/api.js';

interface StoreContextType {
  site: SiteSettings | null;
  contact: ContactSettings | null;
  categories: Category[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSiteSettings: SiteSettings = {
  store_name: '87 Pincode',
  tagline: 'High Fashion & Luxury Tailoring',
  currency_symbol: '₹',
  currency_code: 'INR',
  free_shipping_threshold: 2999,
  standard_shipping_fee: 199,
  announcement_text: 'COMPLIMENTARY NATIONWIDE PRIORITY SHIPPING ON ORDERS ABOVE ₹2,999 • BESPOKE WHATSAPP CONCIERGE',
  announcement_enabled: true,
  hero_title: 'THE MONOLITH COLLECTION',
  hero_subtitle: 'Sculpted in midnight shades and elevated with selective 24K gilded craftsmanship.',
  hero_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85',
  hero_cta_text: 'SHOP NOW',
  hero_cta_link: '/shop',
  instagram_url: 'https://instagram.com/87pincode',
  sections_config: {
    hero: true,
    categories: true,
    featured: true,
    promo_banner: true,
    new_arrivals: true,
    best_sellers: true,
    craftsmanship: true,
    reviews: true,
    newsletter: true
  }
};

const defaultContactSettings: ContactSettings = {
  shop_email: 'concierge@87pincode.com',
  phone_number: '+91 98765 43210',
  whatsapp_number: '919876543210',
  address: '87 Pincode Atelier, 4th Avenue Luxury District, Indiranagar, Bengaluru, Karnataka 560038, India',
  business_hours: 'Monday – Saturday: 10:00 AM – 8:30 PM IST | Sunday: 11:00 AM – 6:00 PM IST',
  google_maps_url: 'https://maps.google.com/?q=Indiranagar+Bengaluru'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<SiteSettings | null>(defaultSiteSettings);
  const [contact, setContact] = useState<ContactSettings | null>(defaultContactSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStoreData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getCategories().catch(() => [])
      ]);

      if (settingsRes) {
        if (settingsRes.site) setSite(settingsRes.site);
        if (settingsRes.contact) setContact(settingsRes.contact);
      }
      if (categoriesRes && Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        site: site || defaultSiteSettings,
        contact: contact || defaultContactSettings,
        categories,
        isLoading,
        refreshSettings: fetchStoreData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

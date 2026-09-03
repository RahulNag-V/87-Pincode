import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  UserProfile,
  Category,
  Product,
  Banner,
  Order,
  OrderStatusHistoryItem,
  NotificationItem,
  ProductReview,
  SiteSettings,
  ContactSettings,
  CartItem
} from '../src/types.js';

export interface UserRecord extends UserProfile {
  password_hash: string;
}

export interface DatabaseSchema {
  profiles: UserRecord[];
  categories: Category[];
  products: Product[];
  banners: Banner[];
  orders: Order[];
  order_status_history: OrderStatusHistoryItem[];
  notifications: NotificationItem[];
  reviews: ProductReview[];
  newsletters: { id: string; email: string; created_at: string; status: string }[];
  site_settings: SiteSettings;
  contact_settings: ContactSettings;
  user_carts: Record<string, CartItem[]>; // user_id -> items
  user_wishlists: Record<string, string[]>; // user_id -> product_ids
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const customerPasswordHash = bcrypt.hashSync('password123', 10);
  const adminEmail = (process.env.ADMIN_EMAIL || 'rahulnagv17@gmail.com').toLowerCase().trim();

  const categories: Category[] = [
    {
      id: 'cat-1',
      slug: 't-shirts',
      name: 'T-Shirts',
      description: 'Heavyweight oversized tees, luxury supima crewnecks, and architectural men\'s essentials.',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      display_order: 1,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-2',
      slug: 'shirts',
      name: 'Shirts',
      description: 'Tailored Oxford button-downs, Italian spread collars, and structured resort shirts.',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
      display_order: 2,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-3',
      slug: 'polo-shirts',
      name: 'Polo Shirts',
      description: 'Fine pique cotton polos with mother-of-pearl buttons and clean ribbed collars.',
      image: 'https://images.unsplash.com/photo-1625910513413-56839352e008?auto=format&fit=crop&w=1200&q=80',
      display_order: 3,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-4',
      slug: 'jeans',
      name: 'Jeans & Denim',
      description: 'Japanese raw selvedge denim, slim taper cuts, and relaxed dark-wash silhouettes.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
      display_order: 4,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-5',
      slug: 'trousers',
      name: 'Trousers & Pants',
      description: 'Pleated formal trousers, waistband side-adjusters, and structured wool-blend chinos.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      display_order: 5,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-6',
      slug: 'hoodies',
      name: 'Hoodies & Sweatshirts',
      description: 'Heavyweight 450 GSM French terry hoodies and minimalist dropped-shoulder pullovers.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      display_order: 6,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-7',
      slug: 'jackets',
      name: 'Jackets & Outerwear',
      description: 'Obsidian gilded bombers, double-breasted overcoats, and structured utility jackets.',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
      display_order: 7,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-8',
      slug: 'ethnic-wear',
      name: 'Ethnic Wear & Kurtas',
      description: 'Handcrafted Belgian linen kurtas, nehru jackets, and regal menswear silhouettes.',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
      display_order: 8,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-9',
      slug: 'footwear',
      name: 'Men\'s Footwear',
      description: 'Minimalist full-grain calfskin sneakers, Chelsea boots, and handcrafted leather loafers.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
      display_order: 9,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-10',
      slug: 'accessories',
      name: 'Accessories & Belts',
      description: 'Full-grain bridle leather belts, solid brass hardware, and minimalist leather wallets.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      display_order: 10,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      slug: 'classic-black-oversized-t-shirt',
      name: 'Classic Black Oversized T-Shirt',
      sku: '87PC-TS-001',
      description: 'Crafted from 280 GSM combed organic cotton with a structured drop-shoulder drape. Ribbed high crewneck collar and understated gold 87 Pincode embroidery at the nape.',
      details: '100% Combed Heavyweight Cotton (280 GSM). Pre-shrunk silicon washed for ultra-soft hand feel. Drop shoulder, boxy contemporary silhouette. Machine wash cold inside out.',
      price: 2499,
      sale_price: 1999,
      category_id: 'cat-1',
      category_name: 'T-Shirts',
      stock: 35,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      colors: ['Obsidian Black', 'Vintage Charcoal', 'Raw White'],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_published: true,
      rating: 4.9,
      review_count: 32,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-2',
      slug: 'premium-oxford-cotton-shirt',
      name: 'Premium Oxford Cotton Shirt',
      sku: '87PC-SH-002',
      description: 'A quintessential tailored Oxford shirt cut from Egyptian Giza long-staple cotton. Features an authentic button-down roll collar, genuine mother-of-pearl buttons, and rounded barrel cuffs.',
      details: '100% Egyptian Giza Cotton (80/2 ply). Classic tailored cut. Split back yoke with center box pleat for mobility. Machine wash gentle or dry clean.',
      price: 3999,
      sale_price: 3499,
      category_id: 'cat-2',
      category_name: 'Shirts',
      stock: 22,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Crisp White', 'Sky Blue', 'Midnight Black'],
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_published: true,
      rating: 4.9,
      review_count: 24,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-3',
      slug: 'essential-pique-polo-shirt',
      name: 'Essential Pique Polo Shirt',
      sku: '87PC-PO-003',
      description: 'Refined athletic elegance in a breathable micro-pique knit. Features a structured three-button placket with smoked horn buttons and reinforced ribbed collar that never curls.',
      details: '100% Mercerized Pique Cotton. Anti-pilling treatment. Tennis-tail hem with side slits. Dry flat or machine wash cold.',
      price: 2999,
      sale_price: 2499,
      category_id: 'cat-3',
      category_name: 'Polo Shirts',
      stock: 28,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Midnight Navy', 'Pure Black', 'Olive Drab'],
      images: [
        'https://images.unsplash.com/photo-1625910513413-56839352e008?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: false,
      is_bestseller: true,
      is_new_arrival: true,
      is_published: true,
      rating: 4.8,
      review_count: 18,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-4',
      slug: 'slim-fit-dark-selvedge-denim',
      name: 'Slim Fit Dark Selvedge Denim',
      sku: '87PC-JN-004',
      description: 'Woven on vintage shuttle looms using 14oz Japanese red-line selvedge denim. Deep indigo rope-dye with copper rivets and custom 87 Pincode donut button fly.',
      details: '14oz 100% Kurabo Mills Selvedge Denim. Clean slim-taper silhouette. Vegetable-tanned leather waistband patch. Wear raw or wash inside out cold.',
      price: 5999,
      sale_price: 4999,
      category_id: 'cat-4',
      category_name: 'Jeans & Denim',
      stock: 18,
      sizes: ['30', '32', '34', '36', '38'],
      colors: ['Deep Indigo', 'Raw Obsidian'],
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_published: true,
      rating: 5.0,
      review_count: 27,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-5',
      slug: 'tailored-wool-blend-trousers',
      name: 'Tailored Wool-Blend Trousers',
      sku: '87PC-TR-005',
      description: 'Modern Sartorial trousers engineered with double forward pleats, an extended waistband tab, and concealed brass side adjusters for a belt-free silhouette.',
      details: '70% Fine Merino Wool, 28% Poly, 2% Elastane for natural stretch. Half-lined in viscose. Unfinished hem for custom tailoring. Dry clean recommended.',
      price: 5499,
      sale_price: 4799,
      category_id: 'cat-5',
      category_name: 'Trousers & Pants',
      stock: 16,
      sizes: ['30', '32', '34', '36', '38'],
      colors: ['Charcoal Grey', 'Midnight Black', 'Rich Taupe'],
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: false,
      is_new_arrival: true,
      is_published: true,
      rating: 4.9,
      review_count: 14,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-6',
      slug: 'obsidian-gilded-heavy-bomber',
      name: 'Obsidian Gilded Heavy Bomber',
      sku: '87PC-JK-006',
      description: 'An architectural boxy-cut bomber jacket featuring matte water-repellent nylon, dual-ended 24K gold-plated Swiss zippers, heavy ribbed merino collar, and internal chest pockets.',
      details: 'Heavyweight matte technical nylon with water-repellent finish. Soft brushed silk lining. Hand-polished gold metal pullers. Professional garment care.',
      price: 12999,
      sale_price: 10999,
      category_id: 'cat-7',
      category_name: 'Jackets & Outerwear',
      stock: 10,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Deep Black', 'Dark Olive'],
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_published: true,
      rating: 4.9,
      review_count: 19,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-7',
      slug: 'premium-heavyweight-mens-hoodie',
      name: 'Premium Heavyweight Men\'s Hoodie',
      sku: '87PC-HD-007',
      description: 'Ultra-dense 480 GSM French terry hoodie engineered with double-lined cross-over hood, blind-stitch hems, and seamless pouch pocket. Built to maintain its structure indefinitely.',
      details: '100% Ring-Spun Cotton (480 GSM). Ribbed side gussets for enhanced drape and mobility. Tonal logo embroidery. Wash cold, tumble dry low.',
      price: 4499,
      sale_price: 3899,
      category_id: 'cat-6',
      category_name: 'Hoodies & Sweatshirts',
      stock: 24,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Jet Black', 'Heather Charcoal', 'Camel'],
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: false,
      is_bestseller: true,
      is_new_arrival: true,
      is_published: true,
      rating: 4.8,
      review_count: 22,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-8',
      slug: 'royal-heritage-linen-kurta',
      name: 'Royal Heritage Linen Kurta',
      sku: '87PC-EK-008',
      description: 'Handcrafted long kurta woven from pure Belgian linen. Features a refined mandarin collar with micro gold-thread border embroidery, concealed placket, and deep side pockets.',
      details: '100% Pure Woven Linen. Breathable, textured finish with natural slub. Tonal side slits. Dry clean or cold delicate wash.',
      price: 4999,
      sale_price: 4299,
      category_id: 'cat-8',
      category_name: 'Ethnic Wear & Kurtas',
      stock: 15,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Imperial Black', 'Ivory Cream', 'Royal Maroon'],
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: true,
      is_bestseller: false,
      is_new_arrival: true,
      is_published: true,
      rating: 5.0,
      review_count: 16,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-9',
      slug: 'minimal-mens-calfskin-sneakers',
      name: 'Minimal Men\'s Calfskin Sneakers',
      sku: '87PC-FW-009',
      description: 'Low-profile luxury sneakers crafted by master cordwainers using full-grain Italian calfskin leather. Stitched Margom rubber cupsole, waxed cotton laces, and gold-stamped heel counter.',
      details: 'Upper: 100% Full-grain Italian Calfskin. Lining: Soft calf leather. Sole: 100% Vulcanized Italian rubber. Includes dust bag and shoe horn.',
      price: 7999,
      sale_price: 6999,
      category_id: 'cat-9',
      category_name: 'Men\'s Footwear',
      stock: 14,
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: ['Monochrome Black', 'Triple White', 'Black & Gum'],
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: false,
      is_bestseller: true,
      is_new_arrival: false,
      is_published: true,
      rating: 4.9,
      review_count: 21,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod-10',
      slug: 'classic-full-grain-leather-belt',
      name: 'Classic Full-Grain Leather Belt',
      sku: '87PC-AC-010',
      description: 'Cut from vegetable-tanned 4mm bridle leather with burnished bevelled edges and a solid brushed brass roller buckle. Subtly stamped with 87 PINCODE insignia on the keeper.',
      details: '100% Full-grain Vegetable Tanned English Bridle Leather (35mm width). Solid brushed brass hardware with anti-tarnish coat. Condition periodically with leather balm.',
      price: 2499,
      sale_price: 1999,
      category_id: 'cat-10',
      category_name: 'Accessories & Belts',
      stock: 30,
      sizes: ['32', '34', '36', '38', '40'],
      colors: ['Midnight Black', 'Deep Cognac Brown'],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85'
      ],
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: false,
      is_published: true,
      rating: 4.8,
      review_count: 17,
      created_at: new Date().toISOString()
    }
  ];

  const banners: Banner[] = [
    {
      id: 'banner-1',
      title: 'THE BESPOKE MEN\'S WARDROBE',
      subtitle: 'Where Tailored Precision Meets Contemporary Silhouette. Virgin Wool, Raw Denim & Gilded Hardware.',
      cta_text: 'EXPLORE MENSWEAR',
      cta_link: '/shop',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1800&q=85',
      badge: 'MEN\'S AUTUMN / WINTER 2026',
      is_active: true,
      display_order: 1,
      position: 'hero'
    },
    {
      id: 'banner-2',
      title: 'HEAVYWEIGHT TEES & LUXE HOODIES',
      subtitle: 'Engineered from 280–480 GSM combed cotton for uncompromising drape, weight, and timeless durability.',
      cta_text: 'SHOP CASUALS',
      cta_link: '/shop?category=t-shirts',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1800&q=85',
      badge: 'SIGNATURE ESSENTIALS',
      is_active: true,
      display_order: 2,
      position: 'promo'
    }
  ];

  const site_settings: SiteSettings = {
    store_name: '87 Pincode',
    tagline: 'Exclusive Men\'s Clothing & Luxury Menswear',
    currency_symbol: '₹',
    currency_code: 'INR',
    free_shipping_threshold: 2999,
    standard_shipping_fee: 199,
    announcement_text: 'COMPLIMENTARY NATIONWIDE PRIORITY SHIPPING ON ORDERS ABOVE ₹2,999 • BESPOKE WHATSAPP CONCIERGE',
    announcement_enabled: true,
    hero_title: 'THE BESPOKE MEN\'S WARDROBE',
    hero_subtitle: 'Sculpted in midnight shades and elevated with selective 24K gilded craftsmanship.',
    hero_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1800&q=85',
    hero_cta_text: 'SHOP NOW',
    hero_cta_link: '/shop',
    instagram_url: 'https://instagram.com/87pincode',
    facebook_url: 'https://facebook.com/87pincode',
    twitter_url: 'https://twitter.com/87pincode',
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

  const contact_settings: ContactSettings = {
    shop_email: 'concierge@87pincode.com',
    phone_number: '+91 98765 43210',
    whatsapp_number: '919876543210', // Owner's WhatsApp number in international digit format
    address: '87 Pincode Atelier, 4th Avenue Luxury District, Indiranagar, Bengaluru, Karnataka 560038, India',
    business_hours: 'Monday – Saturday: 10:00 AM – 8:30 PM IST | Sunday: 11:00 AM – 6:00 PM IST',
    google_maps_url: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
    directions_url: 'https://maps.google.com/?daddr=87+Pincode+Atelier+Bengaluru'
  };

  const initialProfiles: UserRecord[] = [
    {
      id: 'usr-admin-1',
      email: adminEmail,
      full_name: 'Proprietor Atelier Administrator',
      role: 'admin',
      phone: '+91 98765 43210',
      is_verified: true,
      password_hash: adminPasswordHash,
      created_at: new Date().toISOString()
    },
    {
      id: 'usr-admin-2',
      email: 'admin@87pincode.com',
      full_name: '87 Pincode Admin',
      role: 'admin',
      phone: '+91 98765 43210',
      is_verified: true,
      password_hash: adminPasswordHash,
      created_at: new Date().toISOString()
    },
    {
      id: 'usr-cust-1',
      email: 'customer@example.com',
      full_name: 'Rahul Sharma',
      role: 'customer',
      phone: '+91 98123 45678',
      is_verified: true,
      password_hash: customerPasswordHash,
      created_at: new Date().toISOString()
    }
  ];

  const initialOrders: Order[] = [
    {
      id: '87PC-1024',
      user_id: 'usr-cust-1',
      customer_name: 'Rahul Sharma',
      customer_email: 'customer@example.com',
      customer_phone: '+91 98123 45678',
      delivery_address: {
        full_name: 'Rahul Sharma',
        phone: '+91 98123 45678',
        street: 'Penthouse 4B, Prestige Kensington Heights, 100ft Road',
        landmark: 'Near Club House',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        notes: 'Please ring bell upon arrival'
      },
      items: [
        {
          product_id: 'prod-1',
          product_name: 'Classic Black Oversized T-Shirt',
          product_slug: 'classic-black-oversized-t-shirt',
          product_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
          size: 'L',
          color: 'Obsidian Black',
          quantity: 1,
          unit_price: 1999,
          total_price: 1999
        }
      ],
      subtotal: 1999,
      shipping: 199,
      discount: 0,
      total: 2198,
      status: 'CONFIRMED',
      tracking_number: 'BLR-AIR-87910',
      courier_name: 'BlueDart Luxury Express',
      internal_notes: 'Men\'s luxury apparel gift wrap with gold satin seal requested.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ];

  const initialReviews: ProductReview[] = [
    {
      id: 'rev-1',
      product_id: 'prod-1',
      product_name: 'Classic Black Oversized T-Shirt',
      user_id: 'usr-cust-1',
      user_name: 'Rahul S.',
      rating: 5,
      comment: 'The 280 GSM heavyweight cotton drape is perfect. Boxy fit through the shoulders with immaculate neck ribbing.',
      is_approved: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'rev-2',
      product_id: 'prod-2',
      product_name: 'Premium Oxford Cotton Shirt',
      user_id: 'usr-cust-1',
      user_name: 'Devan M.',
      rating: 5,
      comment: 'Genuine Giza cotton with authentic collar roll. Sizing assistance on WhatsApp was prompt and helpful.',
      is_approved: true,
      created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ];

  return {
    profiles: initialProfiles,
    categories,
    products,
    banners,
    orders: initialOrders,
    order_status_history: [
      {
        id: 'hist-1',
        order_id: '87PC-1024',
        status: 'PENDING_CONFIRMATION',
        comment: 'Order placed via WhatsApp concierge flow',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'hist-2',
        order_id: '87PC-1024',
        status: 'CONFIRMED',
        comment: 'Order confirmed by store manager via WhatsApp',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        user_id: 'usr-cust-1',
        title: 'Order Confirmed',
        message: 'Your order #87PC-1024 has been confirmed by 87 Pincode.',
        type: 'order',
        order_id: '87PC-1024',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ],
    reviews: initialReviews,
    newsletters: [
      {
        id: 'nl-1',
        email: 'collector@luxuryfashion.in',
        created_at: new Date().toISOString(),
        status: 'active'
      }
    ],
    site_settings,
    contact_settings,
    user_carts: {},
    user_wishlists: {}
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure admin account exists with configured ADMIN_EMAIL
        const adminEmail = (process.env.ADMIN_EMAIL || 'rahulnagv17@gmail.com').toLowerCase().trim();
        const existingAdmin = this.data.profiles.find(p => p.email.toLowerCase() === adminEmail);
        if (!existingAdmin) {
          this.data.profiles.push({
            id: 'usr-admin-' + Date.now(),
            email: adminEmail,
            full_name: 'Store Administrator',
            role: 'admin',
            phone: '+91 98765 43210',
            is_verified: true,
            password_hash: bcrypt.hashSync('admin123', 10),
            created_at: new Date().toISOString()
          });
          this.save();
        } else if (existingAdmin.role !== 'admin') {
          existingAdmin.role = 'admin';
          this.save();
        }

        // Migrate to exclusive Men's Clothing catalog if old non-menswear categories are present
        const hasMenswearCategories = this.data.categories?.some(c => c.slug === 't-shirts');
        if (!hasMenswearCategories) {
          const fresh = getInitialDatabase();
          this.data.categories = fresh.categories;
          this.data.products = fresh.products;
          this.data.banners = fresh.banners;
          this.data.site_settings = { ...this.data.site_settings, ...fresh.site_settings };
          this.data.reviews = fresh.reviews;
          this.save();
        }
      } catch (err) {
        console.error('Error reading database file, creating fresh database:', err);
        this.data = getInitialDatabase();
        this.save();
      }
    } else {
      this.data = getInitialDatabase();
      this.save();
    }
  }

  public save(): void {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Profiles & Auth
  public getProfiles(): UserRecord[] {
    return this.data.profiles;
  }

  public findProfileByEmail(email: string): UserRecord | undefined {
    return this.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findProfileById(id: string): UserRecord | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  public createProfile(profile: UserRecord): UserRecord {
    this.data.profiles.push(profile);
    this.save();
    return profile;
  }

  public updateProfile(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const profile = this.findProfileById(id);
    if (!profile) return undefined;
    Object.assign(profile, updates);
    this.save();
    return profile;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.display_order - b.display_order);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug === slug);
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return undefined;
    Object.assign(cat, updates);
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Products
  public getProducts(publishedOnly = true): Product[] {
    if (publishedOnly) {
      return this.data.products.filter(p => p.is_published);
    }
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  public createProduct(prod: Omit<Product, 'id'>): Product {
    const newProd: Product = {
      ...prod,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.data.products.push(newProd);
    this.save();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) return undefined;
    Object.assign(prod, updates);
    this.save();
    return prod;
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Banners
  public getBanners(activeOnly = true): Banner[] {
    if (activeOnly) {
      return this.data.banners
        .filter(b => b.is_active)
        .sort((a, b) => a.display_order - b.display_order);
    }
    return this.data.banners.sort((a, b) => a.display_order - b.display_order);
  }

  public createBanner(banner: Omit<Banner, 'id'>): Banner {
    const newBanner: Banner = {
      ...banner,
      id: 'banner-' + Date.now()
    };
    this.data.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner | undefined {
    const b = this.data.banners.find(item => item.id === id);
    if (!b) return undefined;
    Object.assign(b, updates);
    this.save();
    return b;
  }

  public deleteBanner(id: string): boolean {
    const initialLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.id !== id);
    if (this.data.banners.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Orders
  private normalizeOrder(o: Order): Order {
    return {
      ...o,
      order_number: o.order_number || o.id,
      total_amount: o.total_amount ?? o.total,
      shipping_fee: o.shipping_fee ?? o.shipping
    };
  }

  public getOrders(): Order[] {
    return this.data.orders
      .map(o => this.normalizeOrder(o))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter(o => o.user_id === userId)
      .map(o => this.normalizeOrder(o))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    const cleanId = id.replace('#', '').trim().toUpperCase();
    const found = this.data.orders.find(o => o.id.toUpperCase() === cleanId);
    return found ? this.normalizeOrder(found) : undefined;
  }

  public generateOrderId(): string {
    // Generate order ID like "87PC-1025"
    let nextNum = 1025;
    const existingIds = this.data.orders
      .map(o => {
        const match = o.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => n > 0);

    if (existingIds.length > 0) {
      nextNum = Math.max(...existingIds) + 1;
    }
    return `87PC-${nextNum}`;
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.addStatusHistory(order.id, order.status, 'Order created via WhatsApp flow');
    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const cleanId = id.replace('#', '').trim().toUpperCase();
    const order = this.data.orders.find(o => o.id.toUpperCase() === cleanId);
    if (!order) return undefined;
    const oldStatus = order.status;
    Object.assign(order, updates, { updated_at: new Date().toISOString() });
    if (updates.status && updates.status !== oldStatus) {
      this.addStatusHistory(order.id, updates.status, `Status changed from ${oldStatus} to ${updates.status}`);
    }
    this.save();
    return this.normalizeOrder(order);
  }

  public addStatusHistory(orderId: string, status: Order['status'], comment?: string): void {
    this.data.order_status_history.push({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      order_id: orderId,
      status,
      comment,
      created_at: new Date().toISOString()
    });
    this.save();
  }

  public getOrderStatusHistory(orderId: string): OrderStatusHistoryItem[] {
    const cleanId = orderId.replace('#', '').trim().toUpperCase();
    return this.data.order_status_history
      .filter(h => h.order_id.toUpperCase() === cleanId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(userId: string, title: string, message: string, type: NotificationItem['type'] = 'order', orderId?: string): NotificationItem {
    const notif: NotificationItem = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      title,
      message,
      type,
      order_id: orderId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.save();
  }

  // Reviews
  public getReviews(productId?: string, approvedOnly = true): ProductReview[] {
    let list = this.data.reviews;
    if (productId) {
      list = list.filter(r => r.product_id === productId);
    }
    if (approvedOnly) {
      list = list.filter(r => r.is_approved);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addReview(review: Omit<ProductReview, 'id' | 'created_at'>): ProductReview {
    const newReview: ProductReview = {
      ...review,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  public updateReviewStatus(id: string, isApproved: boolean): ProductReview | undefined {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return undefined;
    rev.is_approved = isApproved;
    this.save();
    return rev;
  }

  public deleteReview(id: string): boolean {
    const initLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    if (this.data.reviews.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Newsletter
  public getNewsletterSubscribers() {
    return this.data.newsletters;
  }

  public addNewsletterSubscriber(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.data.newsletters.find(n => n.email === cleanEmail);
    if (existing) return existing;
    const item = {
      id: 'nl-' + Date.now(),
      email: cleanEmail,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    this.data.newsletters.unshift(item);
    this.save();
    return item;
  }

  // Settings
  public getSiteSettings(): SiteSettings {
    return this.data.site_settings;
  }

  public updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
    Object.assign(this.data.site_settings, updates);
    this.save();
    return this.data.site_settings;
  }

  public getContactSettings(): ContactSettings {
    return this.data.contact_settings;
  }

  public updateContactSettings(updates: Partial<ContactSettings>): ContactSettings {
    Object.assign(this.data.contact_settings, updates);
    this.save();
    return this.data.contact_settings;
  }

  // User Cart & Wishlist storage
  public getUserCart(userId: string): CartItem[] {
    return this.data.user_carts[userId] || [];
  }

  public setUserCart(userId: string, items: CartItem[]): void {
    this.data.user_carts[userId] = items;
    this.save();
  }

  public getUserWishlist(userId: string): string[] {
    return this.data.user_wishlists[userId] || [];
  }

  public setUserWishlist(userId: string, productIds: string[]): void {
    this.data.user_wishlists[userId] = productIds;
    this.save();
  }
}

export const db = new DatabaseService();

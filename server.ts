import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { db, UserRecord } from './server/db.js';
import {
  authenticateToken,
  requireAuth,
  requireAdmin,
  generateToken,
  hashPassword,
  comparePassword,
  AuthRequest
} from './server/auth.js';
import {
  generateWhatsAppOrderMessage,
  generateWhatsAppCancellationMessage,
  buildWhatsAppUrl
} from './server/whatsapp.js';
import { Order, OrderItem, CartItem } from './src/types.js';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(authenticateToken);
  app.use('/uploads', express.static(uploadsDir));

  // ----------------------------------------------------
  // HEALTH CHECK
  // ----------------------------------------------------
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      store: '87 Pincode',
      timestamp: new Date().toISOString()
    });
  });

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------

  // Register Customer
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { full_name, email, password, confirm_password, phone } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Please provide full name, email, and password.' });
      }

      if (confirm_password && password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = db.findProfileByEmail(cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const adminEmail = (process.env.ADMIN_EMAIL || 'rahulnagv17@gmail.com').toLowerCase().trim();
      const role = cleanEmail === adminEmail ? 'admin' : 'customer';

      const newUser: UserRecord = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        full_name: full_name.trim(),
        role,
        phone: phone ? phone.trim() : undefined,
        is_verified: true, // Auto-verified for seamless start, verification screen handles simulation
        password_hash: hashPassword(password),
        created_at: new Date().toISOString()
      };

      db.createProfile(newUser);
      const token = generateToken(newUser);

      // Create welcome notification
      db.addNotification(
        newUser.id,
        'Welcome to 87 Pincode',
        'Your bespoke luxury account has been activated. Experience curated collections tailored for the discerning individual.',
        'system'
      );

      res.cookie('87pincode_token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });

      return res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          phone: newUser.phone,
          is_verified: newUser.is_verified,
          created_at: newUser.created_at
        },
        token,
        message: 'Account created successfully.'
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Failed to create account.' });
    }
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please enter both email and password.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = db.findProfileByEmail(cleanEmail);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = comparePassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      res.cookie('87pincode_token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          is_verified: user.is_verified,
          created_at: user.created_at
        },
        token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
  });

  // Google / Apple OAuth sign in
  app.post('/api/auth/oauth', (req: Request, res: Response) => {
    try {
      const { provider, email, full_name } = req.body;
      if (!email || !provider) {
        return res.status(400).json({ error: 'Provider and email are required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      let user = db.findProfileByEmail(cleanEmail);

      if (!user) {
        const adminEmail = (process.env.ADMIN_EMAIL || 'rahulnagv17@gmail.com').toLowerCase().trim();
        const role = cleanEmail === adminEmail ? 'admin' : 'customer';

        user = {
          id: 'usr-' + Date.now(),
          email: cleanEmail,
          full_name: full_name || cleanEmail.split('@')[0],
          role,
          is_verified: true,
          password_hash: hashPassword(Math.random().toString(36)),
          created_at: new Date().toISOString()
        };
        db.createProfile(user);

        db.addNotification(
          user.id,
          `Connected with ${provider === 'apple' ? 'Apple' : 'Google'}`,
          'Your account has been seamlessly linked with 87 Pincode.',
          'system'
        );
      }

      const token = generateToken(user);
      res.cookie('87pincode_token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          is_verified: user.is_verified,
          created_at: user.created_at
        },
        token
      });
    } catch (err) {
      return res.status(500).json({ error: 'OAuth authentication failed.' });
    }
  });

  // Current authenticated user
  app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ user: null });
    }
    return res.json({ user: req.user });
  });

  // Update profile
  app.put('/api/auth/profile', requireAuth, (req: AuthRequest, res: Response) => {
    const { full_name, phone } = req.body;
    const updated = db.updateProfile(req.user!.id, {
      full_name: full_name ? full_name.trim() : req.user!.full_name,
      phone: phone ? phone.trim() : req.user!.phone
    });
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      user: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        role: updated.role,
        phone: updated.phone,
        is_verified: updated.is_verified,
        created_at: updated.created_at
      }
    });
  });

  // Email verification confirmation & resend
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = db.findProfileByEmail(email);
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    db.updateProfile(user.id, { is_verified: true });
    return res.json({ success: true, message: 'Email verified successfully.' });
  });

  app.post('/api/auth/resend-verification', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    // Simulate email dispatch
    return res.json({
      success: true,
      message: `Verification link sent to ${email}. Please check your inbox.`
    });
  });

  // Forgot password
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });
    const cleanEmail = email.toLowerCase().trim();
    const user = db.findProfileByEmail(cleanEmail);
    // Return friendly confirmation regardless of account existence for security
    return res.json({
      success: true,
      message: `If an account exists for ${cleanEmail}, password reset instructions have been dispatched.`
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('87pincode_token');
    return res.json({ success: true });
  });

  // ----------------------------------------------------
  // PUBLIC STORE ROUTES (SETTINGS, PRODUCTS, CATEGORIES, BANNERS)
  // ----------------------------------------------------

  app.get('/api/site-settings', (req: Request, res: Response) => {
    const site = db.getSiteSettings();
    const contact = db.getContactSettings();
    return res.json({ site, contact });
  });

  app.get('/api/categories', (req: Request, res: Response) => {
    const categories = db.getCategories().filter(c => c.is_published);
    return res.json(categories);
  });

  app.get('/api/banners', (req: Request, res: Response) => {
    const banners = db.getBanners(true);
    return res.json(banners);
  });

  app.get('/api/products', (req: Request, res: Response) => {
    let products = db.getProducts(true);

    const { category, search, min_price, max_price, sort, size, color, featured, bestseller, new_arrival } = req.query;

    if (category) {
      const catSlug = String(category).toLowerCase();
      const cat = db.getCategoryBySlug(catSlug);
      if (cat) {
        products = products.filter(p => p.category_id === cat.id);
      } else {
        products = products.filter(p => p.category_id === String(category));
      }
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    if (min_price) {
      const min = Number(min_price);
      products = products.filter(p => (p.sale_price ?? p.price) >= min);
    }

    if (max_price) {
      const max = Number(max_price);
      products = products.filter(p => (p.sale_price ?? p.price) <= max);
    }

    if (size) {
      products = products.filter(p => p.sizes.includes(String(size)));
    }

    if (color) {
      products = products.filter(p => p.colors.includes(String(color)));
    }

    if (featured === 'true') {
      products = products.filter(p => p.is_featured);
    }
    if (bestseller === 'true') {
      products = products.filter(p => p.is_bestseller);
    }
    if (new_arrival === 'true') {
      products = products.filter(p => p.is_new_arrival);
    }

    if (sort === 'price-asc') {
      products.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    } else if (sort === 'price-desc') {
      products.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    } else if (sort === 'bestseller') {
      products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    }

    return res.json(products);
  });

  app.get('/api/products/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = db.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Get related products in same category
    const related = db
      .getProducts(true)
      .filter(p => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4);

    // Get approved reviews
    const reviews = db.getReviews(product.id, true);

    return res.json({ product, related, reviews });
  });

  // Reviews
  app.post('/api/reviews', requireAuth, (req: AuthRequest, res: Response) => {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating || !comment) {
      return res.status(400).json({ error: 'Please provide rating and comment.' });
    }
    const product = db.getProductById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const review = db.addReview({
      product_id,
      product_name: product.name,
      user_id: req.user!.id,
      user_name: req.user!.full_name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      is_approved: false // Admin approval required as per requirement #55
    });

    return res.status(201).json({
      review,
      message: 'Thank you. Your review has been submitted for moderation.'
    });
  });

  // Newsletter
  app.post('/api/newsletter', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const item = db.addNewsletterSubscriber(email);
    return res.json({ success: true, subscriber: item, message: 'Welcome to the 87 Pincode private circular.' });
  });

  // Cart Sync & Merge
  app.post('/api/cart/sync', requireAuth, (req: AuthRequest, res: Response) => {
    const { guest_items } = req.body as { guest_items?: CartItem[] };
    const userCart = db.getUserCart(req.user!.id);

    if (guest_items && Array.isArray(guest_items) && guest_items.length > 0) {
      // Merge guest cart items without duplicates
      const mergedMap = new Map<string, CartItem>();

      userCart.forEach(item => {
        const key = `${item.product_id}-${item.size}-${item.color}`;
        mergedMap.set(key, { ...item });
      });

      guest_items.forEach(gItem => {
        const key = `${gItem.product_id}-${gItem.size}-${gItem.color}`;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key)!;
          existing.quantity = Math.min(existing.max_stock, existing.quantity + gItem.quantity);
        } else {
          mergedMap.set(key, { ...gItem });
        }
      });

      const updated = Array.from(mergedMap.values());
      db.setUserCart(req.user!.id, updated);
      return res.json({ items: updated });
    }

    return res.json({ items: userCart });
  });

  // ----------------------------------------------------
  // ORDER CREATION & WHATSAPP FLOW (CRITICAL CORE ENGINE)
  // ----------------------------------------------------

  /**
   * POST /api/orders
   * Requires authenticated customer.
   * Never trusts client-side prices or totals!
   * Validates stock, calculates prices, creates PENDING_CONFIRMATION order in database,
   * generates dynamic WhatsApp message, and returns order + WhatsApp redirect URL.
   */
  app.post('/api/orders', requireAuth, (req: AuthRequest, res: Response) => {
    try {
      const { items, delivery_address } = req.body as {
        items: { product_id: string; size: string; color: string; quantity: number }[];
        delivery_address: any;
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty. Add items to order.' });
      }

      if (!delivery_address || !delivery_address.full_name || !delivery_address.phone || !delivery_address.street || !delivery_address.city || !delivery_address.pincode) {
        return res.status(400).json({ error: 'Please provide complete delivery address with full name, phone, street, city, and pincode.' });
      }

      const verifiedOrderItems: OrderItem[] = [];
      let subtotal = 0;

      // Validate each item against the real database products and check stock
      for (const cartItem of items) {
        const product = db.getProductById(cartItem.product_id);
        if (!product || !product.is_published) {
          return res.status(400).json({ error: `Product is no longer available.` });
        }

        const qty = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));

        if (product.stock < qty) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
          });
        }

        const unitPrice = product.sale_price ?? product.price;
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        verifiedOrderItems.push({
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          product_image: product.images[0] || '',
          size: cartItem.size || 'Standard',
          color: cartItem.color || 'Standard',
          quantity: qty,
          unit_price: unitPrice,
          total_price: lineTotal
        });

        // Decrement real stock
        db.updateProduct(product.id, { stock: Math.max(0, product.stock - qty) });
      }

      const siteSettings = db.getSiteSettings();
      const contactSettings = db.getContactSettings();

      // Calculate shipping based on server settings
      const shipping = subtotal >= siteSettings.free_shipping_threshold ? 0 : siteSettings.standard_shipping_fee;
      const discount = 0;
      const grandTotal = subtotal + shipping - discount;

      const orderId = db.generateOrderId();

      const newOrder: Order = {
        id: orderId,
        user_id: req.user!.id,
        customer_name: delivery_address.full_name.trim(),
        customer_email: req.user!.email,
        customer_phone: delivery_address.phone.trim(),
        delivery_address: {
          full_name: delivery_address.full_name.trim(),
          phone: delivery_address.phone.trim(),
          street: delivery_address.street.trim(),
          landmark: delivery_address.landmark ? delivery_address.landmark.trim() : '',
          city: delivery_address.city.trim(),
          state: delivery_address.state ? delivery_address.state.trim() : 'Karnataka',
          pincode: delivery_address.pincode.trim(),
          notes: delivery_address.notes ? delivery_address.notes.trim() : ''
        },
        items: verifiedOrderItems,
        subtotal,
        shipping,
        discount,
        total: grandTotal,
        status: 'PENDING_CONFIRMATION',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Generate structured WhatsApp message
      const whatsappMessage = generateWhatsAppOrderMessage(newOrder, siteSettings.store_name);
      const whatsappUrl = buildWhatsAppUrl(contactSettings.whatsapp_number, whatsappMessage);

      newOrder.whatsapp_url = whatsappUrl;
      newOrder.whatsapp_message = whatsappMessage;

      // Save order to database
      db.createOrder(newOrder);

      // Clear customer's server cart
      db.setUserCart(req.user!.id, []);

      // Notify customer
      db.addNotification(
        req.user!.id,
        `Order #${newOrder.id} Placed`,
        `Your order #${newOrder.id} has been submitted for confirmation. Our atelier team will connect via WhatsApp to confirm dispatch.`,
        'order',
        newOrder.id
      );

      return res.status(201).json({
        success: true,
        order: newOrder,
        whatsapp_url: whatsappUrl,
        whatsapp_message: whatsappMessage,
        shop_whatsapp_number: contactSettings.whatsapp_number,
        message: 'Order created successfully. Ready for WhatsApp confirmation.'
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      return res.status(500).json({ error: 'Failed to create order. Please try again.' });
    }
  });

  // Get customer's orders
  app.get('/api/orders/my-orders', requireAuth, (req: AuthRequest, res: Response) => {
    const orders = db.getOrdersByUserId(req.user!.id);
    return res.json(orders);
  });

  // Get specific order details (customer or admin)
  app.get('/api/orders/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Authorization check: only owner or admin can view
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view this order.' });
    }

    const history = db.getOrderStatusHistory(order.id);
    const contact = db.getContactSettings();
    return res.json({ order, history, contact_whatsapp: contact.whatsapp_number });
  });

  // Customer requests order cancellation via WhatsApp flow (Requirement #25 & #60)
  app.post('/api/orders/:id/cancel', requireAuth, (req: AuthRequest, res: Response) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });

      if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized.' });
      }

      if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
        return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status.toLowerCase()}.` });
      }

      const { reason } = req.body;
      const cancellationReason = reason ? String(reason).trim() : 'Customer requested order cancellation';

      const contactSettings = db.getContactSettings();
      const siteSettings = db.getSiteSettings();

      // Generate structured WhatsApp cancellation message
      const whatsappMsg = generateWhatsAppCancellationMessage(order, cancellationReason, siteSettings.store_name);
      const whatsappUrl = buildWhatsAppUrl(contactSettings.whatsapp_number, whatsappMsg);

      const updated = db.updateOrder(order.id, {
        status: 'CANCEL_REQUESTED',
        cancellation_reason: cancellationReason,
        cancellation_requested_at: new Date().toISOString()
      });

      // Add notification for customer
      db.addNotification(
        order.user_id,
        `Cancellation Requested for #${order.id}`,
        `Your cancellation request for #${order.id} has been logged and sent to 87 Pincode via WhatsApp.`,
        'cancellation',
        order.id
      );

      return res.json({
        success: true,
        order: updated,
        whatsapp_url: whatsappUrl,
        whatsapp_message: whatsappMsg,
        message: 'Cancellation requested. Redirecting to WhatsApp concierge.'
      });
    } catch (err) {
      console.error('Cancellation error:', err);
      return res.status(500).json({ error: 'Failed to process cancellation request.' });
    }
  });

  // Notifications
  app.get('/api/notifications', requireAuth, (req: AuthRequest, res: Response) => {
    const list = db.getNotifications(req.user!.id);
    return res.json(list);
  });

  app.put('/api/notifications/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
    db.markNotificationAsRead(req.params.id, req.user!.id);
    return res.json({ success: true });
  });

  app.put('/api/notifications/read-all', requireAuth, (req: AuthRequest, res: Response) => {
    db.markAllNotificationsAsRead(req.user!.id);
    return res.json({ success: true });
  });

  // Wishlist
  app.get('/api/wishlist', requireAuth, (req: AuthRequest, res: Response) => {
    const list = db.getUserWishlist(req.user!.id);
    return res.json({ wishlist: list });
  });

  app.post('/api/wishlist/toggle', requireAuth, (req: AuthRequest, res: Response) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID required' });
    const current = db.getUserWishlist(req.user!.id);
    const updated = current.includes(product_id)
      ? current.filter(id => id !== product_id)
      : [...current, product_id];
    db.setUserWishlist(req.user!.id, updated);
    return res.json({ wishlist: updated });
  });

  app.post('/api/wishlist/sync', requireAuth, (req: AuthRequest, res: Response) => {
    const { product_ids } = req.body;
    if (!Array.isArray(product_ids)) return res.status(400).json({ error: 'product_ids array required' });
    const current = db.getUserWishlist(req.user!.id);
    const merged = Array.from(new Set([...current, ...product_ids]));
    db.setUserWishlist(req.user!.id, merged);
    return res.json({ wishlist: merged });
  });

  // ----------------------------------------------------
  // ADMIN DASHBOARD ROUTES (PROTECTED BY REQUIREADMIN)
  // ----------------------------------------------------

  // Overview analytics
  app.get('/api/admin/overview', requireAdmin, (req: Request, res: Response) => {
    const orders = db.getOrders();
    const products = db.getProducts(false);
    const profiles = db.getProfiles();

    let totalRevenue = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    orders.forEach(o => {
      if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status)) {
        totalRevenue += o.total;
        confirmedCount++;
      } else if (o.status === 'PENDING_CONFIRMATION') {
        pendingCount++;
      } else if (['CANCEL_REQUESTED', 'CANCELLED'].includes(o.status)) {
        cancelledCount++;
      }
    });

    const lowStockProducts = products.filter(p => p.stock <= 5);

    return res.json({
      total_revenue: totalRevenue,
      total_orders: orders.length,
      confirmed_orders: confirmedCount,
      pending_orders: pendingCount,
      cancelled_orders: cancelledCount,
      total_customers: profiles.filter(p => p.role === 'customer').length,
      total_products: products.length,
      low_stock_count: lowStockProducts.length,
      low_stock_products: lowStockProducts.map(p => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock })),
      recent_orders: orders.slice(0, 8)
    });
  });

  // Manage Orders
  app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let orders = db.getOrders();

    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === String(status));
    }

    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }

    return res.json(orders);
  });

  // Update order status (with customer notification triggers)
  app.put('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { status, tracking_number, courier_name, internal_notes } = req.body;
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const previousStatus = order.status;
    const updates: Partial<Order> = {};
    if (status) updates.status = status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (courier_name !== undefined) updates.courier_name = courier_name;
    if (internal_notes !== undefined) updates.internal_notes = internal_notes;

    // Restore stock if transitioning to CANCELLED or REJECTED from active order
    if (
      (status === 'CANCELLED' || status === 'REJECTED') &&
      previousStatus !== 'CANCELLED' &&
      previousStatus !== 'REJECTED'
    ) {
      for (const item of order.items) {
        const prod = db.getProductById(item.product_id);
        if (prod) {
          db.updateProduct(prod.id, { stock: prod.stock + item.quantity });
        }
      }
    } else if (
      (previousStatus === 'CANCELLED' || previousStatus === 'REJECTED') &&
      status &&
      status !== 'CANCELLED' &&
      status !== 'REJECTED'
    ) {
      // If un-cancelling or re-activating an order, re-reserve the stock
      for (const item of order.items) {
        const prod = db.getProductById(item.product_id);
        if (prod) {
          db.updateProduct(prod.id, { stock: Math.max(0, prod.stock - item.quantity) });
        }
      }
    }

    const updated = db.updateOrder(order.id, updates);

    // Automated customer notifications based on status change (Requirement #20 & #21)
    if (status === 'CONFIRMED') {
      db.addNotification(
        order.user_id,
        'Order Confirmed',
        `Your order #${order.id} has been confirmed by 87 Pincode. Our atelier has commenced preparation.`,
        'order',
        order.id
      );
    } else if (status === 'PROCESSING') {
      db.addNotification(
        order.user_id,
        'Order In Preparation',
        `Order #${order.id} is being tailored and hand-inspected for dispatch.`,
        'order',
        order.id
      );
    } else if (status === 'SHIPPED') {
      const trackMsg = tracking_number ? ` Tracking Number: ${tracking_number} (${courier_name || 'Express Courier'}).` : '';
      db.addNotification(
        order.user_id,
        'Order Dispatched',
        `Your order #${order.id} has been shipped.${trackMsg}`,
        'order',
        order.id
      );
    } else if (status === 'DELIVERED') {
      db.addNotification(
        order.user_id,
        'Order Delivered',
        `Order #${order.id} has been delivered. We hope you cherish your 87 Pincode selection.`,
        'order',
        order.id
      );
    } else if (status === 'CANCELLED') {
      db.addNotification(
        order.user_id,
        'Order Cancelled',
        `Your order #${order.id} has been cancelled as requested.`,
        'cancellation',
        order.id
      );
    } else if (status === 'REJECTED') {
      db.addNotification(
        order.user_id,
        'Order Update',
        `Regarding order #${order.id}: our team was unable to confirm your order. Please message us on WhatsApp for assistance.`,
        'order',
        order.id
      );
    }

    return res.json({ success: true, order: updated });
  });

  // Products CRUD
  app.get('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
    return res.json(db.getProducts(false));
  });

  app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        details,
        price,
        sale_price,
        category_id,
        stock,
        sizes,
        colors,
        images,
        is_featured,
        is_bestseller,
        is_new_arrival,
        is_published
      } = req.body;

      if (!name || !price || !category_id) {
        return res.status(400).json({ error: 'Name, price, and category are required.' });
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const sku = '87PC-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const cat = db.getCategories().find(c => c.id === category_id);

      const newProduct = db.createProduct({
        slug: slug + '-' + Date.now().toString().slice(-4),
        name: name.trim(),
        sku,
        description: description || '',
        details: details || '',
        price: Number(price),
        sale_price: sale_price ? Number(sale_price) : null,
        category_id,
        category_name: cat?.name || 'Curated',
        stock: Number(stock) || 0,
        sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
        colors: Array.isArray(colors) && colors.length ? colors : ['Obsidian Black'],
        images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80'],
        is_featured: !!is_featured,
        is_bestseller: !!is_bestseller,
        is_new_arrival: is_new_arrival !== undefined ? !!is_new_arrival : true,
        is_published: is_published !== undefined ? !!is_published : true,
        rating: 5.0,
        review_count: 0
      });

      return res.status(201).json(newProduct);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create product.' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found.' });
    return res.json(updated);
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ success: true });
  });

  // Categories CRUD
  app.get('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
    return res.json(db.getCategories());
  });

  app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
    const { name, description, image, display_order, is_published } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const cat = db.createCategory({
      name: name.trim(),
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
      display_order: Number(display_order) || 1,
      is_published: is_published !== undefined ? !!is_published : true
    });

    return res.status(201).json(cat);
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found.' });
    return res.json(updated);
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found.' });
    return res.json({ success: true });
  });

  // Inventory Quick Update
  app.put('/api/admin/inventory/:id', requireAdmin, (req: Request, res: Response) => {
    const { stock } = req.body;
    if (stock === undefined) return res.status(400).json({ error: 'Stock quantity is required.' });
    const updated = db.updateProduct(req.params.id, { stock: Math.max(0, Number(stock)) });
    if (!updated) return res.status(404).json({ error: 'Product not found.' });
    return res.json(updated);
  });

  // Banners CRUD
  app.get('/api/admin/banners', requireAdmin, (req: Request, res: Response) => {
    return res.json(db.getBanners(false));
  });

  app.post('/api/admin/banners', requireAdmin, (req: Request, res: Response) => {
    const { title, subtitle, cta_text, cta_link, image_url, badge, is_active, display_order, position } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Title and image URL are required.' });

    const banner = db.createBanner({
      title: title.trim(),
      subtitle: subtitle || '',
      cta_text: cta_text || 'DISCOVER NOW',
      cta_link: cta_link || '/shop',
      image_url,
      badge: badge || undefined,
      is_active: is_active !== undefined ? !!is_active : true,
      display_order: Number(display_order) || 1,
      position: position || 'hero'
    });

    return res.status(201).json(banner);
  });

  app.put('/api/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const updated = db.updateBanner(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Banner not found.' });
    return res.json(updated);
  });

  app.delete('/api/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const success = db.deleteBanner(req.params.id);
    if (!success) return res.status(404).json({ error: 'Banner not found.' });
    return res.json({ success: true });
  });

  // Reviews Moderation (Approve / Reject / Delete)
  app.get('/api/admin/reviews', requireAdmin, (req: Request, res: Response) => {
    return res.json(db.getReviews(undefined, false));
  });

  app.put('/api/admin/reviews/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { is_approved } = req.body;
    const updated = db.updateReviewStatus(req.params.id, !!is_approved);
    if (!updated) return res.status(404).json({ error: 'Review not found.' });
    return res.json(updated);
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const success = db.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: 'Review not found.' });
    return res.json({ success: true });
  });

  // Customers Directory
  app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
    const profiles = db.getProfiles();
    const orders = db.getOrders();

    const customers = profiles.map(p => {
      const userOrders = orders.filter(o => o.user_id === p.id);
      const totalSpent = userOrders
        .filter(o => !['CANCELLED', 'REJECTED'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role,
        phone: p.phone,
        is_verified: p.is_verified,
        created_at: p.created_at,
        orders_count: userOrders.length,
        total_spent: totalSpent
      };
    });

    return res.json(customers);
  });

  // Update user role (e.g. promote to admin or switch to customer)
  app.put('/api/admin/customers/:id/role', requireAdmin, (req: Request, res: Response) => {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be customer or admin.' });
    }
    const updated = db.updateProfile(req.params.id, { role });
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    return res.json({ success: true, user: updated });
  });

  // Newsletter subscribers
  app.get('/api/admin/newsletters', requireAdmin, (req: Request, res: Response) => {
    return res.json(db.getNewsletterSubscribers());
  });

  // Site & Contact Settings Update
  app.put('/api/admin/settings/site', requireAdmin, (req: Request, res: Response) => {
    const updated = db.updateSiteSettings(req.body);
    return res.json(updated);
  });

  app.put('/api/admin/settings/contact', requireAdmin, (req: Request, res: Response) => {
    const updated = db.updateContactSettings(req.body);
    return res.json(updated);
  });

  // Media / Image Upload (Requirement #16: File validation, safety, preview, progress)
  app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
    try {
      const { data, filename } = req.body;
      if (!data || !filename) {
        return res.status(400).json({ error: 'Image data and filename are required.' });
      }

      const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid image format. Expected valid Base64 data URL.' });
      }

      const mimeType = matches[1];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({
          error: `Unsupported image format: ${mimeType}. Please upload JPEG, PNG, WEBP, GIF, or SVG.`
        });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSizeBytes) {
        return res.status(400).json({ error: 'File size exceeds maximum 5MB limit.' });
      }

      const cleanName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
      const ext = path.extname(cleanName) || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
      const base = path.basename(cleanName, ext);
      const uniqueFileName = `${Date.now()}-${base}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      return res.json({
        success: true,
        url: publicUrl,
        filename: uniqueFileName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to process image upload.' });
    }
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE (DEV) & STATIC ASSETS (PRODUCTION)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`87 Pincode server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

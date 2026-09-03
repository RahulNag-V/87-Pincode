import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { StoreProvider } from './context/StoreContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { SearchOverlay } from './components/SearchOverlay.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';

import { HomeView } from './views/HomeView.js';
import { ShopView } from './views/ShopView.js';
import { ProductDetailView } from './views/ProductDetailView.js';
import { CartView } from './views/CartView.js';
import { OrderSuccessView } from './views/OrderSuccessView.js';
import { AccountView } from './views/AccountView.js';
import { ContactView } from './views/ContactView.js';
import { CategoriesView } from './views/CategoriesView.js';
import { AboutView } from './views/AboutView.js';
import { AdminDashboard } from './views/AdminDashboard.js';

interface RouteState {
  view: string;
  params: Record<string, any>;
}

function MainApp() {
  const [route, setRoute] = useState<RouteState>(() => {
    // Parse initial hash if present
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash.startsWith('product/')) {
      return { view: 'product', params: { slug: hash.replace('product/', '') } };
    }
    if (hash.startsWith('category/')) {
      return { view: 'category', params: { slug: hash.replace('category/', '') } };
    }
    if (['shop', 'cart', 'account', 'admin', 'contact', 'categories', 'about'].includes(hash)) {
      return { view: hash, params: {} };
    }
    return { view: 'home', params: {} };
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const navigate = (view: string, params: Record<string, any> = {}) => {
    setRoute({ view, params });
    // Update hash for deep link
    if (view === 'home') {
      window.location.hash = '';
    } else if (view === 'product' && params.slug) {
      window.location.hash = `product/${params.slug}`;
    } else if (view === 'category' && params.slug) {
      window.location.hash = `category/${params.slug}`;
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync hash changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('product/')) {
        setRoute({ view: 'product', params: { slug: hash.replace('product/', '') } });
      } else if (hash.startsWith('category/')) {
        setRoute({ view: 'category', params: { slug: hash.replace('category/', '') } });
      } else if (['shop', 'cart', 'account', 'admin', 'contact', 'categories', 'about'].includes(hash)) {
        setRoute({ view: hash, params: {} });
      } else if (!hash) {
        setRoute({ view: 'home', params: {} });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderCurrentView = () => {
    switch (route.view) {
      case 'home':
        return <HomeView navigate={navigate} />;
      case 'shop':
        return <ShopView navigate={navigate} />;
      case 'category':
        return <ShopView initialCategorySlug={route.params.slug} navigate={navigate} />;
      case 'product':
        return <ProductDetailView slug={route.params.slug} navigate={navigate} />;
      case 'cart':
        return <CartView navigate={navigate} />;
      case 'order-success':
        return <OrderSuccessView params={route.params} navigate={navigate} />;
      case 'account':
        return (
          <AccountView
            initialTab={route.params.tab}
            initialOrderId={route.params.orderId}
            navigate={navigate}
          />
        );
      case 'admin':
        return <AdminDashboard navigate={navigate} />;
      case 'contact':
        return <ContactView />;
      case 'categories':
        return <CategoriesView navigate={navigate} />;
      case 'about':
        return <AboutView navigate={navigate} />;
      default:
        return <HomeView navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] flex flex-col font-sans">
      {/* Header is hidden in Admin view to allow full workspace focus */}
      {route.view !== 'admin' && (
        <Header
          currentView={route.view}
          navigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCart={() => setCartDrawerOpen(true)}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer is hidden in Admin view and Order Success view */}
      {route.view !== 'admin' && route.view !== 'order-success' && (
        <Footer navigate={navigate} />
      )}

      {/* Global Overlays & Modals */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        navigate={navigate}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <MainApp />
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

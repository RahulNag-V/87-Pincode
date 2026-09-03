import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  Sliders,
  ArrowRight,
  MessageCircle,
  Settings,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { LogoutGratitudeModal } from './LogoutGratitudeModal.js';

interface HeaderProps {
  currentView?: string;
  navigate: (view: string, params?: Record<string, any>) => void;
  openSearch?: () => void;
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'home',
  navigate,
  openSearch,
  onOpenSearch,
  onOpenCart
}) => {
  const { site, contact, categories } = useStore();
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gratitudeModalOpen, setGratitudeModalOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleOpenSearch = onOpenSearch || openSearch;
  const handleOpenCart = onOpenCart || openCartDrawer;

  // Click outside and Escape key to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };

    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Menswear', view: 'shop' },
    { name: 'Categories', view: 'categories' },
    { name: 'New Arrivals', view: 'shop', params: { filter: 'new_arrival' } },
    { name: 'Best Sellers', view: 'shop', params: { filter: 'bestseller' } },
    { name: 'Atelier Story', view: 'about' },
    { name: 'Concierge', view: 'contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080808]/95 backdrop-blur-md border-b border-[#1C1C1C]">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <div className="flex items-center lg:hidden shrink-0">
          <button
            id="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#D5D2CA] hover:text-[#C9A227] transition-colors rounded focus:outline-none focus:ring-1 focus:ring-[#C9A227] relative"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A227] ring-2 ring-[#080808] animate-pulse" />
            )}
          </button>
        </div>

        {/* Brand Text / Logo Treatment */}
        <div className="flex items-center shrink-0 min-w-0">
          <button
            id="brand-logo-btn"
            onClick={() => navigate('home')}
            className="group flex flex-col items-start text-left focus:outline-none select-none"
          >
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="luxury-serif text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight sm:tracking-tighter gold-text group-hover:brightness-110 transition-all whitespace-nowrap leading-tight">
                87 PINCODE
              </span>
            </div>
            <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#9B9B9B] mt-0.5 group-hover:text-[#D6C28A] transition-colors whitespace-nowrap leading-tight">
              MENSWEAR ATELIER
            </span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map(link => {
            const isActive =
              currentView === link.view &&
              (!link.params || JSON.stringify(link.params) === '{}');

            return (
              <button
                key={link.name}
                id={`nav-link-${link.view}-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(link.view, link.params)}
                className={`text-xs uppercase tracking-widest font-semibold transition-all py-1 relative ${
                  isActive
                    ? 'text-[#C9A227] opacity-100'
                    : 'text-[#F5F2EA] opacity-75 hover:opacity-100 hover:text-[#C9A227]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C9A227]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 md:space-x-3 shrink-0">
          {/* Admin Fast Link Pill if authenticated as admin */}
          {isAdmin && (
            <button
              id="admin-top-badge-btn"
              onClick={() => navigate('admin')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 border border-[#C9A227] rounded-full text-[#C9A227] text-[10px] uppercase font-bold tracking-wider bg-[#C9A227]/10 hover:bg-[#C9A227]/20 transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse"></div>
              <span>Admin</span>
            </button>
          )}

          {/* Search Trigger */}
          <button
            id="header-search-btn"
            onClick={handleOpenSearch}
            className="p-2 text-[#F5F2EA] opacity-80 hover:opacity-100 hover:text-[#C9A227] transition-all"
            title="Search products (Cmd+K)"
            aria-label="Search products"
          >
            <Search size={19} />
          </button>

          {/* Consolidated Atelier Settings Button (Wishlist, Cart, Orders, Profile & Logout) */}
          <div className="relative" ref={settingsRef}>
            <button
              id="header-settings-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`relative p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                settingsOpen
                  ? 'text-[#C9A227] bg-[#1A1A1A] ring-1 ring-[#C9A227]/50 shadow-[0_0_12px_rgba(201,162,39,0.2)]'
                  : 'text-[#F5F2EA] opacity-85 hover:opacity-100 hover:text-[#C9A227] hover:bg-[#141414]'
              }`}
              title="Atelier Settings, Cart & Account"
              aria-label="Atelier Settings, Cart & Account"
              aria-expanded={settingsOpen}
            >
              <Settings
                size={20}
                className={`transition-transform duration-300 ${settingsOpen ? 'rotate-90' : 'hover:rotate-45'}`}
              />
              {/* Badge showing item activity (Cart items or Wishlist items) */}
              {(itemCount > 0 || wishlistCount > 0) && (
                <span
                  id="settings-counter-badge"
                  className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#C9A227] text-black text-[9px] font-black flex items-center justify-center shadow-md ring-1 ring-[#080808]"
                >
                  {itemCount > 0 ? itemCount : wishlistCount}
                </span>
              )}
            </button>

            {/* Settings Dropdown Panel */}
            {settingsOpen && (
              <div
                id="atelier-settings-dropdown"
                className="absolute right-0 mt-3 w-80 sm:w-88 bg-[#0D0D0D]/98 border border-[#262626] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
              >
                {/* Dropdown Header: Client Profile Card or Guest Banner */}
                {isAuthenticated ? (
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] font-bold text-sm shrink-0">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#F5F2EA] truncate">
                            {user?.full_name || 'Atelier Patron'}
                          </p>
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C9A227]/15 text-[#E0B84F] border border-[#C9A227]/30 font-medium">
                            {user?.role === 'admin' ? 'Atelier Admin' : 'Privileged Patron'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#888888] truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] mb-2 text-center">
                    <p className="text-xs font-semibold text-[#F5F2EA]">Welcome to 87 PINCODE</p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Access your bespoke orders, wishlist & shopping bag
                    </p>
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        openAuthModal();
                      }}
                      className="mt-2.5 w-full py-2 bg-[#C9A227] hover:bg-[#D4AF37] text-[#080808] text-xs uppercase tracking-widest font-bold rounded-lg transition-colors shadow"
                    >
                      Sign In / Join Atelier
                    </button>
                  </div>
                )}

                {/* Hub Options */}
                <div className="space-y-1">
                  {/* 1. SHOPPING BAG (CART) */}
                  <button
                    id="settings-menu-cart-btn"
                    onClick={() => {
                      setSettingsOpen(false);
                      handleOpenCart();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161616] transition-all text-left group border border-transparent hover:border-[#222222]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181818] text-[#C9A227] flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                        <ShoppingBag size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA] group-hover:text-[#C9A227] transition-colors">
                          Shopping Bag
                        </div>
                        <div className="text-[10px] text-[#777777]">
                          Review pieces & bespoke checkout
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          itemCount > 0
                            ? 'bg-[#C9A227] text-[#080808]'
                            : 'bg-[#1C1C1C] text-[#666666]'
                        }`}
                      >
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <ChevronRight size={13} className="text-[#555] group-hover:text-[#F5F2EA] transition-colors" />
                    </div>
                  </button>

                  {/* 2. SAVED WISHLIST */}
                  <button
                    id="settings-menu-wishlist-btn"
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate('account', { tab: 'wishlist' });
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161616] transition-all text-left group border border-transparent hover:border-[#222222]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181818] text-[#E0B84F] flex items-center justify-center group-hover:bg-[#E0B84F] group-hover:text-black transition-colors shrink-0">
                        <Heart size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA] group-hover:text-[#C9A227] transition-colors">
                          Wishlist
                        </div>
                        <div className="text-[10px] text-[#777777]">
                          Curated favorite menswear pieces
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          wishlistCount > 0
                            ? 'bg-[#1F1F1F] border border-[#C9A227]/40 text-[#E0B84F]'
                            : 'bg-[#1C1C1C] text-[#666666]'
                        }`}
                      >
                        {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                      </span>
                      <ChevronRight size={13} className="text-[#555] group-hover:text-[#F5F2EA] transition-colors" />
                    </div>
                  </button>

                  {/* 3. ORDERS & TIMELINE */}
                  <button
                    id="settings-menu-orders-btn"
                    onClick={() => {
                      setSettingsOpen(false);
                      if (!isAuthenticated) {
                        openAuthModal(() => navigate('account', { tab: 'orders' }));
                      } else {
                        navigate('account', { tab: 'orders' });
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161616] transition-all text-left group border border-transparent hover:border-[#222222]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181818] text-[#C9A227] flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                        <Package size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA] group-hover:text-[#C9A227] transition-colors">
                          Orders & Tracking
                        </div>
                        <div className="text-[10px] text-[#777777]">
                          Tailoring status & WhatsApp timeline
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-[#555] group-hover:text-[#F5F2EA] transition-colors" />
                  </button>

                  {/* 4. CLIENT PROFILE */}
                  <button
                    id="settings-menu-profile-btn"
                    onClick={() => {
                      setSettingsOpen(false);
                      if (!isAuthenticated) {
                        openAuthModal(() => navigate('account', { tab: 'profile' }));
                      } else {
                        navigate('account', { tab: 'profile' });
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161616] transition-all text-left group border border-transparent hover:border-[#222222]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181818] text-[#C9A227] flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                        <User size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA] group-hover:text-[#C9A227] transition-colors">
                          Client Profile
                        </div>
                        <div className="text-[10px] text-[#777777]">
                          Shipping addresses & personal sizing
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-[#555] group-hover:text-[#F5F2EA] transition-colors" />
                  </button>

                  {/* 5. ADMIN ATELIER PANEL (If Admin) */}
                  {isAdmin && (
                    <button
                      id="settings-menu-admin-btn"
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate('admin');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 transition-all text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 text-[#E0B84F] flex items-center justify-center shrink-0">
                          <Sliders size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#E0B84F]">
                            Admin Atelier Panel
                          </div>
                          <div className="text-[10px] text-[#A89860]">
                            Manage catalogue, orders & site settings
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-[#C9A227]" />
                    </button>
                  )}

                  {/* 6. SIGN OUT WITH GRATITUDE */}
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-[#1C1C1C] my-1" />
                      <button
                        id="settings-menu-logout-btn"
                        onClick={() => {
                          setSettingsOpen(false);
                          setGratitudeModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-500/10 text-left group border border-transparent hover:border-red-500/30 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-[#181818] text-red-400 group-hover:bg-red-500 group-hover:text-black flex items-center justify-center transition-colors shrink-0">
                            <LogOut size={15} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-red-400">
                              Sign Out
                            </div>
                            <div className="text-[10px] text-[#777777]">
                              Conclude session with gratitude
                            </div>
                          </div>
                        </div>
                        <Sparkles size={14} className="text-[#C9A227] opacity-80 group-hover:opacity-100" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Portal Navigation Drawer */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          id="mobile-navigation-overlay"
          className="fixed inset-0 z-[100] lg:hidden bg-[#080808] flex flex-col animate-in fade-in duration-200"
        >
          {/* Drawer Top Navigation Bar */}
          <div className="h-20 px-4 sm:px-6 flex items-center justify-between border-b border-[#1C1C1C] bg-[#0A0A0A] shrink-0">
            <button
              onClick={() => {
                navigate('home');
                setMobileMenuOpen(false);
              }}
              className="flex flex-col items-start text-left focus:outline-none"
            >
              <span className="luxury-serif text-2xl font-bold tracking-tighter gold-text">
                87 PINCODE
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#9B9B9B] -mt-0.5">
                MENSWEAR ATELIER
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (handleOpenSearch) handleOpenSearch();
                }}
                className="p-2 text-[#D5D2CA] hover:text-[#C9A227] rounded focus:outline-none"
                aria-label="Search Catalog"
              >
                <Search size={20} />
              </button>

              <button
                id="mobile-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded border border-[#2B2B2B] text-[#D5D2CA] hover:text-[#C9A227] hover:border-[#C9A227] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                aria-label="Close Navigation Menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-[#1C1C1C]">
            {/* 1. Main Menswear Navigation */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] gold-text font-bold block mb-3">
                MENSWEAR SUITE
              </span>
              {navLinks.map(link => {
                const isActive =
                  currentView === link.view &&
                  (!link.params || JSON.stringify(link.params) === '{}');

                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      navigate(link.view, link.params);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-3 text-left uppercase tracking-[0.2em] text-sm font-semibold transition-colors border-b border-[#141414] ${
                      isActive ? 'gold-text' : 'text-[#D5D2CA] hover:text-[#C9A227]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={14} className={isActive ? 'gold-text' : 'text-[#555]'} />
                  </button>
                );
              })}
            </div>

            {/* 2. Shop by Department Quick Links */}
            {categories.length > 0 && (
              <div className="pt-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B9B9B] font-bold block mb-3">
                  SHOP BY DEPARTMENT
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigate('category', { slug: cat.slug });
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-3.5 py-2.5 rounded bg-[#121212] border border-[#202020] hover:border-[#C9A227]/50 hover:bg-[#181818] transition-all group"
                    >
                      <span className="text-xs text-[#F5F2EA] group-hover:text-[#C9A227] block truncate font-medium">
                        {cat.name}
                      </span>
                      <span className="text-[9px] text-[#777] block mt-0.5">Explore</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Client Services & Accounts */}
            <div className="pt-6 space-y-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B9B9B] font-bold block mb-1">
                CLIENT SERVICES
              </span>

              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#E0B84F] text-xs uppercase tracking-widest font-bold flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Sliders size={16} />
                    <span>Admin Atelier Panel</span>
                  </div>
                  <ArrowRight size={14} />
                </button>
              )}

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="p-3.5 rounded bg-[#121212] border border-[#222222]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#F5F2EA]">{user?.full_name}</p>
                        <p className="text-[11px] text-[#9B9B9B]">{user?.email}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C9A227]/15 text-[#E0B84F] border border-[#C9A227]/30">
                        {user?.role === 'admin' ? 'Atelier Admin' : 'Private Client'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigate('account', { tab: 'orders' });
                        setMobileMenuOpen(false);
                      }}
                      className="py-2.5 px-3 rounded bg-[#161616] border border-[#242424] text-xs text-[#D5D2CA] hover:text-[#C9A227] flex items-center justify-center space-x-1.5"
                    >
                      <Package size={14} />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('account', { tab: 'wishlist' });
                        setMobileMenuOpen(false);
                      }}
                      className="py-2.5 px-3 rounded bg-[#161616] border border-[#242424] text-xs text-[#D5D2CA] hover:text-[#C9A227] flex items-center justify-center space-x-1.5"
                    >
                      <Heart size={14} />
                      <span>Wishlist ({wishlistCount})</span>
                    </button>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        navigate('account', { tab: 'notifications' });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3 rounded bg-[#161616] border border-[#242424] text-xs text-[#D5D2CA] hover:text-[#C9A227] flex items-center justify-center space-x-1.5"
                    >
                      <Bell size={14} />
                      <span>
                        Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setGratitudeModalOpen(true);
                    }}
                    className="w-full py-2.5 text-xs text-red-400 hover:underline flex items-center justify-center space-x-1.5"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3.5 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold rounded text-center transition-colors shadow-lg"
                >
                  Sign In / Private Client Access
                </button>
              )}
            </div>

            {/* 4. Bespoke Concierge Assistance */}
            <div className="pt-6 space-y-3 pb-8">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9B9B9B] font-bold block">
                BESPOKE SIZING CONCIERGE
              </span>
              {contact?.whatsapp_number && (
                <a
                  href={`https://wa.me/${contact.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hello 87 Pincode, I am browsing on mobile and would like personalized assistance with menswear sizing and styling.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded bg-[#101010] border border-[#252525] hover:border-[#25D366] text-[#25D366] text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={16} />
                    <span>WhatsApp Atelier Concierge</span>
                  </div>
                  <ArrowRight size={14} />
                </a>
              )}
              <p className="text-[11px] text-[#888] leading-relaxed">
                Need custom sizing or fabric consultation? Master tailors available Monday–Saturday 10 AM – 8:30 PM IST.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sign Out Gratitude Experience Modal */}
      <LogoutGratitudeModal
        isOpen={gratitudeModalOpen}
        userName={user?.full_name}
        onConfirmLogout={async () => {
          await logout();
          setGratitudeModalOpen(false);
          navigate('home');
        }}
        onCancel={() => setGratitudeModalOpen(false)}
      />
    </header>
  );
};

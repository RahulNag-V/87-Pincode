import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.js';
import { api } from '../lib/api.js';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = '87pincode_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with backend on login
  useEffect(() => {
    if (isAuthenticated && user) {
      api.syncWishlist(wishlistIds)
        .then(res => {
          if (res && res.wishlist) {
            setWishlistIds(res.wishlist);
          }
        })
        .catch(err => console.error('Error syncing wishlist with server:', err));
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  const toggleWishlist = async (productId: string) => {
    // Optimistic update
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (isAuthenticated) {
      try {
        const res = await api.toggleWishlist(productId);
        if (res && res.wishlist) {
          setWishlistIds(res.wishlist);
        }
      } catch (err) {
        console.error('Failed to sync wishlist toggle to server:', err);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistIds.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}


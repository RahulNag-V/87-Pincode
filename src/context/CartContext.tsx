import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types.js';
import { useAuth } from './AuthContext.js';
import { useStore } from './StoreContext.js';
import { api } from '../lib/api.js';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const GUEST_CART_STORAGE_KEY = '87pincode_guest_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { site } = useStore();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync / Merge guest cart with user cart on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const syncWithServer = async () => {
        try {
          const res = await api.syncCart(items);
          if (res.items) {
            setItems(res.items);
            localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(res.items));
          }
        } catch (e) {
          console.error('Cart sync error:', e);
        }
      };
      syncWithServer();
    }
  }, [isAuthenticated, user?.id]);

  // Persist locally for instant responsiveness
  useEffect(() => {
    try {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (product: Product, size: string, color: string, quantity = 1) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        i => i.product_id === product.id && i.size === size && i.color === color
      );

      const price = product.sale_price ?? product.price;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          max_stock: product.stock
        };
        return updated;
      } else {
        const newItem: CartItem = {
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || '',
          size,
          color,
          price,
          quantity: Math.min(product.stock, quantity),
          max_stock: product.stock
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.size === size && i.color === color)));
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.product_id === productId && i.size === size && i.color === color) {
          return {
            ...i,
            quantity: Math.min(i.max_stock, quantity)
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const freeShippingThreshold = site?.free_shipping_threshold ?? 2999;
  const standardShippingFee = site?.standard_shipping_fee ?? 199;
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shipping,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ListingWithImages } from '../lib/supabase';

export interface CartItem {
  listingId: string;
  name: string;
  price: number;
  currency: string;
  size: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (listing: ListingWithImages) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'martenitsi_cart';

function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable (e.g. private browsing) - ignore
    }
  }, [items]);

  const addItem = (listing: ListingWithImages) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.listingId === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listingId === listing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          listingId: listing.id,
          name: listing.name,
          price: listing.price,
          currency: listing.currency,
          size: listing.size,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (listingId: string) => {
    setItems((prev) => prev.filter((item) => item.listingId !== listingId));
  };

  const updateQuantity = (listingId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(listingId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.listingId === listingId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../services/api';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: string[];
  specialRequests?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, customizations: string[], specialRequests?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateCustomizations: (menuItemId: string, customizations: string[]) => void;
  updateSpecialRequests: (menuItemId: string, specialRequests: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (
    menuItem: MenuItem,
    quantity: number,
    customizations: string[],
    specialRequests?: string
  ) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          customizations,
          specialRequests,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { menuItem, quantity, customizations, specialRequests }];
      }
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateCustomizations = (menuItemId: string, customizations: string[]) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, customizations } : item
      )
    );
  };

  const updateSpecialRequests = (menuItemId: string, specialRequests: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, specialRequests } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      return total + Number(item.menuItem.price) * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateCustomizations,
    updateSpecialRequests,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

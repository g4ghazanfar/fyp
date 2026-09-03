import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Meal } from "@/data/meals";

export interface CartItem {
  meal: Meal;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (meal: Meal) => void;
  removeItem: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem("smarteats_cart");
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {}
  };

  const saveCart = async (newItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem("smarteats_cart", JSON.stringify(newItems));
    } catch (e) {}
  };

  const addItem = (meal: Meal) => {
    setItems(prev => {
      const existing = prev.find(i => i.meal.id === meal.id);
      const updated = existing
        ? prev.map(i => i.meal.id === meal.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { meal, quantity: 1 }];
      saveCart(updated);
      return updated;
    });
  };

  const removeItem = (mealId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.meal.id !== mealId);
      saveCart(updated);
      return updated;
    });
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(mealId); return; }
    setItems(prev => {
      const updated = prev.map(i => i.meal.id === mealId ? { ...i, quantity } : i);
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem("smarteats_cart");
  };

  const total = items.reduce((sum, i) => sum + i.meal.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/context/CartContext";
import { Meal } from "@/data/meals";
import { apiRequest } from "@/data/api";
import { useAuth } from "@/context/AuthContext";

export type OrderStatus = "placed" | "confirmed" | "preparing" | "picked_up" | "on_way" | "delivered";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: "easypaisa" | "jazzcash";
  status: OrderStatus;
  createdAt: string;
  estimatedTime: number;
  rider: {
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    currentLocation: string;
  };
  restaurant: string;
}

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (items: CartItem[], total: number, paymentMethod: "easypaisa" | "jazzcash") => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

const EMPTY_MEAL = (id: string, name: string, price: number): Meal => ({
  id, name, nameUrdu: "", description: "", price, calories: 0, protein: 0, carbs: 0, fat: 0,
  category: "lunch", tags: [], allergens: [], image: "", restaurant: "SmartEats Kitchen",
  rating: 0, reviews: 0, prepTime: 0, isHealthy: false, healthScore: 0, suitableFor: [],
  ingredients: [], instructions: "",
  matchReason: "",
});

function normalizeOrder(order: any): Order {
  return {
    id: order.id || order._id,
    items: (order.items || []).map((item: any) => ({
      meal: item.meal || EMPTY_MEAL(item.mealId || item.name, item.name, Number(item.price) || 0),
      quantity: Number(item.quantity) || 1,
    })),
    total: Number(order.total ?? order.totalPrice) || 0,
    paymentMethod: order.paymentMethod || "easypaisa",
    status: order.status === "placed" ? "confirmed" : order.status,
    createdAt: order.createdAt,
    estimatedTime: order.estimatedTime || 30,
    rider: order.rider || {
      name: "SmartEats Rider",
      phone: "",
      rating: 5,
      vehicle: "Delivery bike",
      currentLocation: "Preparing your order",
    },
    restaurant: order.restaurant || "SmartEats Kitchen",
  };
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      return;
    }
    apiRequest<{ orders: any[] }>(`/orders/${encodeURIComponent(user.id)}`)
      .then(response => {
        const normalized = response.orders.map(normalizeOrder);
        setOrders(normalized);
        AsyncStorage.setItem("smarteats_orders", JSON.stringify(normalized)).catch(() => {});
      })
      .catch(async () => {
        const stored = await AsyncStorage.getItem("smarteats_orders");
        if (stored) setOrders(JSON.parse(stored));
      });
  }, [user?.id]);

  const placeOrder = async (items: CartItem[], total: number, paymentMethod: "easypaisa" | "jazzcash") => {
    if (!user?.id) throw new Error("Please log in before placing an order");
    const response = await apiRequest<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: items.map(item => ({
          mealId: item.meal.id,
          name: item.meal.name,
          quantity: item.quantity,
          price: item.meal.price,
        })),
        totalPrice: total,
        paymentMethod,
      }),
    });
    const order = normalizeOrder(response.order);
    setOrders(previous => {
      const updated = [order, ...previous];
      AsyncStorage.setItem("smarteats_orders", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    return order;
  };

  const getOrderById = (id: string) => orders.find(order => order.id === id);
  const activeOrder = orders.find(order => order.status !== "delivered") ?? null;

  return (
    <OrderContext.Provider value={{ orders, activeOrder, placeOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
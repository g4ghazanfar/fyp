import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/data/api";

export interface HealthProfile {
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  bloodType: string;
  allergies: string[];
  conditions: string[];
  dietaryPrefs: string[];
  fitnessGoal: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  healthProfile: HealthProfile;
  points: number;
  streak: number;
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, "id" | "points" | "streak" | "joinDate">, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addPoints: (pts: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthResponse = { token: string; user: User };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("smarteats_user");
      const onboarded = await AsyncStorage.getItem("smarteats_onboarded");
      if (stored) setUser(JSON.parse(stored));
      if (onboarded) setIsOnboarded(true);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async ({ token, user: nextUser }: AuthResponse) => {
    setUser(nextUser);
    await AsyncStorage.multiSet([
      ["smarteats_token", token],
      ["smarteats_user", JSON.stringify(nextUser)],
      ["smarteats_onboarded", "true"],
    ]);
    setIsOnboarded(true);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await saveSession(response);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (userData: Omit<User, "id" | "points" | "streak" | "joinDate">, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...userData, password }),
      });
      await saveSession(response);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.multiRemove(["smarteats_user", "smarteats_token"]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem("smarteats_user", JSON.stringify(updated));
  };

  const addPoints = async (pts: number) => {
    if (!user) return;
    const updated = { ...user, points: user.points + pts };
    setUser(updated);
    await AsyncStorage.setItem("smarteats_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnboarded, login, register, logout, updateUser, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import AsyncStorage from "@react-native-async-storage/async-storage";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
const baseUrl = (configuredUrl || origin).replace(/\/+$/, "");
export const API_BASE_URL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem("smarteats_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}
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

// Naya function — audio/image jaisi files upload karne ke liye (multipart/form-data)
// NOTE: Content-Type header jaan-boojh kar set nahi ki — fetch khud "multipart/form-data; boundary=..."
// set kar deta hai jab body FormData ho. Agar hum manually set karein to boundary missing ho jata hai
// aur backend request parse nahi kar pata.
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = await AsyncStorage.getItem("smarteats_token");
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

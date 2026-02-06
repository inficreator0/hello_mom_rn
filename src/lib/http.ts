import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://hellomom-api.ddns.net:8080/api";

// Get JWT token from AsyncStorage
const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("token");
};

// Set JWT token in AsyncStorage
export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem("token", token);
};

// Remove JWT token from AsyncStorage
export const clearAuthStorage = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

// API request helper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If the token is invalid/expired, clear local session
    if (response.status === 401 || response.status === 403) {
      await clearAuthStorage();
      // Navigation will be handled by the app's auth state
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};



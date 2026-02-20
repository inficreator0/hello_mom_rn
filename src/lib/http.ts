import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "https://hellomom-api.ddns.net/api";

// Variables to handle multiple concurrent 401s
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (accessToken: string) => {
  refreshSubscribers.map((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Get tokens from AsyncStorage
const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("token");
};

const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("refreshToken");
};

// Set tokens in AsyncStorage
export const setTokens = async (token: string, refreshToken?: string | null): Promise<void> => {
  if (token && typeof token === 'string') {
    await AsyncStorage.setItem("token", token);
  } else if (token === null) {
    await AsyncStorage.removeItem("token");
  }

  if (refreshToken && typeof refreshToken === 'string') {
    await AsyncStorage.setItem("refreshToken", refreshToken);
  } else if (refreshToken === null) {
    await AsyncStorage.removeItem("refreshToken");
  }
};

// Backward compatibility (deprecated)
export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem("token", token);
};

// Remove tokens from AsyncStorage
export const clearAuthStorage = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("refreshToken");
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
    console.log(`API Error [${response.status}] ${endpoint}:`, response.statusText);

    // Handling 401/403 - attempt to refresh token
    if ((response.status === 401 || response.status === 403) && !endpoint.includes("/auth/refresh")) {
      try {
        console.log(`Attempting token refresh due to ${response.status}...`);
        const newToken = await handleTokenRefresh();

        // Retry the original request with the new token
        const newHeaders: HeadersInit = {
          ...headers,
          "Authorization": `Bearer ${newToken}`,
        };

        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });

        if (retryResponse.ok) {
          return retryResponse.json();
        }

        // If the retry also fails with 401/403, give up
        if (retryResponse.status === 401 || retryResponse.status === 403) {
          console.log(`Retry failed with ${retryResponse.status}, logging out`);
          await useAuthStore.getState().logout();
        }
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        // Refresh failed, logout user
        await useAuthStore.getState().logout();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }
    }

    // Other errors (failed retry or non-auth errors)
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};

const handleTokenRefresh = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    await setTokens(data.token, data.refreshToken);

    onTokenRefreshed(data.token);
    return data.token;
  } finally {
    isRefreshing = false;
  }
};



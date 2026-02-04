const API_BASE_URL = "https://motherhood-community-app-latest.onrender.com/api";

// Get JWT token from localStorage
const getToken = (): string | null => {
  return typeof window !== "undefined"
    ? window.localStorage.getItem("token")
    : null;
};

// Set JWT token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("token", token);
  }
};

// Remove JWT token from localStorage
export const clearAuthStorage = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
};

// API request helper
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
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
    // If the token is invalid/expired, clear local session and redirect to login
    if (response.status === 401 || response.status === 403) {
      clearAuthStorage();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};



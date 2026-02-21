import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, setTokens, clearAuthStorage } from "../http";

export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await apiRequest<{
      token: string;
      refreshToken?: string;
      refresh_token?: string;
      type: string;
      userId: number;
      username: string;
      email: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const rt = response.refreshToken || response.refresh_token;
    if (!rt && response.token) {
      console.warn("No refresh token found in register response", response);
    }

    // Store tokens before any subsequent API calls (e.g. onboarding check)
    await setTokens(response.token, rt);
    return response;
  },

  login: async (username: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      refreshToken?: string;
      refresh_token?: string;
      type: string;
      userId: number;
      username: string;
      email: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const rt = response.refreshToken || response.refresh_token;
    if (!rt && response.token) {
      console.warn("No refresh token found in login response", response);
    }

    await setTokens(response.token, rt);
    return response;
  },

  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      await clearAuthStorage();
    }
  },

  forgotPassword: async (email: string) => {
    return await apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    return await apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getOnboardingStatus: async () => {
    return await apiRequest<{ isOnboarded: boolean; onboardingType: string | null }>(
      "/users/me/onboarding",
      { method: "GET" }
    );
  },

  completeOnboarding: async (data: {
    onboardingType: string;
    age?: number;
    gender?: string;
  }) => {
    return await apiRequest<{
      message: string;
      isOnboarded: boolean;
      onboardingType: string;
      age?: number;
      gender?: string;
    }>("/users/me/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  registerDeviceToken: async (token: string) => {
    return await apiRequest<{ message: string }>("/users/me/device-token", {
      method: "POST",
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  },

  verifyEmail: async (token: string) => {
    return await apiRequest<{ message: string }>(`/auth/verify-email?token=${token}`, {
      method: "GET",
    });
  },

  resendVerification: async (email: string) => {
    return await apiRequest<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  getMe: async () => {
    return await apiRequest<{
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      createdAt: string;
      updatedAt: string;
    }>("/users/me", { method: "GET" });
  },
};

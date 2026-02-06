import { apiRequest, setToken, clearAuthStorage } from "../http";

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
      type: string;
      userId: number;
      username: string;
      email: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Side-effect: store token after successful auth
    setToken(response.token);
    return response;
  },

  login: async (username: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      type: string;
      userId: number;
      username: string;
      email: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    setToken(response.token);
    return response;
  },

  logout: () => {
    clearAuthStorage();
  },

  forgotPassword: async (email: string) => {
    return await apiRequest<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    return await apiRequest<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getOnboardingStatus: async () => {
    return await apiRequest<{ isOnboarded: boolean; onboardingType: string | null }>(
      "/api/users/me/onboarding",
      { method: "GET" }
    );
  },

  completeOnboarding: async (onboardingType: string) => {
    return await apiRequest<{ message: string; isOnboarded: boolean }>("/api/users/me/onboarding", {
      method: "POST",
      body: JSON.stringify({ onboardingType }),
    });
  },
};



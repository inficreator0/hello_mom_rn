import { apiRequest } from "../http";
import {
  CycleDayLog,
  CyclePrediction,
  UserCycleSettings,
  PredictionsResponse
} from "../../types";

// ... existing interfaces ...

export const cycleAPI = {
  // ... existing methods ...

  // Daily Cycle Logging
  getDailyLog: async (date: string): Promise<CycleDayLog> => {
    return await apiRequest<CycleDayLog>(`/cycle/daily/${date}`, {
      method: "GET",
    });
  },

  updateDailyLog: async (data: CycleDayLog): Promise<CycleDayLog> => {
    return await apiRequest<CycleDayLog>("/cycle/daily", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDailyLogRange: async (startDate: string, endDate: string): Promise<CycleDayLog[]> => {
    return await apiRequest<CycleDayLog[]>(`/cycle/daily/range?startDate=${startDate}&endDate=${endDate}`, {
      method: "GET",
    });
  },

  getRecentLogs: (days?: number, year?: number, month?: number): Promise<CycleDayLog[]> => {
    let url = "/cycle/daily/recent";
    const params = new URLSearchParams();
    if (days) params.append("days", days.toString());
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return apiRequest<CycleDayLog[]>(url, { method: "GET" });
  },

  copyYesterdayLog: async (): Promise<CycleDayLog> => {
    return await apiRequest<CycleDayLog>("/cycle/daily/copy-yesterday", {
      method: "POST",
    });
  },

  deleteDailyLog: async (date: string): Promise<void> => {
    await apiRequest(`/cycle/daily/${date}`, {
      method: "DELETE",
    });
  },

  deleteAllLogs: async (): Promise<void> => {
    await apiRequest("/cycle/daily/all", {
      method: "DELETE",
    });
  },

  // Cycle Predictions
  getPredictions: async (): Promise<PredictionsResponse> => {
    return await apiRequest<PredictionsResponse>("/cycle/predictions", {
      method: "GET",
    });
  },

  generatePredictions: async (): Promise<void> => {
    await apiRequest("/cycle/predictions/generate", {
      method: "POST",
    });
  },

  dismissPrediction: async (id: number): Promise<void> => {
    await apiRequest(`/cycle/predictions/${id}`, {
      method: "DELETE",
    });
  },

  // Cycle Settings
  getSettings: async (): Promise<UserCycleSettings> => {
    return await apiRequest<UserCycleSettings>("/cycle/settings", {
      method: "GET",
    });
  },

  updateSettings: async (data: Partial<UserCycleSettings>): Promise<UserCycleSettings> => {
    return await apiRequest<UserCycleSettings>("/cycle/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  resetSettings: async (): Promise<UserCycleSettings> => {
    return await apiRequest<UserCycleSettings>("/cycle/settings/reset", {
      method: "POST",
    });
  },
};

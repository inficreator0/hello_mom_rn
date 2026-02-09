import { apiRequest } from "../http";

export interface WeightLogRequest {
  date: string; // ISO date string
  weightKg: number; // weight in kilograms
  notes?: string;
}

export interface WeightLogResponse {
  id: number;
  date: string; // ISO date string
  weightKg: number; // weight in kilograms
  notes?: string;
  createdAt: string; // ISO timestamp
}

export interface WeightAnalytics {
  currentWeight: number;
  weightChange: number; // change from previous entry
  averageWeight: number;
  minWeight: number;
  maxWeight: number;
  totalEntries: number;
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  weeklyAverage: number;
  monthlyAverage: number;
}

export const weightAPI = {
  // Log weight entry
  logWeight: async (data: WeightLogRequest): Promise<WeightLogResponse> => {
    return await apiRequest<WeightLogResponse>("/trackers/health/weight", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get weight history
  getWeightHistory: async (): Promise<WeightLogResponse[]> => {
    return await apiRequest<WeightLogResponse[]>("/trackers/health/weight", {
      method: "GET",
    });
  },

  // Get weight analytics
  getWeightAnalytics: async (): Promise<WeightAnalytics> => {
    return await apiRequest<WeightAnalytics>("/trackers/health/weight/analytics", {
      method: "GET",
    });
  },

  // Update weight entry
  updateWeight: async (id: number, data: Partial<WeightLogRequest>): Promise<WeightLogResponse> => {
    return await apiRequest<WeightLogResponse>(`/trackers/health/weight/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete weight entry
  deleteWeight: async (id: number): Promise<{ message: string }> => {
    return await apiRequest<{ message: string }>(`/trackers/health/weight/${id}`, {
      method: "DELETE",
    });
  },
};

import { apiRequest } from "../http";

export interface MenstrualCycleRequest {
  startDate: string;
  endDate?: string;
  notes?: string;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'very_heavy';
  symptoms?: string[];
  fertilitySigns?: string[];
  healthMetrics?: string[];
  mood?: 'happy' | 'sad' | 'irritable' | 'anxious' | 'neutral';
  painLevel?: number; // 1-10 scale
  ovulationDate?: string;
  cycleLength?: number;
  basalBodyTemp?: number; // in Fahrenheit
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  intercourseDays?: string[]; // dates for fertility tracking
  medications?: string[];
  supplements?: string[];
}

export interface MenstrualCycleResponse {
  id: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'very_heavy';
  symptoms?: string[];
  fertilitySigns?: string[];
  healthMetrics?: string[];
  mood?: 'happy' | 'sad' | 'irritable' | 'anxious' | 'neutral';
  painLevel?: number;
  ovulationDate?: string;
  cycleLength?: number;
  basalBodyTemp?: number;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  intercourseDays?: string[];
  medications?: string[];
  supplements?: string[];
  createdAt: string;
}

export interface CycleAnalytics {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodDate: string;
  nextPeriodDate: string;
  nextOvulationDate: string;
  fertileWindow: { start: string; end: string };
  averageFlowIntensity: string;
  commonSymptoms: string[];
  commonFertilitySigns: string[];
  regularityScore: number; // 0-100
  cycleVariation: number; // days variation
  averagePainLevel: number;
  fertilityScore: number; // 0-100 based on fertility signs
}

export interface FertilityPrediction {
  nextOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  periodDueDate: string;
  conceptionProbability: number; // 0-100
  recommendedActions: string[];
}

export const cycleAPI = {
  // Log a menstrual cycle
  logCycle: async (data: MenstrualCycleRequest): Promise<MenstrualCycleResponse> => {
    return await apiRequest<MenstrualCycleResponse>("/trackers/cycle", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get cycle history
  getCycleHistory: async (): Promise<MenstrualCycleResponse[]> => {
    return await apiRequest<MenstrualCycleResponse[]>("/trackers/cycle", {
      method: "GET",
    });
  },

  // Get cycle analytics
  getCycleAnalytics: async (): Promise<CycleAnalytics> => {
    return await apiRequest<CycleAnalytics>("/trackers/cycle/analytics", {
      method: "GET",
    });
  },

  // Get fertility predictions
  getFertilityPrediction: async (): Promise<FertilityPrediction> => {
    return await apiRequest<FertilityPrediction>("/trackers/cycle/fertility", {
      method: "GET",
    });
  },

  // Update cycle entry
  updateCycle: async (id: number, data: Partial<MenstrualCycleRequest>): Promise<MenstrualCycleResponse> => {
    return await apiRequest<MenstrualCycleResponse>(`/trackers/cycle/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete cycle entry
  deleteCycle: async (id: number): Promise<{ message: string }> => {
    return await apiRequest<{ message: string }>(`/trackers/cycle/${id}`, {
      method: "DELETE",
    });
  },
};

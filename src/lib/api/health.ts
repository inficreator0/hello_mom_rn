import { apiRequest } from "../http";

// --- Types ---

export interface MoodLogRequest {
    date: string;
    mood: string;
    notes?: string;
}

export interface MoodLogResponse extends MoodLogRequest {
    id: number;
    createdAt: string;
}

export interface WaterIntakeRequest {
    date: string;
    amountMl: number;
}

export interface WaterIntakeResponse extends WaterIntakeRequest {
    id: number;
    createdAt: string;
}

export interface WaterIntakeDailyResponse {
    date: string;
    totalMl: number;
    logCount: number;
}

export interface SleepLogRequest {
    startTime: string;
    endTime: string;
    quality: string;
    notes?: string;
}

export interface SleepLogResponse extends SleepLogRequest {
    id: number;
    createdAt: string;
}

export interface WeightLogRequest {
    date: string;
    weightKg: number;
    notes?: string;
}

export interface WeightLogResponse extends WeightLogRequest {
    id: number;
    targetWeightKg: number | null;
    createdAt: string;
}

export interface TargetWeightRequest {
    targetWeightKg: number;
}

export interface TargetWeightResponse {
    targetWeightKg: number | null;
    message: string;
}

export interface SymptomLogRequest {
    date: string;
    symptom: string;
    severity: string;
    notes?: string;
}

export interface SymptomLogResponse extends SymptomLogRequest {
    id: number;
    createdAt: string;
}

// --- API ---

export const healthAPI = {
    // Mood
    logMood: (data: MoodLogRequest) => apiRequest<MoodLogResponse>("/trackers/health/mood", { method: "POST", body: JSON.stringify(data) }),
    getMoodHistory: () => apiRequest<MoodLogResponse[]>("/trackers/health/mood", { method: "GET" }),
    deleteMood: (id: number) => apiRequest<{ message: string }>(`/trackers/health/mood/${id}`, { method: "DELETE" }),

    // Water
    logWater: (data: WaterIntakeRequest) => apiRequest<WaterIntakeResponse>("/trackers/health/water", { method: "POST", body: JSON.stringify(data) }),
    getWaterHistory: () => apiRequest<WaterIntakeDailyResponse[]>("/trackers/health/water", { method: "GET" }),
    getTodayWaterLogs: () => apiRequest<WaterIntakeResponse[]>("/trackers/health/water/today", { method: "GET" }),
    deleteWater: (id: number) => apiRequest<{ message: string }>(`/trackers/health/water/${id}`, { method: "DELETE" }),

    // Sleep
    logSleep: (data: SleepLogRequest) => apiRequest<SleepLogResponse>("/trackers/health/sleep", { method: "POST", body: JSON.stringify(data) }),
    getSleepHistory: () => apiRequest<SleepLogResponse[]>("/trackers/health/sleep", { method: "GET" }),
    deleteSleep: (id: number) => apiRequest<{ message: string }>(`/trackers/health/sleep/${id}`, { method: "DELETE" }),

    // Weight
    logWeight: (data: WeightLogRequest) => apiRequest<WeightLogResponse>("/trackers/health/weight", { method: "POST", body: JSON.stringify(data) }),
    getWeightHistory: () => apiRequest<WeightLogResponse[]>("/trackers/health/weight", { method: "GET" }),
    deleteWeight: (id: number) => apiRequest<{ message: string }>(`/trackers/health/weight/${id}`, { method: "DELETE" }),
    setTargetWeight: (data: TargetWeightRequest) => apiRequest<TargetWeightResponse>("/trackers/health/weight/target", { method: "PUT", body: JSON.stringify(data) }),
    getTargetWeight: () => apiRequest<TargetWeightResponse>("/trackers/health/weight/target", { method: "GET" }),

    // Symptoms
    logSymptom: (data: SymptomLogRequest) => apiRequest<SymptomLogResponse>("/trackers/health/symptoms", { method: "POST", body: JSON.stringify(data) }),
    getSymptomHistory: () => apiRequest<SymptomLogResponse[]>("/trackers/health/symptoms", { method: "GET" }),
    deleteSymptom: (id: number) => apiRequest<{ message: string }>(`/trackers/health/symptoms/${id}`, { method: "DELETE" }),
};

import { apiRequest } from "../http";

export interface PregnancyProgressRequest {
    weekNumber: number;
    weight?: number;
    bellySize?: number;
    date: string;
    notes?: string;
}

export interface PregnancyProgressResponse extends PregnancyProgressRequest {
    id: number;
    createdAt: string;
}

export interface KickCounterRequest {
    startTime: string;
    endTime: string;
    count: number;
    notes?: string;
}

export interface KickCounterResponse extends KickCounterRequest {
    id: number;
    createdAt: string;
}

export interface ContractionTimerRequest {
    startTime: string;
    endTime: string;
    durationSeconds: number;
    frequencyMinutes: number;
    intensity: string;
}

export interface ContractionTimerResponse extends ContractionTimerRequest {
    id: number;
    createdAt: string;
}

export const pregnancyAPI = {
    // Progress
    logProgress: (data: PregnancyProgressRequest) => apiRequest<PregnancyProgressResponse>("/trackers/pregnancy/progress", { method: "POST", body: JSON.stringify(data) }),
    getProgressHistory: () => apiRequest<PregnancyProgressResponse[]>("/trackers/pregnancy/progress", { method: "GET" }),
    deleteProgress: (id: number) => apiRequest<{ message: string }>(`/trackers/pregnancy/progress/${id}`, { method: "DELETE" }),

    // Kicks
    logKickCount: (data: KickCounterRequest) => apiRequest<KickCounterResponse>("/trackers/pregnancy/kicks", { method: "POST", body: JSON.stringify(data) }),
    getKickHistory: () => apiRequest<KickCounterResponse[]>("/trackers/pregnancy/kicks", { method: "GET" }),
    deleteKickEntry: (id: number) => apiRequest<{ message: string }>(`/trackers/pregnancy/kicks/${id}`, { method: "DELETE" }),

    // Contractions
    logContraction: (data: ContractionTimerRequest) => apiRequest<ContractionTimerResponse>("/trackers/pregnancy/contractions", { method: "POST", body: JSON.stringify(data) }),
    getContractionHistory: () => apiRequest<ContractionTimerResponse[]>("/trackers/pregnancy/contractions", { method: "GET" }),
    deleteContraction: (id: number) => apiRequest<{ message: string }>(`/trackers/pregnancy/contractions/${id}`, { method: "DELETE" }),
};

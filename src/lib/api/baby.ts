import { apiRequest } from "../http";

export interface BabyFeedingRequest {
    feedingTime: string;
    durationMinutes: number;
    type: "BREAST" | "BOTTLE";
    amountMl: number;
    side?: "LEFT" | "RIGHT" | "BOTH" | null;
    notes?: string;
}

export interface BabyFeedingResponse {
    id: number;
    feedingTime: string;
    durationMinutes: number;
    type: "BREAST" | "BOTTLE";
    amountMl: number;
    side: "LEFT" | "RIGHT" | "BOTH" | null;
    notes: string;
    createdAt: string;
}

export interface FeedingSummary {
    breastFeedingSessions: number;
    totalFormulaMl: number;
    lastSession: BabyFeedingResponse | null;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export const babyAPI = {
    logFeeding: (data: BabyFeedingRequest) => apiRequest<BabyFeedingResponse>("/trackers/baby/feeding", { method: "POST", body: JSON.stringify(data) }),
    getFeedingHistory: (page = 0, size = 10) => apiRequest<PaginatedResponse<BabyFeedingResponse>>(`/trackers/baby/feeding?page=${page}&size=${size}`, { method: "GET" }),
    getFeedingSummary: () => apiRequest<FeedingSummary>("/trackers/baby/feeding/summary", { method: "GET" }),
    deleteFeeding: (id: number) => apiRequest<{ message: string }>(`/trackers/baby/feeding/${id}`, { method: "DELETE" }),
};

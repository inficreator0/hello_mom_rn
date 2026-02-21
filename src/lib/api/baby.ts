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

export interface BabyGrowthRequest {
    weightKg?: number;
    heightCm?: number;
    headCircumferenceCm?: number;
    logDate: string;
    notes?: string;
}

export interface BabyGrowthResponse extends BabyGrowthRequest {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface BabyProfileRequest {
    name?: string;
    expectedDueDate?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "UNKNOWN";
}

export interface BabyProfileResponse extends BabyProfileRequest {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export const babyAPI = {
    // Feeding
    logFeeding: (data: BabyFeedingRequest) => apiRequest<BabyFeedingResponse>("/trackers/baby/feeding", { method: "POST", body: JSON.stringify(data) }),
    getFeedingHistory: (page = 0, size = 10) => apiRequest<PaginatedResponse<BabyFeedingResponse>>(`/trackers/baby/feeding?page=${page}&size=${size}`, { method: "GET" }),
    getFeedingSummary: () => apiRequest<FeedingSummary>("/trackers/baby/feeding/summary", { method: "GET" }),
    deleteFeeding: (id: number) => apiRequest<{ message: string }>(`/trackers/baby/feeding/${id}`, { method: "DELETE" }),

    // Growth
    logGrowth: (babyId: number, data: BabyGrowthRequest) => apiRequest<BabyGrowthResponse>(`/users/me/babies/${babyId}/growth`, { method: "POST", body: JSON.stringify(data) }),
    getGrowthHistory: (babyId: number) => apiRequest<BabyGrowthResponse[]>(`/users/me/babies/${babyId}/growth`, { method: "GET" }),
    updateGrowth: (id: number, data: Partial<BabyGrowthRequest>) => apiRequest<BabyGrowthResponse>(`/users/me/babies/growth/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteGrowth: (id: number) => apiRequest<{ message: string }>(`/users/me/babies/growth/${id}`, { method: "DELETE" }),

    // Baby Profiles
    getBabies: () => apiRequest<BabyProfileResponse[]>("/users/me/babies", { method: "GET" }),
    createBaby: (data: BabyProfileRequest) => apiRequest<BabyProfileResponse>("/users/me/babies", { method: "POST", body: JSON.stringify(data) }),
    updateBaby: (id: number, data: Partial<BabyProfileRequest>) => apiRequest<BabyProfileResponse>(`/users/me/babies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteBaby: (id: number) => apiRequest<{ message: string }>(`/users/me/babies/${id}`, { method: "DELETE" }),
};

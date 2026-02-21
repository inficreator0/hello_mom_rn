export interface Comment {
  id: string | number;
  content: string;
  author: string;
  authorId?: number;
  authorUsername?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  postId: string | number;
  replies?: Comment[];
  parentId?: string | number | null;
  parentCommentId?: number | null;
  upvotes?: number;
  downvotes?: number;
  replyCount?: number;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  author: string;
  authorId?: number;
  authorUsername?: string;
  category: string;
  flair?: string;
  votes: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'up' | 'down' | null;
  bookmarked: boolean;
  comments: Comment[];
  commentCount?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface PostFormData {
  title: string;
  content: string;
  category: string[];
  flair: string[];
}

export type CommunityCategory =
  | "All"
  | "Pregnancy"
  | "Postpartum"
  | "Feeding"
  | "Sleep"
  | "Mental Health"
  | "Recovery"
  | "Milestones"
  | "Others";

export interface User {
  id: string | number;
  email: string;
  name: string;
  username?: string;
  userId?: number;
}

export interface PeriodEntry {
  id: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  cycleLength?: number; // days
  symptoms?: string[];
  fertilitySigns?: string[];
  healthMetrics?: string[];
  notes?: string;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'very_heavy';
  mood?: 'happy' | 'sad' | 'irritable' | 'anxious' | 'neutral';
  painLevel?: number; // 1-10 scale
  ovulationDate?: string; // ISO date string
  basalBodyTemp?: number; // in Fahrenheit
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  intercourseDays?: string[]; // dates for fertility tracking
  medications?: string[];
  supplements?: string[];
}

export interface CycleData {
  entries: PeriodEntry[];
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight: number; // in kg
  height?: number; // in cm
  headCircumference?: number; // in cm
  notes?: string;
}

export interface WeightData {
  entries: WeightEntry[];
  birthWeight?: number;
  birthHeight?: number;
  birthHeadCircumference?: number;
}

export type FlowLevel = 'light' | 'medium' | 'heavy' | 'spotting' | null;
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type PredictionType = 'next_period' | 'fertile_window' | 'ovulation';

export interface CycleDayLog {
  id?: number;
  userId?: number;
  logDate: string; // ISO date string
  flowLevel?: FlowLevel;
  painLevel?: number; // 0-10
  painLocations?: string[];
  moodTags?: string[];
  energyLevel?: number; // 1-5
  symptoms?: string[];
  bodySigns?: {
    cervical_mucus?: string;
    basal_temp?: number;
  };
  notes?: string;
  isEstimate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CyclePrediction {
  id: number;
  userId: number;
  predictionType: PredictionType;
  estimatedDate: string;
  estimatedEndDate?: string;
  confidenceLevel: ConfidenceLevel;
  basedOnCyclesCount: number;
  medicalDisclaimer: string;
}

export interface UserCycleSettings {
  userId: number;
  typicalCycleLength?: number;
  typicalPeriodLength?: number;
  trackingGoals: string[];
  enabledFeatures: {
    flow: boolean;
    pain: boolean;
    mood: boolean;
    energy: boolean;
    symptoms: boolean;
    body_signs: boolean;
  };
  customSymptoms: string[];
  customMoods: string[];
  showPredictions: boolean;
  showFertilityInfo: boolean;
  reminderEnabled: boolean;
  reminderTone: 'gentle' | 'normal' | 'loud';
  privacyMode: 'full' | 'standard' | 'minimal';
  medicalConditions: string[];
  hidePregnancyContent: boolean;
  gentleNotificationsOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  authorId: number;
  authorUsername: string;
  category: string;
  featuredImageUrl: string;
  viewCount: number;
  isPublished: boolean;
  publishedAt: string;
}

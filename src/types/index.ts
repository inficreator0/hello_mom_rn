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
  | "Milestones";

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
  notes?: string;
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

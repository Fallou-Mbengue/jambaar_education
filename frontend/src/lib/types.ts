export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type Role = 'USER' | 'COACH' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAIL';
export type PlanInterval = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
export type NotificationSegment = 'ALL' | 'PREMIUM' | 'NON_PREMIUM' | 'CHALLENGE_PARTICIPANTS' | 'CUSTOM';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string;
  gamificationProfile?: {
    xp: number;
    level: number;
    streak: number;
  };
}

export interface UserDetail extends User {
  suspendedAt: string | null;
  updatedAt: string;
  profile: {
    goal: string | null;
    levelEstimate: string | null;
    interests: string[];
    onboardingCompleted: boolean;
  } | null;
  gamificationProfile: {
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  } | null;
  userBadges: { badge: { id: string; name: string; description: string } }[];
  subscriptions: { id: string; status: SubscriptionStatus; startDate: string; endDate: string; plan: { name: string } }[];
  payments: { id: string; amount: number; currency: string; status: PaymentStatus; provider: string; createdAt: string }[];
  challengeProgress: { challengeId: string; currentDay: number; completedDays: number[]; challenge: { title: string } }[];
  quizAttempts: { id: string; score: number; total: number; createdAt: string; quiz: { title: string } }[];
  _count: { likes: number; saves: number; shareLogs: number };
}

export interface Content {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  skills: string[];
  level: ContentLevel;
  duration: number | null;
  status: ContentStatus;
  isPremium: boolean;
  coverKey: string | null;
  videoKey: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  title: string;
  description: string | null;
  coverKey: string | null;
  status: ContentStatus;
  isPremium: boolean;
  createdAt: string;
  modules: { id: string; order: number; module: { id: string; title: string } }[];
  _count?: { modules: number };
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  coverKey: string | null;
  status: ContentStatus;
  isPremium: boolean;
  createdAt: string;
  days?: { id: string; dayNumber: number; title: string; content: string | null; exercise: string | null; validationRule: string | null }[];
  _count?: { days: number; progress: number };
}

export interface Quiz {
  id: string;
  title: string;
  contentId: string | null;
  moduleId: string | null;
  status: ContentStatus;
  createdAt: string;
  content?: { id: string; title: string } | null;
  module?: { id: string; title: string } | null;
  questions?: { id: string; question: string; choices: string[]; correctAnswer: number; explanation: string | null; order: number }[];
  _count?: { questions: number; attempts: number };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: PlanInterval;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  _count?: { subscriptions: number };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  canceledAt: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  plan: { id: string; name: string; interval: PlanInterval; price: number };
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerReference: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  subscription?: { id: string; status: SubscriptionStatus } | null;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  diff: any;
  reason: string | null;
  ip: string | null;
  createdAt: string;
  actor: { id: string; email: string; firstName: string; lastName: string };
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  deepLink: string | null;
  segment: NotificationSegment;
  sentBy: string | null;
  createdAt: string;
  _count?: { targets: number };
}

export interface AnalyticsOverview {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    premium: number;
    conversionRate: number;
    activationRate: number;
  };
  content: { total: number; published: number };
  billing: { activeSubscriptions: number; totalRevenue: number };
  engagement: { completedChallenges: number; quizAttemptsThisMonth: number };
}

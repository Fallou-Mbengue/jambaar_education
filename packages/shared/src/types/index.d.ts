export interface AuthUser {
    id: string;
    email: string;
    role: 'USER' | 'COACH' | 'ADMIN';
    firstName: string;
    lastName: string;
    avatarKey?: string;
    onboardingDone: boolean;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    statusCode: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
}
export interface FeedItem {
    id: string;
    title: string;
    description?: string;
    type: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    durationSeconds?: number;
    tags: string[];
    isPremium: boolean;
    isLiked: boolean;
    isSaved: boolean;
    likeCount: number;
    saveCount: number;
    viewCount: number;
    score?: number;
}
export interface GamificationProfile {
    totalXp: number;
    currentLevel: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: string;
    badges: UserBadge[];
    xpToNextLevel: number;
}
export interface UserBadge {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    earnedAt: string;
}
export interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    deepLink?: string;
    isRead: boolean;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map
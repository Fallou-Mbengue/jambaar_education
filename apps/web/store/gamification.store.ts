'use client';
import { create } from 'zustand';

interface GamificationProfile {
  totalXp: number;
  currentLevel: string;
  currentStreak: number;
  longestStreak: number;
  xpToNextLevel: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    earnedAt: string;
  }>;
}

interface GamificationState {
  profile: GamificationProfile | null;
  pendingXp: number;
  showLevelUp: boolean;
  levelUpTo: string | null;
  setProfile: (profile: GamificationProfile) => void;
  addPendingXp: (xp: number) => void;
  clearPendingXp: () => void;
  triggerLevelUp: (level: string) => void;
  clearLevelUp: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  profile: null,
  pendingXp: 0,
  showLevelUp: false,
  levelUpTo: null,
  setProfile: (profile) => set({ profile }),
  addPendingXp: (xp) => set((state) => ({ pendingXp: state.pendingXp + xp })),
  clearPendingXp: () => set({ pendingXp: 0 }),
  triggerLevelUp: (level) => set({ showLevelUp: true, levelUpTo: level }),
  clearLevelUp: () => set({ showLevelUp: false, levelUpTo: null }),
}));

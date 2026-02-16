import { create } from 'zustand';

export interface RightPanelContent {
  contentId?: string;
  contentTitle?: string;
  contentType?: string;
  programId?: string;
  challengeId?: string;
  aiSummary?: string | null;
  isLoadingSummary?: boolean;
  progression?: {
    percent: number;
    label: string;
  } | null;
  nextContent?: {
    id: string;
    title: string;
    type: string;
    durationSeconds?: number | null;
  } | null;
  challengeDay?: {
    dayNumber: number;
    total: number;
    title: string;
    xpReward: number;
  } | null;
}

interface RightPanelState {
  content: RightPanelContent;
  isPanelOpen: boolean;
  setContent: (content: Partial<RightPanelContent>) => void;
  setAiSummary: (summary: string | null, loading?: boolean) => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
  content: {},
  isPanelOpen: true,

  setContent: (partial) =>
    set((state) => ({
      content: { ...state.content, ...partial },
    })),

  setAiSummary: (summary, loading = false) =>
    set((state) => ({
      content: {
        ...state.content,
        aiSummary: summary,
        isLoadingSummary: loading,
      },
    })),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  reset: () => set({ content: {} }),
}));

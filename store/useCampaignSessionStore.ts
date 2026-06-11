import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CampaignSessionState {
  sessionId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  farmerId: string | null;
  farmerName: string | null;
  currentStepOrder: number | null;
  totalSteps: number;
  completedCount: number;
  startSession: (params: {
    sessionId: string;
    campaignId: string;
    campaignName: string;
    farmerId?: string | null;
    farmerName?: string | null;
  }) => void;
  setProgress: (params: {
    currentStepOrder: number | null;
    totalSteps: number;
    completedCount: number;
  }) => void;
  clearSession: () => void;
}

const initial = {
  sessionId: null,
  campaignId: null,
  campaignName: null,
  farmerId: null,
  farmerName: null,
  currentStepOrder: null,
  totalSteps: 0,
  completedCount: 0,
};

export const useCampaignSessionStore = create<CampaignSessionState>()(
  persist(
    (set) => ({
      ...initial,
      startSession: ({ sessionId, campaignId, campaignName, farmerId, farmerName }) =>
        set({
          ...initial,
          sessionId,
          campaignId,
          campaignName,
          farmerId: farmerId ?? null,
          farmerName: farmerName ?? null,
        }),
      setProgress: ({ currentStepOrder, totalSteps, completedCount }) =>
        set({ currentStepOrder, totalSteps, completedCount }),
      clearSession: () => set(initial),
    }),
    {
      name: "sosagro.campaign-session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

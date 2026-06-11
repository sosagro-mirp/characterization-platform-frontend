import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type PreSurveyPhase = 'idle' | 's1_pending' | 's2_pending' | 'done';

interface CampaignSessionState {
  sessionId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  farmerId: string | null;
  farmerName: string | null;
  currentStepOrder: number | null;
  totalSteps: number;
  completedCount: number;
  preSurveyPhase: PreSurveyPhase;
  startSession: (params: {
    sessionId: string;
    campaignId: string;
    campaignName: string;
    farmerId?: string | null;
    farmerName?: string | null;
    skipPreSurvey?: boolean;
  }) => void;
  setProgress: (params: {
    currentStepOrder: number | null;
    totalSteps: number;
    completedCount: number;
  }) => void;
  setPreSurveyPhase: (phase: PreSurveyPhase) => void;
  setFarmer: (farmerId: string, farmerName: string | null) => void;
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
  preSurveyPhase: 'idle' as PreSurveyPhase,
};

export const useCampaignSessionStore = create<CampaignSessionState>()(
  persist(
    (set) => ({
      ...initial,
      startSession: ({ sessionId, campaignId, campaignName, farmerId, farmerName, skipPreSurvey }) =>
        set({
          ...initial,
          sessionId,
          campaignId,
          campaignName,
          farmerId: farmerId ?? null,
          farmerName: farmerName ?? null,
          preSurveyPhase: (farmerId || skipPreSurvey) ? 'done' : 'idle',
        }),
      setProgress: ({ currentStepOrder, totalSteps, completedCount }) =>
        set({ currentStepOrder, totalSteps, completedCount }),
      setPreSurveyPhase: (phase) =>
        set({ preSurveyPhase: phase }),
      setFarmer: (farmerId, farmerName) =>
        set({ farmerId, farmerName }),
      clearSession: () => set(initial),
    }),
    {
      name: "sosagro.campaign-session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

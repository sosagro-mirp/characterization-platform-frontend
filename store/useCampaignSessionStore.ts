import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { noopStorage } from "@/lib/noopStorage";

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
  /** Spec 78 — constancia de consentimiento otorgada en esta sesión, si aplicó. */
  consentRecordId: string | null;
  consentVersion: string | null;
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
  setPreSurveyPhase: (phase: PreSurveyPhase) => void;
  setFarmer: (farmerId: string, farmerName: string | null) => void;
  setConsent: (consentRecordId: string, consentVersion: string) => void;
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
  consentRecordId: null,
  consentVersion: null,
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
          preSurveyPhase: farmerId ? 'done' : 'idle',
        }),
      setProgress: ({ currentStepOrder, totalSteps, completedCount }) =>
        set({ currentStepOrder, totalSteps, completedCount }),
      setPreSurveyPhase: (phase) =>
        set({ preSurveyPhase: phase }),
      setFarmer: (farmerId, farmerName) =>
        set({ farmerId, farmerName }),
      setConsent: (consentRecordId, consentVersion) =>
        set({ consentRecordId, consentVersion }),
      clearSession: () => set(initial),
    }),
    {
      name: "sosagro.campaign-session",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage
      ),
    },
  ),
);

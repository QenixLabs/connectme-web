import { createStore } from 'zustand/vanilla';

export interface FeatureGateState {
  open: boolean;
  feature: string;
  plan?: string;
  title?: string;
  description?: string;
  showFeatureGate: (feature: string, plan?: string, title?: string, description?: string) => void;
  closeFeatureGate: () => void;
}

export const featureGateStore = createStore<FeatureGateState>()((set) => ({
  open: false,
  feature: '',
  plan: undefined,
  title: undefined,
  description: undefined,
  showFeatureGate: (feature, plan, title, description) =>
    set({ open: true, feature, plan, title, description }),
  closeFeatureGate: () => set({ open: false }),
}));

'use client';

import { useStore } from 'zustand/react';
import { useShallow } from 'zustand/react/shallow';
import { featureGateStore, FeatureGateState } from '@/stores/feature-gate-store';
import { FeatureGatePrompt } from '@/components/feature-gate-prompt';

export function FeatureGateProvider() {
  const { open, feature, plan, title, description, closeFeatureGate } = useStore(
    featureGateStore,
    useShallow((state: FeatureGateState) => ({
      open: state.open,
      feature: state.feature,
      plan: state.plan,
      title: state.title,
      description: state.description,
      closeFeatureGate: state.closeFeatureGate,
    })),
  );

  return (
    <FeatureGatePrompt
      open={open}
      onClose={closeFeatureGate}
      feature={feature}
      plan={plan}
      title={title}
      description={description}
    />
  );
}

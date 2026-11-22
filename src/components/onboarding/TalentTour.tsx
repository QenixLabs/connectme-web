"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import { talentApi } from "@/lib/api/talent";
import { useTalentProfile } from "@/hooks/use-talent-dashboard";
import { talentTourSteps } from "./talentTourSteps";
import { TALENT_TOUR_REPLAY_EVENT } from "./tour-events";

export { TALENT_TOUR_REPLAY_EVENT } from "./tour-events";

function isVisible(element: Element) {
  const node = element as HTMLElement;
  const style = window.getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
}

function visibleSteps() {
  return talentTourSteps.filter((step) => {
    if (typeof step.element !== "string") return false;
    if (Array.from(document.querySelectorAll(step.element)).some(isVisible)) return true;
    // The menu content is rendered by Radix only after its trigger is opened.
    return step.element === '[data-tour="profile-menu-content"]' &&
      Array.from(document.querySelectorAll('[data-tour="profile-menu"]')).some(isVisible);
  });
}

export function TalentTour({ hasCompletedOnboardingTour }: { hasCompletedOnboardingTour?: boolean }) {
  const { data: profile } = useTalentProfile();
  const tourCompleted = hasCompletedOnboardingTour ?? profile?.hasCompletedOnboardingTour;
  const startedRef = useRef(false);
  const persistOnDestroyRef = useRef(true);

  const startTour = useCallback((persistOnDestroy: boolean) => {
    const steps = visibleSteps();
    if (steps.length === 0) return;

    persistOnDestroyRef.current = persistOnDestroy;
    const tour = driver({
      steps,
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      onDestroyed: () => {
        if (persistOnDestroyRef.current) {
          void talentApi.completeOnboardingTour();
        }
      },
    });
    tour.drive();
  }, []);

  useEffect(() => {
    if (tourCompleted !== false || startedRef.current) return;
    startedRef.current = true;
    const timer = window.setTimeout(() => startTour(true), 150);
    return () => window.clearTimeout(timer);
  }, [tourCompleted, startTour]);

  useEffect(() => {
    const handleReplay = () => startTour(false);
    window.addEventListener(TALENT_TOUR_REPLAY_EVENT, handleReplay);
    return () => window.removeEventListener(TALENT_TOUR_REPLAY_EVENT, handleReplay);
  }, [startTour]);

  return null;
}

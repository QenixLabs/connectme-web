"use client";

import type { DriveStep } from "driver.js";
import { driver } from "driver.js";
import { useCallback, useEffect, useRef } from "react";

type RoleTourProps = {
  role: "recruiter" | "provider";
  steps: DriveStep[];
  replayEvent: string;
};

function isVisible(element: Element) {
  const node = element as HTMLElement;
  const style = window.getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
}

function visibleSteps(steps: DriveStep[], menuSelector: string, menuContentSelector: string) {
  return steps.filter((step) => {
    if (typeof step.element !== "string") return false;
    if (Array.from(document.querySelectorAll(step.element)).some(isVisible)) return true;
    return step.element === menuContentSelector &&
      Array.from(document.querySelectorAll(menuSelector)).some(isVisible);
  });
}

export function RoleTour({ role, steps, replayEvent }: RoleTourProps) {
  const startedRef = useRef(false);
  const storageKey = `morporfiil:${role}-tour-completed`;
  const menuSelector = `[data-tour="${role}-profile-menu"]`;
  const menuContentSelector = `[data-tour="${role}-profile-menu-content"]`;

  const startTour = useCallback((persist: boolean) => {
    const tourSteps = visibleSteps(steps, menuSelector, menuContentSelector);
    if (tourSteps.length === 0) return;

    const tour = driver({
      steps: tourSteps,
      showProgress: true,
      animate: true,
      duration: 320,
      smoothScroll: true,
      stagePadding: 12,
      stageRadius: 16,
      popoverOffset: 16,
      popoverClass: `morporfiil-tour-popover morporfiil-tour-popover--${role}`,
      overlayOpacity: 0.78,
      allowClose: true,
      allowScroll: true,
      closeBtnLabel: "Close tour",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      onDestroyed: () => {
        if (persist) window.localStorage.setItem(storageKey, "true");
      },
    });
    tour.drive();
  }, [menuContentSelector, menuSelector, role, steps, storageKey]);

  useEffect(() => {
    if (window.location.pathname !== `/${role}/dashboard` || startedRef.current) return;
    if (window.localStorage.getItem(storageKey) === "true") return;
    startedRef.current = true;
    const timer = window.setTimeout(() => startTour(true), 200);
    return () => window.clearTimeout(timer);
  }, [role, startTour, storageKey]);

  useEffect(() => {
    const handleReplay = () => startTour(false);
    window.addEventListener(replayEvent, handleReplay);
    return () => window.removeEventListener(replayEvent, handleReplay);
  }, [replayEvent, startTour]);

  return null;
}

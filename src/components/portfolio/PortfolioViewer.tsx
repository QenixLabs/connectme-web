"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioViewerItem } from "./PortfolioViewerItem";
import { ViewerTopBar } from "./ViewerTopBar";
import { ViewerBottomBar } from "./ViewerBottomBar";

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 0.5;
const ANIMATION_DURATION = 350;

type Direction = -1 | 0 | 1;

export function PortfolioViewer({
  items,
  initialIndex,
  open,
  onClose,
}: {
  items: PortfolioItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [direction, setDirection] = useState<Direction>(0);
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isAnimating = useRef(false);
  const touchStart = useRef({ y: 0, time: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setCurrentIndex(initialIndex));
  }, [initialIndex]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  }, []);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setControlsVisible(true);
        hideTimer.current = setTimeout(() => setControlsVisible(false), 4000);
      });
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [open, currentIndex]);

  const goTo = useCallback(
    (dir: Direction) => {
      if (isAnimating.current) return;
      const next = currentIndex + dir;
      if (next < 0 || next >= items.length) return;

      isAnimating.current = true;
      setDirection(dir);
      setCurrentIndex(next);

      setTimeout(() => {
        isAnimating.current = false;
        setDirection(0);
        setOffset(0);
      }, ANIMATION_DURATION);
    },
    [currentIndex, items.length],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStart.current = { y: e.touches[0].clientY, time: Date.now() };
      resetHideTimer();
    },
    [resetHideTimer],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      const deltaY = e.touches[0].clientY - touchStart.current.y;
      const maxOff = window.innerHeight;
      const clamped = Math.max(-maxOff, Math.min(maxOff, deltaY));
      setOffset(clamped);
    },
    [],
  );

  const handleTouchEnd = useCallback(
    () => {
      const deltaY = offset;
      const deltaTime = Date.now() - touchStart.current.time;
      const velocity = Math.abs(deltaY) / deltaTime;

      if (Math.abs(deltaY) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
        if (deltaY < 0 && Math.abs(deltaY) > SWIPE_THRESHOLD) {
          goTo(1);
        } else if (deltaY > 0 && Math.abs(deltaY) > SWIPE_THRESHOLD) {
          goTo(-1);
        } else {
          setOffset(0);
        }
      } else {
        setOffset(0);
      }
    },
    [offset, goTo],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          goTo(1);
          break;
        case "ArrowDown":
          e.preventDefault();
          goTo(-1);
          break;
        case "Escape":
          onClose();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goTo, onClose]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isAnimating.current) return;
      if (e.deltaY > 30) {
        goTo(1);
      } else if (e.deltaY < -30) {
        goTo(-1);
      }
    },
    [goTo],
  );

  const toggleControls = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible((v) => !v);
    if (controlsVisible === false) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 4000);
    }
  }, [controlsVisible]);

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const viewIndices = [
    currentIndex - 1,
    currentIndex,
    currentIndex + 1,
  ].filter((i) => i >= 0 && i < items.length);

  const getTranslateY = (idx: number) => {
    if (direction === 0 && offset !== 0) {
      if (idx === currentIndex) return offset;
      if (idx === currentIndex + 1) return window.innerHeight + offset;
      if (idx === currentIndex - 1) return -window.innerHeight + offset;
    }
    if (idx < currentIndex) return "-100%";
    if (idx > currentIndex) return "100%";
    return "0%";
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={toggleControls}
        >
          {viewIndices.map((idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{
                y:
                  direction !== 0
                    ? idx === currentIndex
                      ? "0%"
                      : idx < currentIndex
                        ? "-100%"
                        : "100%"
                    : getTranslateY(idx),
              }}
              transition={
                direction !== 0
                  ? { type: "spring", stiffness: 300, damping: 32, duration: ANIMATION_DURATION / 1000 }
                  : offset !== 0
                    ? { duration: 0 }
                    : { duration: 0 }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <PortfolioViewerItem
                item={items[idx]}
                active={idx === currentIndex}
                preload={idx === currentIndex - 1 || idx === currentIndex + 1}
              />
            </motion.div>
          ))}

          <ViewerTopBar
            title={currentItem.title}
            current={currentIndex + 1}
            total={items.length}
            visible={controlsVisible}
            onClose={onClose}
          />

          <ViewerBottomBar
            item={currentItem}
            visible={controlsVisible}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

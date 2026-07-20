import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

interface NavItem {
  href: string;
  label: string;
}

function isInsideHorizontalScrollable(target: EventTarget): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const ox = style.overflowX;
    if ((ox === "auto" || ox === "scroll" || ox === "overlay") && el.scrollWidth > el.clientWidth) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function useSwipeNavigation(navItems: NavItem[], currentPath: string) {
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - touchStart.current.x;
      const deltaY = endY - touchStart.current.y;
      touchStart.current = null;

      // Ignore vertical swipes
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      const threshold = 60;
      if (Math.abs(deltaX) < threshold) return;

      // Don't navigate if touch started inside a horizontally scrollable element
      if (isInsideHorizontalScrollable(e.target)) return;

      // Find current nav index (exact match or sub-path)
      const currentIndex = navItems.findIndex(
        (item) =>
          currentPath === item.href ||
          currentPath.startsWith(item.href + "/")
      );
      if (currentIndex === -1) return;

      let nextIndex: number;
      if (deltaX < 0) {
        // Swipe left → next
        nextIndex = Math.min(currentIndex + 1, navItems.length - 1);
      } else {
        // Swipe right → prev
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      if (nextIndex !== currentIndex) {
        router.push(navItems[nextIndex].href);
      }
    },
    [navItems, currentPath, router]
  );

  return { handleTouchStart, handleTouchEnd };
}

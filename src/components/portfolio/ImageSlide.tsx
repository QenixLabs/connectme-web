"use client";

import { useCallback, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_THRESHOLD = 300;

export function ImageSlide({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const pinchRef = useRef<{ dist: number; scale: number; x: number; y: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  const clampPosition = useCallback(
    (x: number, y: number) => {
      if (scale <= 1) return { x: 0, y: 0 };
      const maxX = ((scale - 1) * window.innerWidth) / 2;
      const maxY = ((scale - 1) * window.innerHeight) / 2;
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [scale],
  );

  const handleDoubleTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const now = Date.now();
      lastTapRef.current = now;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;

      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        const newScale = 2;
        const originX = clientX - rect.left - rect.width / 2;
        const originY = clientY - rect.top - rect.height / 2;
        setScale(newScale);
        setPosition(
          clampPosition(-originX * (newScale - 1), -originY * (newScale - 1)),
        );
      }
    },
    [scale, clampPosition],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = {
          dist: Math.hypot(dx, dy),
          scale,
          x: position.x,
          y: position.y,
        };
      } else if (e.touches.length === 1 && scale > 1) {
        panRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          posX: position.x,
          posY: position.y,
        };
      }
    },
    [scale, position],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchRef.current.scale * (dist / pinchRef.current.dist)));
        const ratio = newScale / pinchRef.current.scale - 1;
        setScale(newScale);
        setPosition(
          clampPosition(
            pinchRef.current.x - (pinchRef.current.x * ratio),
            pinchRef.current.y - (pinchRef.current.y * ratio),
          ),
        );
      } else if (e.touches.length === 1 && panRef.current && scale > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panRef.current.startX;
        const dy = e.touches[0].clientY - panRef.current.startY;
        setPosition(
          clampPosition(panRef.current.posX + dx, panRef.current.posY + dy),
        );
      }
    },
    [scale, clampPosition],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD && e.touches.length === 0) {
        // handled by onTouchStart tap detection below
      }
      pinchRef.current = null;
      panRef.current = null;
      if (scale < 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    },
    [scale],
  );

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
        handleDoubleTap(e);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    },
    [handleDoubleTap],
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-h-full max-w-full select-none object-contain"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: scale === 1 ? "transform 0.3s ease-out" : "none",
        }}
      />
    </div>
  );
}

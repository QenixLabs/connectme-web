"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  easeOut,
} from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 0.9,
  formatter = (n) => Math.round(n).toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, (n) => formatter(n));

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: easeOut,
    });
    return () => controls.stop();
  }, [value, duration, reducedMotion, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}

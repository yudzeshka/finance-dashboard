import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";

// Durations
export const durationEnter = 0.22;
export const durationExit = 0.14;

// Timing
export const easeOut: number[] = [0.16, 1, 0.3, 1];

// Springs
export const spring = { stiffness: 120, damping: 18 };
export const springSnappy = { stiffness: 300, damping: 24 };

// Default hidden/visible variants for staggered animations
const hiddenDefault = { opacity: 0, y: 16 };
const visibleDefault = { opacity: 1, y: 0 };

export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  return useMemo(
    () => ({
      // If reduced motion is preferred, skip animations
      hidden: prefersReduced ? visibleDefault : hiddenDefault,
      visible: visibleDefault,
      spring: prefersReduced ? { stiffness: 0, damping: 0 } : spring,
      springSnappy: prefersReduced ? { stiffness: 0, damping: 0 } : springSnappy,
      durationEnter: prefersReduced ? 0 : durationEnter,
      durationExit: prefersReduced ? 0 : durationExit,
      easeOut: prefersReduced ? [0, 0, 1, 1] : easeOut,
      prefersReduced,
      // For count-up: if reduced, duration = 0 (instant)
      countUpDuration: prefersReduced ? 0 : 1.2,
      // For stagger
      staggerChildren: prefersReduced ? 0 : 0.05,
      delayChildren: prefersReduced ? 0 : 0.1,
      // For table row stagger
      rowStagger: prefersReduced ? 0 : 0.03,
      // For aurora orb animation: reduced = no animation
      orbDuration: prefersReduced ? 0 : 8,
      // For delta line delay
      deltaDelay: prefersReduced ? 0 : 0.8,
      // For hero card entrance
      heroEnterDuration: prefersReduced ? 0 : 0.3,
      heroEnterDelay: prefersReduced ? 0 : 0.05,
      heroEnterY: prefersReduced ? 0 : 12,

      // Scroll reveal — for charts in bento
      scrollRevealHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
      scrollRevealVisible: { opacity: 1, y: 0 },
      scrollRevealDuration: prefersReduced ? 0 : 0.35,
      scrollRevealViewport: { once: true, margin: "-40px" } as const,

      // Tab panel transition
      tabPanelHidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
      tabPanelVisible: { opacity: 1, y: 0 },
      tabPanelExit: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 },
    }),
    [prefersReduced],
  );
}

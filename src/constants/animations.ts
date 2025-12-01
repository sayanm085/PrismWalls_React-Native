/**
 * Animation Configuration
 * Tuned for premium Apple/Pinterest feel
 */
export const ANIM = {
  STAGGER: 40,
  DURATION: 350,
  SPRING: {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  },
  PRESS_SPRING: {
    damping: 20,
    stiffness: 300,
  },
  ENTRANCE: {
    opacity: { from: 0, to: 1 },
    translateY: { from: 30, to: 0 },
    scale: { from: 0.95, to: 1 },
  },
} as const;
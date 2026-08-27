import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0 },
};

export const viewportOnce = { once: true, amount: 0.2 } as const;

export function revealTransition(delay = 0, duration = 0.6) {
  return { duration, delay, ease: [0.22, 1, 0.36, 1] as const };
}

import { useSyncExternalStore } from "react";

/**
 * Viewport module: the single place that decides which layout tier the page
 * is in. Thresholds match the historical hard-coded values (<=768 phone,
 * >1024 desktop). CSS should mirror these via the same numbers.
 */
export const BREAKPOINTS = { phone: 768, desktop: 1024 } as const;

export type Tier = "phone" | "tablet" | "desktop";

export function tierFor(width: number): Tier {
  if (width <= BREAKPOINTS.phone) return "phone";
  if (width > BREAKPOINTS.desktop) return "desktop";
  return "tablet";
}

const width = () => (typeof window === "undefined" ? 1280 : window.innerWidth);

/** Non-reactive read for imperative code (GSAP timelines, rAF loops). */
export const getTier = (): Tier => tierFor(width());
export const isPhone = () => getTier() === "phone";
export const isDesktop = () => getTier() === "desktop";
export const getWidth = width;

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

/** Reactive tier; only re-renders when the tier actually changes. */
export function useTier(): Tier {
  return useSyncExternalStore(subscribe, getTier, () => "desktop" as Tier);
}

export function useViewport() {
  const tier = useTier();
  return { tier, isPhone: tier === "phone", isDesktop: tier === "desktop" };
}

export const motionTokens = {
  duration: { immediate: "0ms", fast: "120ms", standard: "200ms", deliberate: "320ms" },
  easing: { standard: "ease", enter: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  reducedMotionRule: "Disable nonessential transforms and transitions when prefers-reduced-motion is reduce."
} as const;

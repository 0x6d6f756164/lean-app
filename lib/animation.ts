export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Value between `from` and `to` for a progress of 0..1, with easing and no overshoot. */
export const tween = (from: number, to: number, progress: number) =>
  from + (to - from) * easeOutCubic(progress);
import { sineInOut } from 'svelte/easing';
import type { EasingFunction } from 'svelte/transition';

export function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function map(
  current: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number,
): number {
  const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}

export default function fadeScale(
  node: Element,
  {
    delay = 0,
    duration = 200,
    easing = sineInOut,
  }: {
    delay: number;
    duration: number;
    easing: EasingFunction;
  },
) {
  const opacity = +getComputedStyle(node).opacity;

  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = easing(t);
      return `opacity: ${eased * opacity}; transform-origin: 100% -1rem; transform: scale(${map(
        eased,
        0,
        1,
        0.9,
        1,
      )});`;
    },
  };
}

import { browser } from '$app/environment';
import storedWritable from '@efstajas/svelte-stored-writable';
import { derived, readable } from 'svelte/store';
import { z } from 'zod';

export type AnimationsSetting = 'auto' | 'on' | 'off';

const storedAnimationsSchema = z.union([z.literal('auto'), z.literal('on'), z.literal('off')]);

export default (() => {
  const prefersReducedMotionQuery =
    browser && window.matchMedia('(prefers-reduced-motion: reduce)');

  const prefersReducedMotion = readable(false, (set) => {
    if (!browser || !prefersReducedMotionQuery) return;

    set(prefersReducedMotionQuery.matches);

    const handler = (e: MediaQueryListEvent) => set(e.matches);
    prefersReducedMotionQuery.addEventListener('change', handler);
    return () => prefersReducedMotionQuery.removeEventListener('change', handler);
  });

  const selectedSetting = storedWritable(
    'animations-setting',
    storedAnimationsSchema,
    'auto',
    !browser,
  );

  const isEnabled = derived(
    [selectedSetting, prefersReducedMotion],
    ([$selectedSetting, $prefersReducedMotion]) => {
      if ($selectedSetting === 'on') return true;
      if ($selectedSetting === 'off') return false;
      // auto
      return !$prefersReducedMotion;
    },
  );

  return {
    selectedSetting,
    isEnabled,
  };
})();

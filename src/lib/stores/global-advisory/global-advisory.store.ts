import { get, writable } from 'svelte/store';
import assert from '$lib/utils/assert';

interface ButtonConfig {
  label: string;
  handler: () => void;
}

export interface NonFatalGlobalAdvisory {
  headline: string;
  description?: string;
  emoji: string;
  button?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  learnMoreLink?: {
    label: string;
    url: string;
  };
  fatal: false;
}

export interface FatalGlobalAdvisory {
  headline: string;
  description?: string;
  fatal: true;
}

type GlobalAdvisory = NonFatalGlobalAdvisory | FatalGlobalAdvisory;

export default (() => {
  const errors = writable<{ [handle: number]: GlobalAdvisory }>({});

  /**
   * Append a new advisory to the global advisory stack, which will be displayed
   * in a blocking mannger on top of everything else.
   * @param advisory The advisory to display.
   * @returns A function you can call in order to resolve the created advisory.
   */
  function add(advisory: GlobalAdvisory | ((resolveFn: () => void) => GlobalAdvisory)) {
    const handle = Object.keys(get(errors)).length;
    const resolvedAdvisory =
      typeof advisory === 'function' ? advisory(() => resolve(handle)) : advisory;

    errors.update((state) => ({ ...state, [handle]: resolvedAdvisory }));

    return () => resolve(handle);
  }

  /**
   * Resolve an advisory by its handle.
   * @param handle The handle of the advisory to resolve.
   */
  function resolve(handle: number) {
    const state = get(errors);
    assert(state[handle], 'Unable to find error with this handle');

    delete state[handle];

    errors.set(state);
  }

  /** Clear all current advisories. */
  function clear() {
    errors.set({});
  }

  type GetErrorsReturnType<T> = T extends 'fatal'
    ? FatalGlobalAdvisory | undefined
    : T extends 'non-fatal'
    ? NonFatalGlobalAdvisory[]
    : never;

  /**
   * Get either the current fatal advisory, or array of non-fatal advisories.
   * @param type 'fatal' to get the current fatal advisory, if any, and 'non-fatal' to get an array of
   * current non-fatal advisories.
   * @returns Either a FatalAdvisory or array of NonFatalAdvisory payloads.
   */
  function getAdvisories<T extends 'fatal' | 'non-fatal'>(type: T): GetErrorsReturnType<T> {
    return type === 'fatal'
      ? (Object.values(get(errors)).find((error) => error.fatal === true) as GetErrorsReturnType<T>)
      : (Object.values(get(errors)) as NonFatalGlobalAdvisory[] as GetErrorsReturnType<T>);
  }

  return {
    subscribe: errors.subscribe,
    add,
    resolve,
    clear,
    getAdvisories,
  };
})();

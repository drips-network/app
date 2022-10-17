import type { SvelteComponent, SvelteComponentTyped } from 'svelte';

export interface AwaitPendingPayload {
  message: string;
  promise: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type StepComponentEvents = {
  goForward: never;
  goBackward: never;
  await: AwaitPendingPayload;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? P : never;
export type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

export type Step<T extends SvelteComponent> = {
  component: Constructor<T>;
  props: PropsOrUndefined<T>;
};

type SomeStep = <R>(step: <T extends SvelteComponent>(step: Step<T>) => R) => R;

export type Steps = SomeStep[];

export function makeStep<T extends SvelteComponent>(i: Step<T>): SomeStep {
  return (cb) => cb(i);
}

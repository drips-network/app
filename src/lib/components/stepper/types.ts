import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
import type { Writable } from 'svelte/store';

export interface UpdateAwaitStepParams {
  message?: string;
  link?: {
    url: string;
    label: string;
  };
  icon?: {
    component: typeof SvelteComponent;
    props: Record<string, unknown>;
  };
}

export type UpdateAwaitStepFn = (params: UpdateAwaitStepParams) => void;

export interface AwaitPendingPayload extends UpdateAwaitStepParams {
  message: string;
  promise: (updateFn: UpdateAwaitStepFn) => Promise<void>;
}

export interface MovePayload {
  by?: number;
}

export interface SetStepsPayload {
  context?: Writable<unknown>;
  steps: Steps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type StepComponentEvents = {
  goForward: MovePayload;
  goBackward: MovePayload;
  await: AwaitPendingPayload;
  setSteps: SetStepsPayload;
};

type OmitContext<T> = Omit<T, 'context'>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? OmitContext<P> : never;
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

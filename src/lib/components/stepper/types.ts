import type { SvelteComponent, SvelteComponentTyped } from 'svelte';

export interface UpdateAwaitStepParams {
  message?: string;
  subtitle?: string;
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
  /**
   * The promise to await. `updateFn` may be used to adjust the icon
   * and text displayed on the await step before the promise resolves.
   */
  promise: (updateFn: UpdateAwaitStepFn) => Promise<unknown>;
}

export interface MovePayload {
  by?: number;
}

export interface SidestepPayload {
  steps: Steps;
  onSidestepComplete?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type StepComponentEvents = {
  /** Go forward one step (or a custom amount by setting `by`). */
  goForward: MovePayload;
  /** Go backward one step (or a custom amount by setting `by`). */
  goBackward: MovePayload;
  /**
   * Await a promise while displaying a customizable spinner dialog.
   * Once the passed promise is resolved, advances in the flow. If
   * the promise rejects, displays a rich error message step, with
   * the ability to jump back to the step that triggered the await.
   */
  await: AwaitPendingPayload;
  /**
   * Temporarily append a secondary flow after the current step, and
   * navigate to the first step in the sidestep. Once the sidestep flow
   * triggers `conclude`, go back to the original step in the original flow.
   */
  sidestep: SidestepPayload;
  /**
   * Conclude a flow. Either goes back to the original flow if a sidestep
   * is currently active, or closes the stepper modal.
   */
  conclude: undefined;
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

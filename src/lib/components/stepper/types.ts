import type { SendTransactionsResponse } from '@safe-global/safe-apps-sdk';
import type { TypedDataDomain } from 'ethers';
import type { TypedDataField } from 'ethers';
import type { TransactionLike } from 'ethers';
import type { TransactionReceipt } from 'ethers';
import type { ComponentType, SvelteComponent } from 'svelte';

export type TransactionWrapper = {
  title: string;
  transaction: TransactionLike;
  gasless?: {
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
  } | undefined; // if passing domain and types, will attempt to relay TX gaslessly
  applyGasBuffer: boolean;
};

/**
 * Use this to display transactions that are handled off-chain (e.g. through Gelato Relay) but have to be awaited
 * as part of a multi-transaction interaction.
 */
export type ExternalTransaction = {
  title: string;
  external: true;
  expectedDurationMs: number;
  expectedDurationText: string;
  /** When this resolves, moves on to next transaction */
  promise: () => Promise<void>;
};

export type TransactionWrapperOrExternalTransaction = TransactionWrapper | ExternalTransaction;

export interface TransactPayload<T> {
  before?: T;
  transactions: (
    context: Context<T>,
  ) =>
    | TransactionWrapperOrExternalTransaction[]
    | Promise<TransactionWrapperOrExternalTransaction[]>;
  after?: (receipts: TransactionReceipt[], context: Context<T>) => PromiseLike<void>;
  afterSafe?: (
    sendTransactionsResponse: SendTransactionsResponse,
    context: Context<T>,
  ) => PromiseLike<void>;
  headline: string;
  description?: string;
  icon?: {
    component: ComponentType;
    props?: Record<string, unknown>;
  };
  messages?: {
    duringBefore?: string;
    duringAfter?: string;
  };
}

export type SomeTransactPayload = <R>(
  payload: <T extends BeforeFunc | undefined>(transactPayload: TransactPayload<T>) => R,
) => R;

export type BeforeFunc = () => PromiseLike<Record<string, unknown> | void>;

type Context<T> = T extends BeforeFunc ? Awaited<ReturnType<T>> : undefined;

export function makeTransactPayload<T extends BeforeFunc | undefined>(
  i: TransactPayload<T>,
): SomeTransactPayload {
  return (cb) => cb(i);
}

export interface UpdateAwaitStepParams {
  message?: string;
  subtitle?: string;
  link?: {
    url: string;
    label: string;
  };
  icon?: {
    component: ComponentType;
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
  by: number;
}

export interface SidestepPayload {
  steps: Steps;
  onSidestepComplete?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type StepComponentEvents = {
  /** Go forward one step (or a custom amount by setting `by`). */
  goForward: MovePayload | void;
  /** Go backward one step (or a custom amount by setting `by`). */
  goBackward: MovePayload | void;
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
  conclude: void;
  // TODO: add description.
  transact: SomeTransactPayload;
};

type OmitContext<T> = Omit<T, 'context'>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props<T> = T extends SvelteComponent<infer P, any, any> ? OmitContext<P> : never;
export type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

export type Step<T extends SvelteComponent> = {
  condition?: () => boolean;
  component: Constructor<T>;
  props: PropsOrUndefined<T>;
};

type SomeStep = <R>(step: <T extends SvelteComponent>(step: Step<T>) => R) => R;

export type Steps = SomeStep[];

export function makeStep<T extends SvelteComponent>(i: Step<T>): SomeStep {
  return (cb) => cb(i);
}

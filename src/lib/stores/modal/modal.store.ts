import { derived, get, writable } from 'svelte/store';
import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
import scroll from '../scroll';

type OnHide = () => void;

type ModalLayout = {
  modalComponent: typeof SvelteComponent;
  onHide: OnHide;
  modalComponentProps: { [key: string]: unknown };
};

const overlayStore = writable<ModalLayout | null>(null);

const hideable = writable<boolean>(true);
const focusTrapped = writable<boolean>(true);

export const store = derived(
  [overlayStore, hideable, focusTrapped],
  ([$overlayStore, $hideableStore, $focusTrappedStore]) => ({
    overlay: $overlayStore,
    hideable: $hideableStore,
    focusTrapped: $focusTrappedStore,
  }),
);

const doNothing = (): void => {
  null;
};

/**
 * Hide the currently-displayed modal.
 */
export const hide = (): void => {
  scroll.unlock();

  const canHide = get(hideable);

  if (!canHide) {
    return;
  }

  const stored = get(store);
  if (stored === null) {
    return;
  }

  stored.overlay && stored.overlay.onHide();
  overlayStore.set(null);

  window.onbeforeunload = null;
};

/**
 * If value is true, the modal can be closed by the user either by clicking
 * the X icon in the top right, or the modal background. If false, the X button
 * is hidden and clicking on the background doesn't exit the modal.
 * @param value The value to set hideable to.
 */
export const setHideable = (value: boolean): void => {
  hideable.set(value);
};

/**
 * If value is true, the modal component will trap keyboard focus in itself and
 * auto-select its first selectable child. Setting to false removes any already-set
 * trap, but will not restore focus to the previously-selected element.
 * @param value True to enable focus trap, false to disable.
 */
export const setFocusTrapped = (value: boolean): void => {
  focusTrapped.set(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? P : never;
export type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

/**
 * Display a modal with the given component.
 * @param modalComponent The component to display in the modal.
 * @param onHide An optional function that gets triggered when the modal is closed.
 * @param modalComponentProps Props for the modal component.
 */
export const show = <T extends SvelteComponent>(
  modalComponent: Constructor<T>,
  onHide: OnHide = doNothing,
  modalComponentProps: Props<T>,
): void => {
  scroll.lock();
  overlayStore.set({ modalComponent, onHide, modalComponentProps });

  window.onbeforeunload = () => true;
};

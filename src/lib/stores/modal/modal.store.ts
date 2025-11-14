import { derived, get, writable } from 'svelte/store';
import type { Component, ComponentProps } from 'svelte';
import scroll from '../scroll';
import { browser } from '$app/environment';

type OnHide = () => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalLayout<T extends Component<any>> = {
  modalComponent: T;
  onHide: OnHide;
  modalComponentProps: ComponentProps<T>;
};

const overlayStore = writable<ModalLayout<Component> | null>(null);

const hideable = writable<boolean>(true);
const focusTrapped = writable<boolean>(true);
const warnOnNavigate = writable<boolean>(false);

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
  // restore focus trap setting
  setFocusTrapped(true);
};

/**
 * If value is true, the modal can be closed by the user either by clicking
 * the X icon in the top right, or the modal background. If false, the X button
 * is hidden and clicking on the background doesnʼt exit the modal.
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

/**
 * If value is true, navigating away from the current page will trigger a native browser warning dialog.
 * @param value The value to set warnOnNavigate to.
 */
export const setWarnOnNavigate = (value: boolean): void => {
  warnOnNavigate.set(value);
};

warnOnNavigate.subscribe((value) => {
  if (!browser) return;

  if (value) {
    window.onbeforeunload = () => true;
  } else {
    window.onbeforeunload = null;
  }
});

/**
 * Display a modal with the given component.
 * @param modalComponent The component to display in the modal.
 * @param onHide An optional function that gets triggered when the modal is closed.
 * @param modalComponentProps Props for the modal component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const show = <T extends Component<any>>(
  modalComponent: T,
  onHide: OnHide = doNothing,
  modalComponentProps: ComponentProps<T>,
  warnOnNavigate = true,
): void => {
  scroll.lock();
  overlayStore.set({ modalComponent, onHide, modalComponentProps });
  setWarnOnNavigate(warnOnNavigate);
};

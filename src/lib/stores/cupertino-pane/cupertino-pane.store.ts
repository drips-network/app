import * as CupertinoPane from 'cupertino-pane';

import type { ComponentType, SvelteComponentTyped } from 'svelte';
import { get, writable } from 'svelte/store';

import scroll from '$lib/stores/scroll';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? P : never;
export type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

interface CupertinoSheetStore {
  component?: ComponentType;
  props?: { [key: string]: unknown };
}

export default (() => {
  const store = writable<CupertinoSheetStore>({});
  const pane = writable<CupertinoPane.CupertinoPane>();

  function attach() {
    pane.set(
      new CupertinoPane.CupertinoPane('#cupertino-pane', {
        backdrop: true,
        fastSwipeClose: true,
        buttonDestroy: false,
        bottomClose: true,
        showDraggable: false,
        fitHeight: true,
      }),
    );

    _setListeners();
  }

  function detach() {
    get(pane).destroy();
  }

  function openSheet<T extends ComponentType>(component: T, props: PropsOrUndefined<T>): void {
    const p = get(pane);

    if (!p) {
      throw 'Pane not initialized';
    }

    store.set({ component, props });
    p.present({ animate: true });

    scroll.lock();
  }

  function closeSheet() {
    const p = get(pane);

    p.destroy({ animate: true });

    scroll.unlock();
    store.set({});
  }

  function _setListeners() {
    const p = get(pane);

    p.on('onDidDismiss', () => {
      scroll.unlock();
      store.set({});
    });

    p.on('onBackdropTap', () => {
      closeSheet();
    });
  }

  return {
    subscribe: store.subscribe,
    attach,
    detach,
    openSheet,
    closeSheet,
  };
})();

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as CupertinoPane from 'cupertino-pane';

import type { Component, ComponentProps } from 'svelte';
import { get, writable } from 'svelte/store';

import scroll from '$lib/stores/scroll';

interface CupertinoSheetStore<T extends Component> {
  component?: T;
  props?: ComponentProps<T>;
}

export default (() => {
  const store = writable<CupertinoSheetStore<Component>>({});
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

  function openSheet<CT extends Component<any>>(component: CT, props?: ComponentProps<CT>): void {
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

  function reCalcHeight() {
    get(pane).calcFitHeight();
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
    reCalcHeight,
  };
})();

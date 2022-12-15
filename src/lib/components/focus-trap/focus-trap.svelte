<!--
  Adjusted from `svelte-headlessui`: https://github.com/rgossiaux/svelte-headlessui/blob/master/src/lib/components/focus-trap/FocusTrap.svelte
-->
<script lang="ts">
  import { focusIn, Focus, FocusResult } from './methods/focus';
  import { onMount, onDestroy, tick } from 'svelte';

  enum Keys {
    Space = ' ',
    Enter = 'Enter',
    Escape = 'Escape',
    Backspace = 'Backspace',

    ArrowLeft = 'ArrowLeft',
    ArrowUp = 'ArrowUp',
    ArrowRight = 'ArrowRight',
    ArrowDown = 'ArrowDown',

    Home = 'Home',
    End = 'End',

    PageUp = 'PageUp',
    PageDown = 'PageDown',

    Tab = 'Tab',
  }

  export let containers: Set<HTMLElement>;
  export let enabled = true;
  export let options: { initialFocus?: HTMLElement | null } = {};

  let restoreElement: HTMLElement | null =
    typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null;

  let previousActiveElement: HTMLElement | null = null;

  function contains(containers: Set<HTMLElement>, element: HTMLElement) {
    for (let container of containers) {
      if (container.contains(element)) return true;
    }

    return false;
  }

  function focusElement(element: HTMLElement | null) {
    element?.focus({ preventScroll: true });
  }

  async function handleFocus() {
    if (!enabled) return;
    if (containers.size !== 1) return;
    let { initialFocus } = options;

    await tick();
    let activeElement = document.activeElement as HTMLElement;

    if (initialFocus) {
      if (initialFocus === activeElement) {
        return; // Initial focus ref is already the active element
      }
    } else if (contains(containers, activeElement)) {
      return; // Already focused within Dialog
    }

    restoreElement = activeElement;

    // Try to focus the initialFocus ref
    if (initialFocus) {
      focusElement(initialFocus);
    } else {
      for (let container of containers) {
        let result = focusIn(container, Focus.First);
        if (result === FocusResult.Success) {
          break;
        }
      }
    }

    previousActiveElement = document.activeElement as HTMLElement;
  }

  // Restore when `enabled` becomes false
  function restore() {
    focusElement(restoreElement);
    restoreElement = null;
    previousActiveElement = null;
  }

  // Handle initial focus
  onMount(handleFocus);

  $: enabled && containers ? handleFocus() : restore();

  // When this component is being destroyed, focusElement is called
  // before handleWindowFocus is removed, so in the svelte port we add this
  // to ignore the handler.
  let destroying = false;
  onDestroy(() => {
    destroying = true;
    restore();
  });

  // Handle Tab & Shift+Tab keyboard events
  function handleWindowKeyDown(event: KeyboardEvent) {
    if (!enabled) return;
    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (containers.size !== 1) return;

    event.preventDefault();

    for (let element of containers) {
      let result = focusIn(
        element,
        (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround,
      );

      if (result === FocusResult.Success) {
        previousActiveElement = document.activeElement as HTMLElement;
        break;
      }
    }
  }

  // Prevent programmatically escaping
  function handleWindowFocus(event: FocusEvent) {
    if (event.target === window.document.body) {
      // Workaround for a SvelteKit issue: https://github.com/sveltejs/kit/issues/3501
      return;
    }
    if (!enabled) return;
    if (containers.size !== 1) return;
    if (destroying) return;

    let previous = previousActiveElement;
    if (!previous) return;

    let toElement = event.target as HTMLElement | null;

    if (toElement && toElement instanceof HTMLElement) {
      if (!contains(containers, toElement)) {
        event.preventDefault();
        event.stopPropagation();
        focusElement(previous);
      } else {
        previousActiveElement = toElement;
        focusElement(toElement);
      }
    } else {
      focusElement(previousActiveElement);
    }
  }
</script>

<svelte:window on:keydown={handleWindowKeyDown} on:focus|capture={handleWindowFocus} />

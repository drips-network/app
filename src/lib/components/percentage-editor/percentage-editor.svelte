<script lang="ts">
  import { stopPropagation, createBubbler } from 'svelte/legacy';
  import { createEventDispatcher, untrack } from 'svelte';

  const bubble = createBubbler();

  interface Props {
    percentage?: number;
    disabled?: boolean;
    editable?: boolean;
    emptyIsError?: boolean;
  }

  let {
    percentage = $bindable(0),
    disabled = false,
    editable = true,
    emptyIsError = true,
  }: Props = $props();

  let prevPercentage: number = percentage;
  let prevPercentageValue: number = Number(percentage);

  let percentageValue: string | number = $state((Math.round(percentage * 100) / 100).toString());

  let error = $derived(Number(percentage) > 100);
  let empty = $derived(Number(percentage) === 0);
  let inputWidth = $derived(`${percentageValue?.toString().length ?? 1}ch`);

  $effect(() => {
    const p = percentage;
    const pv = percentageValue;

    // Use untrack so the logic inside doesn't cause the effect to re-run recursively
    untrack(() => {
      const percentageChanged = prevPercentage !== p;
      // Compare numeric values to handle cases like "10" vs "10.0"
      const percentageValueChanged = Number(prevPercentageValue) !== Number(pv);

      // PRIORITY 1: Handle User Input (Local State Changed)
      if (percentageValueChanged) {
        let newPv = pv;

        if (newPv === null || newPv === '') newPv = 0;

        if (typeof newPv === 'string') {
          newPv = Number(newPv.replace(/[^0-9.]/g, '').replace(/([.])\1{1,}/g, '.'));

          if (isNaN(newPv)) newPv = 0;
        }

        if (newPv?.toString().startsWith('0')) {
          newPv = parseFloat(newPv.toString().trim());
        }

        // Update the bound prop
        percentage = newPv;

        // Update history tracking
        prevPercentage = newPv;
        prevPercentageValue = newPv;
      }
      // PRIORITY 2: Handle Prop Update (External State Changed)
      else if (percentageChanged) {
        // Update local display value
        percentageValue = (Math.round(p * 100) / 100).toString();

        // Update history tracking
        prevPercentage = p;
        prevPercentageValue = Number(percentageValue);
      }
    });
  });

  let focus = $state(false);
  let inputElem: HTMLInputElement;

  const dispatch = createEventDispatcher<{
    confirm: void;
  }>();

  function handleBlur() {
    if (focus) {
      dispatch('confirm');
    }
    focus = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      dispatch('confirm');
      inputElem.blur();
    }
  }

  function focusInput() {
    inputElem.focus();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="percentage-editor typo-text tabular-nums cursor-text"
  class:focus
  class:error
  class:empty-is-error={emptyIsError}
  class:empty
  class:disabled
  class:editable
  onclick={stopPropagation(focusInput)}
  onkeypress={stopPropagation(bubble('keypress'))}
>
  <input
    bind:this={inputElem}
    class="typo-text tabular-nums"
    tabindex={disabled ? -1 : 0}
    onfocus={() => {
      focus = true;
      inputElem.select();
    }}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    step="0.01"
    style:width={inputWidth}
    bind:value={percentageValue}
    min="0"
    max="100"
    disabled={!editable || disabled}
  />%
</div>

<style>
  .percentage-editor {
    display: flex;
    background-color: var(--color-background);
    border-radius: 0.25rem;
    padding: 0 0.125rem;
    box-sizing: border-box;
    transition:
      box-shadow 0.2s,
      color 0.2s;
  }

  .percentage-editor.editable {
    box-shadow: 0px 0px 0px 1px var(--color-foreground);
  }

  .percentage-editor.disabled {
    pointer-events: none;
    color: var(--color-foreground-level-5);
  }

  .percentage-editor.editable.disabled {
    box-shadow: 0px 0px 0px 1px var(--color-foreground-level-5);
  }

  .percentage-editor:not(.disabled).error,
  .percentage-editor:not(.disabled).empty-is-error.empty {
    box-shadow: 0px 0px 0px 2px var(--color-negative);
    color: var(--color-negative);
  }

  .percentage-editor:not(.error):not(.empty).focus {
    box-shadow: 0px 0px 0px 2px var(--color-primary);
  }

  .percentage-editor input:focus {
    outline: none;
  }
</style>

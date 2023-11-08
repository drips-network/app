<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let percentage = 0;
  export let disabled = false;
  export let editable = true;

  let error = false;
  let empty = false;
  let inputWidth = 'auto';

  let percentageValue: string | number = (Math.round(percentage * 100) / 100).toString();

  let prevPercentage: number = percentage;
  let prevPercentageValue = Number(percentageValue);

  $: {
    const percentageChanged = prevPercentage !== percentage;
    const percentageValueChanged = Number(prevPercentageValue) !== Number(percentageValue);

    if (percentageValueChanged) {
      let pv = percentageValue;

      if (pv === null || pv === '') pv = 0;

      if (typeof pv === 'string') {
        pv = Number(
          pv
            // Only allow numbers and dots
            .replace(/[^0-9.]/g, '')
            // Prevent multiple periods
            .replace(/([.])\1{1,}/g, '.'),
        );

        if (isNaN(pv)) pv = 0;
      }

      if (pv?.toString().startsWith('0')) {
        pv = parseFloat(pv.toString().trim());
      }

      percentage = pv;
      percentageValue = pv;
    } else if (percentageChanged) {
      percentageValue = (Math.round(percentage * 100) / 100).toString();
    }

    inputWidth = `${percentageValue?.toString().length ?? 1}ch`;

    error = Number(percentage) > 100;
    empty = Number(percentage) === 0;

    prevPercentage = percentage;
    prevPercentageValue = Number(percentageValue);
  }

  let focus = false;

  let inputElem: HTMLInputElement;

  const dispatch = createEventDispatcher<{
    /** Fired when the user blurs the input after selecting or hits enter to confirm. */
    confirm: never;
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

<div
  class="percentage-editor typo-text tabular-nums cursor-text"
  class:focus
  class:error
  class:empty
  class:disabled
  class:editable
  on:click|stopPropagation={focusInput}
  on:keypress|stopPropagation
>
  <input
    bind:this={inputElem}
    class="typo-text tabular-nums"
    tabindex={disabled ? -1 : 0}
    on:focus={() => {
      focus = true;
      inputElem.select();
    }}
    on:blur={handleBlur}
    on:keydown={handleKeydown}
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
    transition: box-shadow 0.2s, color 0.2s;
  }

  .percentage-editor.editable {
    box-shadow: 0px 0px 0px 1px var(--color-foreground);
  }

  .percentage-editor.disabled {
    pointer-events: none;
  }

  .percentage-editor.disabled {
    color: var(--color-foreground-level-5);
  }

  .percentage-editor.editable.disabled {
    box-shadow: 0px 0px 0px 1px var(--color-foreground-level-5);
  }

  .percentage-editor:not(.disabled).error,
  .percentage-editor:not(.disabled).empty {
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

<!--
	Adapted from https://github.com/probablykasper/date-picker-svelte
	Credit to Kasper Henningsen & Contributors!
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { toText } from './date-utils.js';
  import type { Locale } from './locale.js';
  import { parse, createFormat, type FormatToken } from './parse.js';
  import DateTimePicker from './DatePicker.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import TextInput from '../text-input/text-input.svelte';

  const dispatch = createEventDispatcher<{
    /** Fires when the user selects a new value in the DatePicker by clicking on a date or by pressing enter */
    select: Date;
  }>();

  /** Default date to display in picker before value is assigned */
  const defaultDate = new Date();

  // inner date value store for preventing value updates (and also
  // text updates as a result) when date is unchanged
  const innerStore = writable(null as Date | null);
  const store = (() => {
    return {
      subscribe: innerStore.subscribe,
      set: (date: Date | null) => {
        if (date === null || date === undefined) {
          innerStore.set(null);
          value = date;
        } else if (date.getTime() !== $innerStore?.getTime()) {
          innerStore.set(date);
          value = date;
        }
      },
    };
  })();

  /** Date value */
  export let value: Date | null = null;
  $: store.set(value);

  /** The earliest value the user can select */
  export let min = new Date(defaultDate.getFullYear() - 20, 0, 1);
  /** The latest value the user can select. Default is in 5 years*/
  export let max = new Date(defaultDate.getFullYear() + 5, 11, 31);
  /** Placeholder text to show when input field is empty */
  export let placeholder = 'YYYY-MM-DD HH:MM:SS';
  /** Whether the text is valid */
  export let valid = true;
  /** Disable the input **/
  export let disabled = false;
  /** Pass custom classes */
  let classes = '';
  export { classes as class };

  /** Format string */
  export let format = 'yyyy-MM-dd HH:mm:ss';
  let formatTokens = createFormat(format);
  $: formatTokens = createFormat(format);

  /** Locale object for internationalization */
  export let locale: Locale = {};

  function valueUpdate(value: Date | null, formatTokens: FormatToken[]) {
    text = toText(value, formatTokens);
  }
  $: valueUpdate($store, formatTokens);

  export let text = toText($store, formatTokens);

  function textUpdate(text: string, formatTokens: FormatToken[]) {
    if (text.length) {
      const result = parse(text, formatTokens, $store);
      if (result.date !== null) {
        valid = true;
        store.set(result.date);
      } else {
        valid = false;
      }
    } else {
      valid = true; // <-- empty string is always valid
      // value resets to null if you clear the field
      if (value) {
        value = null;
        store.set(null);
      }
    }
  }
  $: textUpdate(text, formatTokens);

  /** Whether the date popup is visible */
  export let visible = false;
  /** Close the date popup when a date is selected */
  export let closeOnSelection = false;
  /** Wait with updating the date until a date is selected */
  export let browseWithoutSelecting = false;

  /** Show a time picker with the specified precision */
  export let timePrecision: 'minute' | 'second' | 'millisecond' | null = null;

  // handle on:focusout for parent element. If the parent element loses
  // focus (e.g input element), visible is set to false
  function onFocusOut(e: FocusEvent) {
    if (
      e?.currentTarget instanceof HTMLElement &&
      e.relatedTarget &&
      e.relatedTarget instanceof Node &&
      e.currentTarget.contains(e.relatedTarget)
    ) {
      return;
    } else {
      visible = false;
    }
  }
  function keydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible) {
      visible = false;
      e.preventDefault();
      // When the date picker is open, we prevent 'Escape' from propagating,
      // so for example a parent modal won't be closed
      e.stopPropagation();
    } else if (e.key === 'Enter') {
      visible = !visible;
      e.preventDefault();
    }
  }

  function onSelect(e: CustomEvent<Date>) {
    dispatch('select', e.detail);
    if (closeOnSelection) {
      visible = false;
    }
  }

  /** Automatically adjust date popup position to not appear outside the screen */
  export let dynamicPositioning = false;

  let InputElement: HTMLInputElement;
  let pickerElement: HTMLElement | null;
  let showAbove = false;

  function setDatePickerPosition() {
    // Defaults
    showAbove = false;

    if (visible && pickerElement && dynamicPositioning) {
      // The child of the dateField is what is visually seen, all calculations should use this to make sure they line up properly
      const inputRect = InputElement.getBoundingClientRect();

      const bottomThreshold = inputRect.bottom + pickerElement.offsetHeight + 5;

      if (bottomThreshold > window.innerHeight) {
        // If .date-time-field is on the bottom half of the screen, open above
        showAbove = true;
      }
    }
  }

  function flyAutoPosition(node: HTMLElement) {
    setDatePickerPosition();
    return fly(node, {
      duration: 200,
      easing: cubicInOut,
      y: showAbove ? 5 : -5,
    });
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="date-time-field {classes}" on:focusout={onFocusOut} on:keydown={keydown}>
  <TextInput
    testId="date-time-field"
    bind:inputElement={InputElement}
    validationState={valid ? { type: 'valid' } : { type: 'invalid', message: 'Invalid date' }}
    value={text}
    {placeholder}
    {disabled}
    on:focus={() => (visible = true)}
    on:mousedown={() => (visible = true)}
    on:input={(e) => {
      if (
        e instanceof InputEvent &&
        e.inputType === 'insertText' &&
        typeof e.data === 'string' &&
        e.currentTarget instanceof HTMLInputElement &&
        e.currentTarget?.value === text + e.data
      ) {
        // check for missing punctuation, and add if there is any
        let result = parse(text, formatTokens, $store);
        if (result.missingPunctuation !== '' && !result.missingPunctuation.startsWith(e.data)) {
          text = text + result.missingPunctuation + e.data;
          return;
        }
      }

      if (e instanceof InputEvent && e.currentTarget instanceof HTMLInputElement) {
        text = e.currentTarget?.value;
      }
    }}
  />
  {#if visible && !disabled}
    <div
      class="picker"
      class:visible
      class:above={showAbove}
      transition:flyAutoPosition|global
      bind:this={pickerElement}
    >
      <DateTimePicker
        on:focusout={onFocusOut}
        on:select={onSelect}
        bind:value={$store}
        {min}
        {max}
        {locale}
        {browseWithoutSelecting}
        {timePrecision}
      />
    </div>
  {/if}
</div>

<style>
  .date-time-field {
    position: relative;
  }

  .invalid {
    border: 1px solid rgba(249, 47, 114, 0.5);
    background-color: rgba(249, 47, 114, 0.1);
  }
  .invalid:focus {
    border-color: #f92f72;
    box-shadow: 0px 0px 0px 2px rgba(249, 47, 114, 0.5);
  }

  .picker {
    display: none;
    position: absolute;
    padding: 1px;
    top: 3.5rem;
    z-index: 10;
  }
  .picker.above {
    bottom: 100%;
  }
  .picker.visible {
    display: block;
  }
</style>

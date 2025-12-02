<!-- Adjusted from radicle-design-system's TextInput component -->
<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import CheckCircleIcon from '$lib/components/icons/CheckCircle.svelte';
  import ExclamationCircleIcon from '$lib/components/icons/ExclamationCircle.svelte';
  import KeyHint from '$lib/components/key-hint/KeyHint.svelte';
  import Spinner from '$lib/components/spinner/spinner-radicle-system.svelte';
  import { tick, type Component } from 'svelte';
  import Cross from '$lib/components/icons/Cross.svelte';

  interface Props {
    variant?: { type: 'text' } | { type: 'password' } | { type: 'number'; min: number };
    spellcheck?: boolean;
    autocapitalize?: boolean;
    autocorrect?: boolean;
    autocomplete?: boolean;
    autofocus?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    showSuccessCheck?: boolean;
    showClearButton?: boolean;
    testId?: string | undefined;
    icon?: Component | undefined;
    inputStyle?: string | undefined;
    style?: string | undefined;
    value?: string | number | null | undefined;
    placeholder?: string | undefined;
    hint?: string | undefined;
    suffix?: string | undefined;
    inputElement?: HTMLInputElement | undefined;
    validationState?: TextInputValidationState;
    onchange?: (e: Event) => void;
    onclick?: (e: Event) => void;
    oninput?: (e: Event, v: string) => void;
    onfocus?: (e: FocusEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    onkeypress?: (e: KeyboardEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onpaste?: (e: ClipboardEvent) => void;
    onclear?: () => void;
    onblur?: (e: FocusEvent) => void;
  }

  let {
    variant = {
      type: 'text',
    },
    spellcheck = false,
    autocapitalize = true,
    autocorrect = true,
    autocomplete = true,
    autofocus = false,
    disabled = false,
    readonly = false,
    showSuccessCheck = false,
    showClearButton = false,
    testId = undefined,
    icon = undefined,
    inputStyle = undefined,
    style = undefined,
    value = $bindable(),
    placeholder = undefined,
    hint = undefined,
    suffix = undefined,
    inputElement = $bindable(),
    validationState = {
      type: 'unvalidated',
    },
    onchange,
    onclick,
    oninput,
    onfocus,
    onmousedown,
    onkeydown,
    onkeypress,
    onpaste,
    onclear,
    onblur,
  }: Props = $props();

  export const focus = (): void => {
    inputElement && inputElement.focus();
  };

  // Canʼt use normal `autofocus` attribute on the `inputElement`: "Autofocus
  // processing was blocked because a document's URL has a fragment".
  // preventScroll is necessary for onboarding animations to work.
  run(() => {
    if (autofocus) {
      inputElement && inputElement.focus({ preventScroll: true });
    }
  });

  // We do it this way to work around the svelte-check error: 'type' attribute
  // cannot be dynamic if input uses two-way binding (svelte).
  run(() => {
    if (inputElement) {
      inputElement.type = variant.type;
    }
  });

  async function clear() {
    value = '';
    onclear?.();
    // wait a tick in case parent has some disabling logic (enter-git-url)
    await tick();
    return inputElement?.focus();
  }

  let rightContainerWidth: number | undefined = $state();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    oninput?.(e, target.value);
  }
</script>

<div {style} class="wrapper typo-text">
  {#if icon}
    {@const SvelteComponent = icon}
    <div class="icon-container">
      <SvelteComponent />
    </div>
  {/if}

  <input
    style={`${inputStyle}; padding-right: ${
      rightContainerWidth ? `${rightContainerWidth}px` : 'auto'
    };`}
    style:padding-left={icon ? '2.75rem' : 'auto'}
    class:invalid={validationState.type === 'invalid'}
    class:concealed={variant.type === 'password'}
    class:tabular-nums={variant.type === 'number'}
    min={variant.type === 'number' ? variant.min : undefined}
    {placeholder}
    {disabled}
    {readonly}
    bind:value
    bind:this={inputElement}
    {onchange}
    {onclick}
    oninput={handleInput}
    {onfocus}
    {onkeydown}
    {onmousedown}
    {onkeypress}
    {onpaste}
    {onblur}
    autocomplete={autocomplete ? 'on' : 'off'}
    {spellcheck}
    autocapitalize={autocapitalize ? 'on' : 'off'}
    autocorrect={autocorrect ? 'on' : 'off'}
    lang="en-001"
    data-testid={testId}
  />

  <div class="right-container" bind:clientWidth={rightContainerWidth}>
    {#if hint && (validationState.type === 'unvalidated' || validationState.type === 'valid')}
      <KeyHint style="margin: 0 0.5rem;">{hint}</KeyHint>
    {/if}

    {#if showClearButton}
      <button onclick={clear} onkeydown={clear} tabindex="-1">
        <Cross />
      </button>
    {/if}

    {#if suffix}
      <span
        class="typo-text tabular-nums"
        style="color: var(--color-foreground-level-4); margin: 0 0.75rem;"
      >
        {suffix}
      </span>
    {/if}

    {#if validationState.type === 'pending'}
      <Spinner />
    {:else if showSuccessCheck && validationState.type === 'valid'}
      <CheckCircleIcon style="fill: var(--color-positive)" />
    {:else if validationState.type === 'invalid'}
      <ExclamationCircleIcon style="fill: var(--color-negative);" />
    {/if}
  </div>

  {#if validationState.type === 'invalid'}
    <div class="validation-message">
      {validationState.message}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  }

  input {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--color-background);
    border-radius: 2rem 0 2rem 2rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground-level-3);
    height: 3rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    font-feature-settings:
      'ss01',
      'ss02',
      'cv01',
      'calt' 0;
  }
  input::placeholder {
    color: var(--color-foreground-level-4);
  }

  input[disabled] {
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-4);
    cursor: not-allowed;
  }

  input[disabled]:hover {
    background-color: var(--color-foreground-level-1);
  }

  input[readonly]:hover {
    cursor: pointer;
  }

  .right-container {
    align-items: center;
    display: flex;
    gap: 0.25rem;
    height: 3rem;
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 0.75rem;
  }

  .concealed {
    color: var(--color-foreground-level-6);
  }

  input::placeholder {
    color: var(--color-foreground-level-4);
  }

  input:focus,
  input:hover {
    background-color: var(--color-foreground-level-1);
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
    outline: none;
  }

  input.invalid:focus,
  input.invalid {
    background-position: right 0.875rem top 55%;
    background: var(--color-background);
    box-shadow: inset 0px 0px 0px 2px var(--color-negative);
    outline: none;
  }

  input.invalid:focus {
    background: var(--color-foreground-level-1);
  }

  .validation-message {
    align-items: center;
    color: var(--color-negative);
    display: flex;
    margin-top: 0.75rem;
    text-align: left;
  }

  .icon-container {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
  }
</style>

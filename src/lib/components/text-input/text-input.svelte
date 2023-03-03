<!-- Adjusted from radicle-design-system's TextInput component -->
<script lang="ts">
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';

  import CheckCircleIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import ExclamationCircleIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';

  import KeyHint from 'radicle-design-system/KeyHint.svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';

  export let variant: { type: 'text' } | { type: 'password' } | { type: 'number'; min: number } = {
    type: 'text',
  };

  export let autofocus = false;
  export let disabled = false;
  export let readonly = false;
  export let showSuccessCheck = false;

  export let inputStyle: string | undefined = undefined;
  export let style: string | undefined = undefined;

  export let value: string | number | undefined = undefined;
  export let placeholder: string | undefined = undefined;

  export let hint: string | undefined = undefined;
  export let suffix: string | undefined = undefined;

  export let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  export const focus = (): void => {
    inputElement && inputElement.focus();
  };

  let inputElement: HTMLInputElement | undefined = undefined;

  // Can't use normal `autofocus` attribute on the `inputElement`: "Autofocus
  // processing was blocked because a document's URL has a fragment".
  // preventScroll is necessary for onboarding animations to work.
  $: if (autofocus) {
    inputElement && inputElement.focus({ preventScroll: true });
  }

  // We do it this way to work around the svelte-check error: 'type' attribute
  // cannot be dynamic if input uses two-way binding (svelte).
  $: if (inputElement) {
    inputElement.type = variant.type;
  }

  let rightContainerWidth: number;
</script>

<TransitionedHeight initHeight={40}>
  <div {style} class="wrapper">
    <input
      style={`${inputStyle}; padding-right: ${
        rightContainerWidth ? `${rightContainerWidth}px` : 'auto'
      };`}
      class:invalid={validationState.type === 'invalid'}
      class:concealed={variant.type === 'password'}
      min={variant.type === 'number' ? variant.min : undefined}
      {placeholder}
      {disabled}
      {readonly}
      spellcheck={false}
      bind:value
      bind:this={inputElement}
      on:change
      on:click
      on:input
      on:keydown
      on:keypress
    />

    <div class="right-container" bind:clientWidth={rightContainerWidth}>
      {#if hint && (validationState.type === 'unvalidated' || validationState.type === 'valid')}
        <KeyHint style="margin: 0 0.5rem;">{hint}</KeyHint>
      {/if}

      {#if suffix}
        <span
          class="typo-text-mono-bold"
          style="color: var(--color-foreground-level-5); margin: 0 0.75rem;"
        >
          {suffix}
        </span>
      {/if}

      {#if validationState.type === 'pending'}
        <Spinner style="margin: 0 0.5rem;" />
      {:else if showSuccessCheck && validationState.type === 'valid'}
        <CheckCircleIcon style="fill: var(--color-positive); margin: 0 0.5rem;" />
      {:else if validationState.type === 'invalid'}
        <ExclamationCircleIcon style="fill: var(--color-negative); margin: 0 0.5rem;" />
      {/if}
    </div>

    {#if validationState.type === 'invalid'}
      <div class="validation-message">
        {validationState.message}
      </div>
    {/if}
  </div>
</TransitionedHeight>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  }

  input {
    background-color: var(--color-background);
    border-radius: 2rem 0 2rem 2rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    height: 2.5rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    transition: background-color 0.3s, box-shadow 0.3s;
  }

  input[disabled] {
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-4);
    cursor: not-allowed;
  }

  input[disabled]::placeholder {
    color: var(--color-foreground-level-4);
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
    height: 2.5rem;
    position: absolute;
    right: 0;
    top: 0;
  }

  .concealed {
    color: var(--color-foreground-level-6);
  }

  input::placeholder {
    color: var(--color-foreground-level-5);
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
</style>

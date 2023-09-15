<!-- Adjusted from radicle-design-system's TextInput component -->
<script lang="ts">
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import ExclamationCircle from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import { onMount } from 'svelte';

  export let resizable = false;

  export let caption: string | undefined = undefined;
  export let textareaStyle: string | undefined = undefined;

  export let value: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;

  export let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  let textareaElement: HTMLTextAreaElement | undefined = undefined;

  // We either auto-grow the text area, or allow the user to resize it. These
  // options are mutually exclusive because a user resized textarea would
  // automatically shrink upon text input otherwise.
  $: if (textareaElement && !resizable) {
    // React to changes to the textarea content.
    value;

    // Reset height to 0px on every value change so that the textarea
    // immediately shrinks when all text is deleted.
    textareaElement.style.height = `0px`;

    textareaElement.style.height = `${textareaElement.scrollHeight}px`;
  }

  onMount(() => {
    if (textareaElement && resizable && value?.length) {
      textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 200)}px`;
    }
  });
</script>

<div class="container">
  <textarea
    style={textareaStyle}
    bind:this={textareaElement}
    bind:value
    class:invalid={validationState.type === 'invalid'}
    class="typo-text"
    class:resizable
    {placeholder}
    on:change
    on:click
    on:input
    on:keydown
    on:keypress
  />

  {#if caption && validationState.type !== 'invalid'}
    <p class="caption typo-text-small">
      {caption}
    </p>
  {/if}

  {#if validationState.type === 'invalid'}
    <p class="validation-message typo-text-small flex items-start gap-1">
      <ExclamationCircle style="fill: currentColor" />
      {validationState.message}
    </p>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  textarea {
    background-color: var(--color-background);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    box-sizing: border-box;
    padding: 0.75rem 0.75rem;
    width: 100%;
    height: 3rem;
    min-height: 3rem;
    resize: none;
    transition: background-color 0.3s, box-shadow 0.3s;
  }

  .resizable {
    resize: vertical;
  }

  textarea::-webkit-scrollbar {
    display: initial;
  }

  textarea::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  textarea::-webkit-resizer {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAD9QTFRFAAAAZWZmZmZmZmVmZWVmwsLBwsLCZ2ZmwsPCZmdlZWZnwcLBZmZkYGJjw8LDwsPBZmZnZWZkZ2ZkwMDBWFtcNbXb2AAAABV0Uk5TAP///////////////////////1H/YDRrSAAAAFBJREFUeJxVjUESgCAMA2mqAoqK6P/f6kzjIXIos5NumpI8g5LbpJnNQvDl52mWUYTquqnXwstshpHaTi+o+hHXccoKmHVW9yvIxv218ntivmOYAWpLfqaRAAAAAElFTkSuQmCC);
    background-size: 7px;
    background-repeat: no-repeat;
    background-position: bottom 1px right 1px;
  }

  textarea::placeholder {
    color: var(--color-foreground-level-5);
  }

  textarea:focus,
  textarea:hover {
    background-color: var(--color-foreground-level-1);
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
    outline: none;
  }

  textarea.invalid:focus,
  textarea.invalid {
    background-position: right 0.875rem top 55%;
    background: var(--color-background);
    box-shadow: inset 0px 0px 0px 2px var(--color-negative);
    outline: none;
  }

  textarea.invalid:focus {
    background: var(--color-foreground-level-1);
  }

  .caption {
    align-items: center;
    color: var(--color-foreground-level-4);
    display: flex;
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    text-align: left;
  }

  .validation-message {
    align-items: center;
    color: var(--color-negative);
    display: flex;
    margin-top: 0.25rem;
    text-align: left;
  }
</style>

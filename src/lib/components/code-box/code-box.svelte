<script lang="ts">
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import CheckIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import CopyIcon from 'radicle-design-system/icons/Copy.svelte';

  export let path: string;
  export let code: string;

  let headerElem: HTMLDivElement | undefined;

  $: primaryColor = headerElem
    ? getComputedStyle(headerElem).getPropertyValue('--color-primary')
    : undefined;

  $: textColor = primaryColor ? getContrastColor(primaryColor) : undefined;

  let copySuccess = false;

  async function copyClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
  }

  // TODO: make it use the real project URL
  $: gitHubProposalUrl = `https://github.com/radicle-dev/drips-app-v2/new/main?filename=drips.json&value=${encodeURIComponent(
    code,
  )}`;
</script>

<div class="codebox">
  <div class="header typo-text-small-mono" bind:this={headerElem} style:color={textColor}>
    {path}
    <div class="actions">
      <a href={gitHubProposalUrl} target="_blank">
        <ArrowBoxUpRight style="fill: {textColor}" />
      </a>
      <button on:click={() => copyClipboard(code)}>
        {#if copySuccess}
          <CheckIcon style="fill: {textColor}" />
        {:else}
          <CopyIcon style="fill: {textColor}" />
        {/if}
      </button>
    </div>
  </div>
  <div class="code-wrapper">
    <code class="typo-text-mono">
      {@html code}
    </code>
  </div>
</div>

<style>
  .codebox {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-low);
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    background-color: var(--color-primary);
    padding: 0 0.25rem 0 0.75rem;
    align-items: center;
  }

  .code-wrapper {
    padding: 0.75rem;
    background-color: var(--color-foreground-level-1);
  }

  code {
    white-space: pre-wrap;
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
  }

  .actions * {
    height: 2rem;
    width: 2rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.75;
    transition: opacity 0.2s;
  }

  .actions *:hover {
    opacity: 1;
  }
</style>

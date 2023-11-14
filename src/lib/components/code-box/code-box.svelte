<script lang="ts">
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import CheckIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import CopyIcon from 'radicle-design-system/icons/Copy.svelte';
  import Button from '../button/button.svelte';

  export let path: string;
  export let code: string;
  export let repoUrl: string;
  export let defaultBranch = 'main';

  let headerElem: HTMLElement | undefined;

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

  // TODO: add support for Gitlab.
  $: gitHubProposalUrl = `${repoUrl}/new/${defaultBranch}?filename=FUNDING.json&value=${encodeURIComponent(
    code,
  )}`;
</script>

<section class="codebox relative">
  <header class="header typo-text-small-mono" bind:this={headerElem} style:color={textColor}>
    {path}
    <div class="actions">
      <button on:click={() => copyClipboard(code)}>
        {#if copySuccess}
          <CheckIcon style="fill: {textColor}" />
        {:else}
          <CopyIcon style="fill: {textColor}" />
        {/if}
      </button>
    </div>
  </header>
  <div class="code-wrapper">
    <code class="typo-text-mono">
      {@html code}
    </code>
  </div>
  {#if repoUrl.includes('github')}
    <footer class="absolute bottom-4 right-4">
      <Button variant="primary" icon={ArrowBoxUpRight} href={gitHubProposalUrl} target="_blank">
        Add to your repo</Button
      >
    </footer>
  {/if}
</section>

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
    overflow: scroll;
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

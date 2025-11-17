<script lang="ts">
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import CheckIcon from '$lib/components/icons/CheckCircle.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import Button from '../button/button.svelte';
  import sanitize from 'sanitize-html';
  import insertTextAtIndices from '$lib/utils/insert-text-at-indicies';

  interface Props {
    path?: string;
    code: string;
    repoUrl?: string | undefined;
    defaultBranch?: string;
    highlight?: [number | null, number | null];
    editing?: boolean;
    height?: string | undefined;
    width?: string | undefined;
  }

  let {
    path = 'Code',
    code,
    repoUrl = undefined,
    defaultBranch = 'main',
    highlight = [null, null],
    editing = false,
    height = undefined,
    width = undefined,
  }: Props = $props();

  let headerElem: HTMLElement | undefined = $state();

  let primaryColor = $derived(
    headerElem ? getComputedStyle(headerElem).getPropertyValue('--color-primary') : undefined,
  );

  let textColor = $derived(primaryColor ? getContrastColor(primaryColor) : undefined);

  let sanitizedCode = $derived(
    sanitize(code, {
      allowedTags: [],
      allowedAttributes: {},
    }),
  );
  let displayCode = $derived(
    highlight.some((v) => v === null)
      ? sanitizedCode
      : insertTextAtIndices(sanitizedCode, {
          [highlight[0] as number]: '<mark class="typo-text-diff-additive">',
          [highlight[1] as number]: '</mark>',
        }),
  );
  let ctaText = $derived(editing ? 'Edit on GitHub' : 'Add to your repo');

  let copySuccess = $state(false);

  async function copyClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
  }

  // TODO: add support for Gitlab.
  let gitHubProposalUrl = $derived(
    editing
      ? `${repoUrl}/edit/${defaultBranch}/FUNDING.json`
      : `${repoUrl}/new/${defaultBranch}?filename=FUNDING.json&value=${encodeURIComponent(code)}`,
  );
</script>

<section
  style:height
  style:width
  style:overflow={height ? 'scroll' : 'hidden'}
  class="codebox relative text-left"
>
  <header class="header typo-text-small-mono" bind:this={headerElem} style:color={textColor}>
    {path}
    <div class="actions">
      <button onclick={() => copyClipboard(code)}>
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
      {@html displayCode}
    </code>
  </div>
  {#if repoUrl && repoUrl.includes('github')}
    <footer class="absolute bottom-4 right-4">
      <Button variant="primary" icon={ArrowBoxUpRight} href={gitHubProposalUrl} target="_blank">
        {ctaText}</Button
      >
    </footer>
  {/if}
</section>

<style>
  .codebox {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-low);
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
    white-space: pre;
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

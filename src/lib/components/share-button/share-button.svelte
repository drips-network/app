<script lang="ts">
  import { browser } from '$app/environment';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import ShareIcon from '$lib/components/icons/Sharrow.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { fade } from 'svelte/transition';
  import Button from '../button/button.svelte';
  import type { ComponentProps } from 'svelte';

  export let text: string | undefined = undefined;
  export let url: string;
  export let buttonVariant: ComponentProps<Button>['variant'] = 'ghost';

  export let copyLinkLabel = 'Copy link';
  export let shareLabel = 'Share';

  let shareSupported = browser && navigator.share;

  function handleClick() {
    if (shareSupported) {
      navigator.share({
        text,
        url,
      });
    } else {
      // Copy URL to clipboard
      navigator.clipboard.writeText(url);

      copySuccess = true;
      setTimeout(() => (copySuccess = false), 1000);
    }
  }

  let hovering = false;
  let copySuccess = false;
</script>

<div>
  {#if shareSupported}
    <Button variant={buttonVariant} on:click={handleClick}>
      <div class="button-inner">
        <ShareIcon style="fill:currentColor" />
        {shareLabel}
      </div>
    </Button>
  {:else}
    <Button
      on:mouseenter={() => (hovering = true)}
      on:focus={() => (hovering = true)}
      on:mouseleave={() => (hovering = false)}
      on:blur={() => (hovering = false)}
      on:click={handleClick}
      variant={buttonVariant}
    >
      <div class="button-inner">
        <div class="icon">
          {#if copySuccess}
            <span transition:fade|local={{ duration: 200 }}>
              <CheckCircle style="fill: var(--color-positive)" />
            </span>
          {:else if hovering}
            <span transition:fade|local={{ duration: 200 }}>
              <CopyIcon style="fill: currentColor" />
            </span>
          {:else}
            <span transition:fade|local={{ duration: 200 }}
              ><LinkIcon style="fill: currentColor" /></span
            >
          {/if}
        </div>
        {copyLinkLabel}
      </div>
    </Button>
  {/if}
</div>

<style>
  .button-inner {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    margin-left: -0.25rem;
  }

  .button-inner .icon {
    height: 2rem;
    width: 2rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 1rem;
  }

  .button-inner .icon > * {
    position: absolute;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import CheckCircleIcon from '$lib/components/icons/CheckCircle.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import { fade } from 'svelte/transition';
  import type { ComponentProps } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    linkCopied: {
      url: string;
    };
  }>();

  interface Props {
    url: string;
    variant?: ComponentProps<typeof Button>['variant'];
    success?: import('svelte').Snippet;
    hover?: import('svelte').Snippet;
    idle?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let { url, variant = 'normal', success, hover, idle, children }: Props = $props();

  let hovering = $state(false);
  let copySuccess = $state(false);

  function copyShareLink() {
    navigator.clipboard.writeText(url);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
    dispatch('linkCopied', { url });
  }
</script>

<Button
  onmouseenter={() => (hovering = true)}
  onfocus={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  onblur={() => (hovering = false)}
  onclick={copyShareLink}
  justify="left"
  {variant}
>
  <div class="button-inner">
    <div class="icon">
      {#if copySuccess}
        <span transition:fade={{ duration: 200 }}>
          {#if success}{@render success()}{:else}
            <CheckCircleIcon style="fill: var(--color-positive)" />
          {/if}
        </span>
      {:else if hovering}
        <span transition:fade={{ duration: 200 }}>
          {#if hover}{@render hover()}{:else}
            <CopyIcon style="fill: currentColor" />
          {/if}
        </span>
      {:else}
        <span transition:fade={{ duration: 200 }}>
          {#if idle}{@render idle()}{:else}
            <LinkIcon style="fill: currentColor" />
          {/if}
        </span>
      {/if}
    </div>
    {#if children}{@render children()}{:else}Copy link{/if}
  </div>
</Button>

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

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import CheckCircleIcon from '$lib/components/icons/CheckCircle.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import { fade } from 'svelte/transition';
  import type { ComponentProps } from 'svelte';

  export let url: string;
  export let variant: ComponentProps<Button>['variant'] = 'normal';

  let hovering = false;
  let copySuccess = false;

  function copyShareLink() {
    navigator.clipboard.writeText(url);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
  }
</script>

<Button
  on:mouseenter={() => (hovering = true)}
  on:focus={() => (hovering = true)}
  on:mouseleave={() => (hovering = false)}
  on:blur={() => (hovering = false)}
  on:click={copyShareLink}
  justify="left"
  {variant}
>
  <div class="button-inner">
    <div class="icon">
      {#if copySuccess}
        <span transition:fade={{ duration: 200 }}>
          <slot name="success">
            <CheckCircleIcon style="fill: var(--color-positive)" />
          </slot>
        </span>
      {:else if hovering}
        <span transition:fade={{ duration: 200 }}>
          <slot name="hover">
            <CopyIcon style="fill: currentColor" />
          </slot>
        </span>
      {:else}
        <span transition:fade={{ duration: 200 }}>
          <slot name="idle">
            <LinkIcon style="fill: currentColor" />
          </slot>
        </span>
      {/if}
    </div>
    <slot>Copy link</slot>
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

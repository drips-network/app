<script lang="ts">
  import CopyIcon from 'radicle-design-system/icons/CopySmall.svelte';
  import SuccessIcon from 'radicle-design-system/icons/CheckCircle.svelte';

  export let value: string;

  let success = false;
  let visible = false;

  async function copyClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    success = true;
    setTimeout(() => (success = false), 1000);
  }
</script>

<div
  class="copyable"
  on:click={() => copyClipboard(value)}
  on:mouseenter={() => (visible = true)}
  on:mouseleave={() => (visible = false)}
>
  <slot />
  <div class="copy-icon" class:visible={visible || success}>
    {#if success}
      <SuccessIcon style="fill: var(--color-positive)" />
    {:else}<CopyIcon />{/if}
  </div>
</div>

<style>
  .copyable {
    gap: 0.25rem;
    display: flex;
    cursor: pointer;
  }

  .copy-icon {
    transform: translateX(-24px);
    opacity: 0;
    width: 0px;
    transition: transform 0.3s, opacity 0.3s, width 0.3s;
  }

  .copy-icon.visible {
    width: 24px;
    opacity: 1;
    transform: translateX(0);
  }
</style>

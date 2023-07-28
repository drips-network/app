<script lang="ts">
  import CopyIcon from 'radicle-design-system/icons/CopySmall.svelte';
  import SuccessIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import { fly } from 'svelte/transition';

  export let value: string;
  export let alwaysVisible = false;
  export let disabled = false;

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
  on:click={(e) => {
    if (disabled) return;
    copyClipboard(value);
    e.stopPropagation();
  }}
  on:keydown={() => (visible = true)}
  on:mouseenter={() => (visible = true)}
  on:mouseleave={() => (visible = false)}
  role="button"
  tabindex="0"
>
  <slot />
  <div
    class="copy-icon"
    class:visible={!disabled && (visible || success || alwaysVisible)}
    class:animate={!alwaysVisible}
  >
    {#if success}
      <div transition:fly={{ duration: 300, y: 8 }}>
        <SuccessIcon style="fill: var(--color-positive)" />
      </div>
    {:else}<div transition:fly={{ duration: 300, y: -8 }}><CopyIcon /></div>{/if}
  </div>
</div>

<style>
  .copyable {
    gap: 0.25rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    justify-content: space-between;
  }

  .copy-icon {
    width: 0px;
    height: 24px;
    position: relative;
  }

  .copy-icon > div {
    position: absolute;
    top: 0;
    left: 0;
  }

  .copy-icon.animate {
    transform: translateX(-24px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s, width 0.3s;
  }

  .copy-icon.visible {
    width: 24px;
    opacity: 1;
    transform: translateX(0);
  }
</style>

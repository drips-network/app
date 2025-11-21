<script lang="ts">
  import CopyIcon from '$lib/components/icons/CopySmall.svelte';
  import SuccessIcon from '$lib/components/icons/CheckCircle.svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    value: string;
    alwaysVisible?: boolean;
    disabled?: boolean;
    children?: import('svelte').Snippet;
  }

  let { value, alwaysVisible = false, disabled = false, children }: Props = $props();

  let success = $state(false);
  let visible = $state(false);

  async function copyClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    success = true;
    setTimeout(() => (success = false), 1000);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="copyable"
  onclick={(e) => {
    if (disabled) return;
    copyClipboard(value);
    e.stopPropagation();
  }}
  onkeydown={() => (visible = true)}
  onmouseenter={() => (visible = true)}
  onmouseleave={() => (visible = false)}
>
  <!-- needs a .min-w-0 wrapper so slotted content that truncates can still truncate ("...") -->
  <div class="min-w-0">
    {@render children?.()}
  </div>
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
    transition:
      transform 0.3s,
      opacity 0.3s,
      width 0.3s;
  }

  .copy-icon.visible {
    width: 24px;
    opacity: 1;
    transform: translateX(0);
  }
</style>

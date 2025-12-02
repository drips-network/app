<script lang="ts">
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import Lock from '$lib/components/icons/Lock.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    title: string;
    isPrivate?: boolean;
    hidden?: boolean;
    children?: import('svelte').Snippet;
  }

  let { title, isPrivate = false, hidden = false, children }: Props = $props();
</script>

<div class="field">
  <h2 class="typo-header-4" style:display="flex" style:gap="0.2rem">
    {title}

    {#if isPrivate}
      <div style:cursor="help" style:width="fit-content">
        <Tooltip>
          {#snippet tooltip_content()}
            This field is private and only visible to admins or the applicant.
          {/snippet}
          <Lock />
        </Tooltip>
      </div>
    {/if}
  </h2>

  <span class="typo-text content">
    <div class="inner">
      <div class="wrapper" class:is-hidden={hidden}>
        {@render children?.()}
      </div>

      {#if hidden}
        <div transition:fade={{ duration: 300 }} class="hidden-overlay"><EyeClosed /></div>
      {/if}
    </div>
  </span>
</div>

<div class="divider"></div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
    min-width: 0;
    max-width: 100%;
  }

  .divider {
    height: 1px;
    width: calc(100% + 2rem);
    margin: 0 -1rem;
    background-color: var(--color-foreground-level-2);
  }

  .content {
    color: var(--color-foreground-level-6);
  }

  .content .inner {
    position: relative;
    width: fit-content;
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .content .inner .wrapper {
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .content .inner .wrapper.is-hidden {
    opacity: 0.1;
  }

  .hidden-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-width: 2rem;
    height: 100%;
    background-color: var(--color-foreground-level-2);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground-level-4);
    font-size: 1.25rem;
    border-radius: 0.5rem;
  }

  .divider:last-child {
    display: none;
  }
</style>

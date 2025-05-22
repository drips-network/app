<script lang="ts">
  import Button from '../button/button.svelte';

  let expanded = false;

  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class="expandable-text" class:expanded>
  <slot />
  <div class="expand-button">
    <Button on:click={toggleExpand}>
      {expanded ? 'Show less' : 'Show more'}
    </Button>
  </div>
  {#if !expanded}
    <div class="fadeout-gradient"></div>
  {/if}
</div>

<style>
  .expandable-text {
    position: relative;
    max-height: 20rem;
    overflow: hidden;
  }

  .expandable-text.expanded {
    max-height: none;
  }

  .expand-button {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    z-index: 1;
  }

  .expanded .expand-button {
    position: relative;
    left: 0;
    transform: none;
    width: fit-content;
    margin: 1rem auto 0 auto;
  }

  .fadeout-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 10rem;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--color-background));
  }
</style>

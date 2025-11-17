<script lang="ts">
  interface Props {
    key: string;
    size?: 'medium' | 'large';
    highlight?: boolean;
    children?: import('svelte').Snippet;
  }

  let { key, size = 'large', highlight = false, children }: Props = $props();
</script>

<div class="key-value-pair typo-text size-{size}" class:highlight>
  <h5 class="key">{key}</h5>
  <div class="value">{@render children?.()}</div>
</div>

<style>
  h5 {
    line-height: 16px;
  }

  .key-value-pair {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
  }

  .size-medium {
    gap: 0.5rem;
  }

  .size-large {
    gap: 1rem;
  }

  .size-large .value {
    font-size: 2rem;
  }

  .value {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .highlight {
    font-weight: bold;
  }

  h5 {
    color: var(--color-foreground-level-6);
  }
</style>

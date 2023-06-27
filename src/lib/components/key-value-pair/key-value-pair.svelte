<script lang="ts">
  export let key: string;
  export let size: 'medium' | 'large' = 'large';
  export let highlight = false;
</script>

<div class="key-value-pair typo-text size-{size}" class:highlight>
  <h5 class="key">{key}</h5>
  <div class="value"><slot /></div>
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

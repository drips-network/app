<script lang="ts">
  export let title: string;
  export let subtitle: string | undefined = undefined;
  export let value: string;
  export let symbol: string;
  export let highlight = false;
  export let disabled = false;
</script>

<div class="line-item" class:highlight class:disabled>
  <div class="title">
    <h4>{title}</h4>
    {#if subtitle}<p class="typo-text-small">{subtitle}</p>{/if}
  </div>
  <div class="value">
    <p class="typo-text-mono-bold">{value}</p>
    <p class="typo-text-mono-bold symbol">{symbol}</p>
  </div>
</div>

<style>
  .line-item {
    padding: 0.75rem 1rem;
    display: flex;
    text-align: left;
    align-items: center;
    justify-content: space-between;
  }

  .line-item.disabled {
    opacity: 0.5;
  }

  .title {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
    max-width: 60%;
  }

  .title > h4 {
    color: var(--color-foreground);
  }

  .title > p {
    color: var(--color-foreground);
  }

  .value {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground);
  }

  .symbol {
    color: var(--color-foreground);
  }

  .highlight {
    background-color: var(--color-foreground-level-1);
  }
</style>

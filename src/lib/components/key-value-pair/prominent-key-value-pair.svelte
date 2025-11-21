<script lang="ts">
  import formatNumber from '$lib/utils/format-number';

  interface Props {
    key: string;
    value?: string | number | undefined;
    explorerItems?: {
      base: string;
      dripsContract: string;
      icon: ConstructorOfATypedSvelteComponent;
    }[];
    children?: import('svelte').Snippet;
  }

  let { key, value = undefined, explorerItems = [], children }: Props = $props();

  let formattedValue = $derived(typeof value === 'number' ? formatNumber(value) : value);
</script>

<div class="value-wrapper">
  <div class="header">
    <h5>{key}</h5>
    {#if explorerItems.length > 0}
      <div class="explorer-items">
        {#each explorerItems as item}
          <a
            href="{item.base}/address/{item.dripsContract}"
            target="_blank"
            rel="noreferrer"
            class="header"
          >
            <item.icon />
          </a>
        {/each}
      </div>
    {/if}
  </div>
  <span class="large-number pixelated"
    >{#if value !== undefined}{formattedValue}{:else}{@render children?.()}{/if}</span
  >
</div>

<style>
  .value-wrapper {
    border: 1px solid var(--color-foreground-level-3);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    justify-content: space-between;
  }

  .value-wrapper .header .explorer-items {
    display: flex;
    gap: 0.25rem;
  }

  .value-wrapper .header .explorer-items a {
    opacity: 0.5;
    transition: 0.3s;
  }

  .value-wrapper .header .explorer-items a:focus-visible,
  .value-wrapper .header .explorer-items a:hover {
    opacity: 1;
  }

  .large-number {
    font-size: min(11vw, 70px);
    line-height: min(12vw, 80px);
    color: var(--color-primary);
  }

  @media (max-width: 1070px) {
    .value-wrapper {
      width: 100%;
    }
  }

  .value-wrapper .header {
    display: flex;
    justify-content: space-between;
  }
</style>

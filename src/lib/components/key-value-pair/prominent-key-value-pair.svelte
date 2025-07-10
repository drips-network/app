<script lang="ts">
  export let key: string;
  export let explorerItems: {
    base: string;
    dripsContract: string;
    icon: ConstructorOfATypedSvelteComponent;
  }[] = [];
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
            <svelte:component this={item.icon} />
          </a>
        {/each}
      </div>
    {/if}
  </div>
  <span class="large-number pixelated"><slot /></span>
</div>

<style>
  .value-wrapper {
    border: 1px solid var(--color-foreground);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
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

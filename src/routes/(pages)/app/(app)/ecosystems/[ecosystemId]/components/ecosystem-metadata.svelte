<script lang="ts">
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import type { ComponentType } from 'svelte';

  export let ecosystem: Ecosystem;

  const iconImports = import.meta.glob('$lib/components/icons/*.svelte') as Record<
    string,
    () => Promise<{ default: ComponentType }>
  >;

  $: metadata = ecosystem.metadata || [];
</script>

<div class="card ecosystem-metadata">
  {#if !metadata.length}
    No metadata
  {/if}
  {#each metadata as metadatum}
    {@const importIcon = iconImports[`/src/lib/components/icons/${metadatum.icon}.svelte`]}
    <div>
      <h4 class="typo-header-4">
        {#if importIcon}
          {#await importIcon() then { default: Icon }}
            <Icon style="fill: var(--color-primary)" />
          {/await}
        {/if}
        {metadatum.title}
      </h4>
      {#if metadatum.text}
        {metadatum.text}
      {/if}
      {#if metadatum.link}
        <a
          href={metadatum.link.href}
          target="_blank"
          class="typo-link"
          style="color: var(--color-foreground)"
          >{metadatum.link.label ? metadatum.link.label : metadatum.link.href}</a
        >
      {/if}
    </div>
  {/each}
</div>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1.5rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    overflow-x: scroll;
    text-align: left;
  }

  .ecosystem-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .ecosystem-metadata > * {
    flex-basis: calc(33% - 2rem);
  }

  @media (max-width: 768px) {
    .ecosystem-metadata > * {
      flex-basis: calc(50% - 2rem);
    }
  }

  h4 {
    color: var(--color-primary);
    margin-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }
</style>

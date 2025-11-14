<script lang="ts">
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  interface Props {
    title: string;
    tooltip: string | undefined;
    detail?: import('svelte').Snippet;
    value?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
  }

  let { title, tooltip, detail, value, actions }: Props = $props();
</script>

<section
  class="token-stat border rounded-drip-xl pt-3 px-4 pb-3"
  style="border-color:var(--color-foreground)"
>
  <header class="flex flex-wrap justify-between items-end">
    <div class="title">
      <h3 class="typo-text">{title}</h3>
      {#if tooltip}
        <Tooltip>
          <InfoCircle style="height: 1rem;" />
          {#snippet tooltip_content()}
            {tooltip}
          {/snippet}
        </Tooltip>
      {/if}
    </div>
    <div>
      {@render detail?.()}
    </div>
  </header>

  <!-- amount -->
  <div class="mt-10 text-right text-typo-header-1 font-mono font-bold">
    {@render value?.()}
  </div>

  <!-- actions -->
  <footer class="flex justify-end mt-5 -mr-1">
    {@render actions?.()}
  </footer>
</section>

<style>
  .title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
</style>

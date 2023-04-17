<script lang="ts">
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  export let title: string;
  export let tooltip: string | undefined;
</script>

<section
  class="token-stat border rounded-xl pt-3 px-4 pb-3"
  style="border-color:var(--color-foreground)"
>
  <header class="flex flex-wrap justify-between items-end">
    <div class="title">
      <h3 class="typo-text">{title}</h3>
      {#if tooltip}
        <Tooltip>
          <InfoCircle style="height: 1rem;" />
          <svelte:fragment slot="tooltip-content">
            {tooltip}
          </svelte:fragment>
        </Tooltip>
      {/if}
    </div>
    <div>
      <slot name="detail" />
    </div>
  </header>

  <!-- amount -->
  <div class="mt-10 text-right text-typo-header-1 font-mono font-bold">
    <slot name="value" />
  </div>

  <!-- actions -->
  <footer class="flex justify-end mt-5 -mr-1">
    <slot name="actions" />
  </footer>
</section>

<style>
  .title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
</style>

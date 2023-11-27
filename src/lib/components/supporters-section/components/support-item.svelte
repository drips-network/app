<script lang="ts">
  import FiatEstimateValue from '$lib/components/aggregate-fiat-estimate/fiat-estimate-value.svelte';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let title: {
    component: ComponentType;
    props: Record<string, unknown>;
  };
  export let href: string | undefined = undefined;

  export let subtitle: string | undefined = undefined;
  export let fiatEstimateCents: number | 'pending' | 'unsupported' | undefined = 'pending';
  export let subAmount: string;
</script>

<a class="support-item" {href}>
  <div class="left">
    <div class="icon">
      <svelte:component this={icon} style="fill: var(--color-foreground)" />
    </div>
    <div class="content">
      <div class="title">
        <svelte:component this={title.component} {...title.props} />
      </div>
      {#if subtitle}<div class="subtitle muted">{subtitle}</div>{/if}
    </div>
  </div>
  <div class="amount">
    <FiatEstimateValue {fiatEstimateCents} />
    <div class="amount-sub muted tabular-nums">{subAmount}</div>
  </div>
</a>

<style>
  .support-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
  }

  .support-item:hover,
  .support-item:focus-visible {
    background-color: var(--color-primary-level-1);
    outline: none;
  }

  .support-item:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .amount {
    text-align: right;
  }

  .icon {
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    border-radius: 2rem;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>

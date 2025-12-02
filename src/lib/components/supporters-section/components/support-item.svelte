<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    title: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: Component<any>;
      props: Record<string, unknown>;
    };
    href?: string | undefined;
    subtitle?: string | undefined;
    amount_value?: import('svelte').Snippet;
    amount_sub?: import('svelte').Snippet;
  }

  let { title, href = undefined, subtitle = undefined, amount_value, amount_sub }: Props = $props();
</script>

<svelte:element this={href ? 'a' : 'div'} class="support-item" {href} class:has-href={href}>
  <div class="left">
    <div class="content">
      <div class="title">
        <title.component {...title.props} />
      </div>
      {#if subtitle}
        <div class="subtitle muted">{subtitle}</div>
      {/if}
    </div>
  </div>
  <div class="amount">
    <div class="value">
      {@render amount_value?.()}
    </div>
    <div class="amount_sub muted typo-text-small tabular-nums">
      {@render amount_sub?.()}
    </div>
  </div>
</svelte:element>

<style>
  .support-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    align-items: center;
    gap: 2rem;
  }

  .support-item.has-href:hover,
  .support-item.has-href:focus-visible {
    background-color: var(--color-primary-level-1);
    outline: none;
  }

  .support-item:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .amount {
    text-align: right;
    white-space: nowrap;
  }

  .amount .value {
    display: flex;
    gap: 0.125rem;
    justify-content: flex-end;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>

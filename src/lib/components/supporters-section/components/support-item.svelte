<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let title: {
    component: ComponentType;
    props: Record<string, unknown>;
  };
  export let href: string | undefined = undefined;

  export let subtitle: string | undefined = undefined;
</script>

<a class="support-item" {href} class:has-href={href}>
  <div class="left">
    <div class="content">
      <div class="title">
        <svelte:component this={title.component} {...title.props} />
      </div>
      {#if subtitle}
        <div class="subtitle muted">{subtitle}</div>
      {/if}
    </div>
  </div>
  <div class="amount">
    <div class="value">
      <slot name="amount-value" />
    </div>
    <div class="amount-sub muted typo-text-small tabular-nums">
      <slot name="amount-sub" />
    </div>
  </div>
</a>

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
    border-bottom: 1px solid var(--color-foreground);
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

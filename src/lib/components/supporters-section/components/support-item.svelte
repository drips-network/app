<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let title: {
    component: ComponentType;
    props: Record<string, unknown>;
  };

  export let subtitle: string;
  export let amount: string;
  export let subAmount: string;
</script>

<div class="support-item">
  <div class="icon">
    <svelte:component this={icon} />
  </div>
  <div class="content">
    <div class="title">
      <svelte:component this={title.component} {...title.props} />
    </div>
    <div class="subtitle">{subtitle}</div>
  </div>
  <div class="amount">
    <div class="amount-value">{amount}</div>
    <div class="amount-sub">{subAmount}</div>
  </div>
</div>

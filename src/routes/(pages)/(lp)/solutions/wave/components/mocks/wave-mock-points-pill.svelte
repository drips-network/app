<script lang="ts">
  import Multiplier from '$lib/components/icons/Multiplier.svelte';

  type Variant = 'primary' | 'caution' | 'positive' | 'neutral';

  let {
    points,
    label = 'Points',
    multiplier,
    variant = 'primary',
    bold = false,
  }: {
    points: number | string;
    label?: string;
    multiplier?: number;
    variant?: Variant;
    bold?: boolean;
  } = $props();

  const COLORS: Record<Variant, [string, string]> = {
    primary: ['var(--color-primary-level-7)', 'var(--color-primary-level-2)'],
    caution: ['var(--color-caution-level-6)', 'var(--color-caution-level-1)'],
    positive: ['var(--color-positive-level-6)', 'var(--color-positive-level-1)'],
    neutral: ['var(--color-foreground-level-6)', 'var(--color-foreground-level-2)'],
  };

  let [color, backgroundColor] = $derived(
    COLORS[multiplier && multiplier > 1 ? 'caution' : variant],
  );
</script>

<span class="pill" class:bold style:color style:background-color={backgroundColor}>
  {#if multiplier && multiplier > 1}
    <Multiplier style="width: 0.875rem; height: 0.875rem; fill: currentColor;" />
  {/if}
  {points}
  {#if label}<span>{label}</span>{/if}
</span>

<style>
  .pill {
    border-radius: 1rem 0 1rem 1rem;
    padding: 0 0.5rem;
    height: 20px;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    line-height: 1;
    white-space: nowrap;
  }

  .pill.bold {
    font-weight: 600;
  }
</style>

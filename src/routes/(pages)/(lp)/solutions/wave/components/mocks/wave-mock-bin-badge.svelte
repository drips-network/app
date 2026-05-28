<script lang="ts">
  type Bin = 'good' | 'mid' | 'bad';

  let { bin, label }: { bin: Bin; label?: string } = $props();

  const COLORS: Record<Bin, [string, string]> = {
    good: ['var(--color-positive-level-6)', 'var(--color-positive-level-1)'],
    mid: ['var(--color-foreground-level-6)', 'var(--color-foreground-level-2)'],
    bad: ['var(--color-caution-level-6)', 'var(--color-caution-level-1)'],
  };

  const DEFAULT_LABEL: Record<Bin, string> = {
    good: 'High',
    mid: 'Medium',
    bad: 'Low',
  };

  let [color, backgroundColor] = $derived(COLORS[bin]);
</script>

<span class="bin typo-text-small" style:color style:background-color={backgroundColor}>
  {label ?? DEFAULT_LABEL[bin]}
</span>

<style>
  .bin {
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    display: inline-block;
  }
</style>

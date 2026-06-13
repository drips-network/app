<script lang="ts">
  interface Props {
    maxItems?: number;
    components?: unknown[];
    countOverride?: number;
  }

  let { maxItems = 4, components = [], countOverride }: Props = $props();

  const overflowAmount = $derived((countOverride ?? components.length) - maxItems);
</script>

{#if overflowAmount > 0}<span>+{overflowAmount}</span>{/if}

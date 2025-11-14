<script lang="ts">
  import formatPercent from '$lib/utils/format-percent';

  interface Props {
    weight: number;
  }

  let { weight }: Props = $props();

  let weightFormatted = $derived(formatPercent(weight));
</script>

<div class="ecosystem-distribution-weight">
  {weightFormatted}
</div>

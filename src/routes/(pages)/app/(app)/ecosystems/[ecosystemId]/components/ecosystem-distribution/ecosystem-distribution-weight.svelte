<script lang="ts">
  import formatPercent from '$lib/utils/format-percent';

  export let weight: number;

  $: weightFormatted = formatPercent(weight);
</script>

<div class="ecosystem-distribution-weight">
  {weightFormatted}
</div>

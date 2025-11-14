<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';

  let { data, children } = $props();
</script>

<PrimaryColorThemer colorHex={data.round.color}>
  {@render children?.()}
</PrimaryColorThemer>

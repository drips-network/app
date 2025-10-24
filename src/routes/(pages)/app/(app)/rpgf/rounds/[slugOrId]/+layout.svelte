<script>
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';

  export let data;
</script>

<PrimaryColorThemer colorHex={data.round.color}>
  <slot></slot>
</PrimaryColorThemer>

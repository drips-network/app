<script lang="ts">
  import countStore from '$lib/stores/example';
</script>

<button on:click={() => countStore.increment(1)}>{$countStore}</button>

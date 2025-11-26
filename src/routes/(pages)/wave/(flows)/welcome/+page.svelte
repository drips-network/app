<script lang="ts">
  import Button from '$lib/components/button/button.svelte';

  let { data } = $props();
</script>

Welcome

<Button href={data.backTo}>Skip</Button>

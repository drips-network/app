<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  let { data } = $props();
</script>

<HeadMeta title="Welcome to Drips Wave" />

Welcome

<Button href={data.backTo}>Skip</Button>

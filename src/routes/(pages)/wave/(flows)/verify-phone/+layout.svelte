<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  let { children } = $props();
</script>

<HeadMeta title="Phone Verification | Wave" />

{@render children?.()}

<script lang="ts">
  import AppBaseLayout from '$lib/shared-layouts/app-base-layout.svelte';

  export let data: { pathname: string };
</script>

<AppBaseLayout {data}>
  <slot />
</AppBaseLayout>

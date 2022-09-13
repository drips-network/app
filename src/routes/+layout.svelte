<script lang="ts">
  import { onMount } from 'svelte';

  // Global CSS imports
  import '../app.css';
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';

  import walletStore from '$lib/stores/wallet';

  onMount(() => walletStore.initialize());
</script>

<div data-theme="light">
  <slot />
</div>

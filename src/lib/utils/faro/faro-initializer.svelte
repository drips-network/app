<script lang="ts">
  import cookieManager, {
    ConsentType,
  } from '$lib/components/wave/cookie-consent-banner/cookie-manager.svelte';
  import { init } from './faro-manager';

  $effect(() => {
    if (cookieManager?.consentMap[ConsentType.FARO]) {
      // eslint-disable-next-line no-console
      console.log('Initializing Faro monitoring');
      init();
    }
  });
</script>

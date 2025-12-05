<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import themeStore from '$lib/stores/theme/theme.store.js';
  import { getSumsubSessionToken } from '$lib/utils/wave/kyc.js';
  import snsWebSdk, { type SnsWebSdk } from '@sumsub/websdk';
  import { onDestroy, onMount } from 'svelte';

  let { data } = $props();

  let snsWebSdkInstance: SnsWebSdk | null = null;

  function launchWebSdk(accessToken: string) {
    snsWebSdkInstance = snsWebSdk
      .init(accessToken, async () => {
        const newTokenRes = await getSumsubSessionToken();
        return newTokenRes.accessToken;
      })
      .withConf({
        lang: 'en',
        theme: $themeStore.currentTheme === 'light' ? 'light' : 'dark',
      })
      .withOptions({ addViewportTag: false, adaptIframeHeight: true })
      .on('idCheck.onApplicantSubmitted', () => {
        goto(resolve('/wave/kyc/success'));
      })
      .build();

    snsWebSdkInstance.launch('#sumsub-target');
  }

  onMount(() => launchWebSdk(data.sumsubToken));
  onDestroy(() => snsWebSdkInstance?.destroy());
</script>

<div class="wrapper">
  <div id="sumsub-target"></div>
</div>

<style>
  .wrapper {
    background-color: #1b1b1f;
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #sumsub-target {
    width: 100%;
    height: fit-content;
    border-radius: 1rem;
    overflow: hidden;
    padding: 2rem;
  }
</style>

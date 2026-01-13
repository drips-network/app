<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import themeStore from '$lib/stores/theme/theme.store.js';
  import { getSumsubSessionToken } from '$lib/utils/wave/kyc.js';
  import snsWebSdk, { type SnsWebSdk } from '@sumsub/websdk';
  import { onDestroy, onMount } from 'svelte';

  let { data } = $props();
  let { sumsubSessionToken, user } = $derived(data);

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

  onMount(() => (sumsubSessionToken ? launchWebSdk(sumsubSessionToken) : null));
  onDestroy(() => snsWebSdkInstance?.destroy());
</script>

<HeadMeta title="Identity verification | Wave" />

<div class="wrapper">
  {#if sumsubSessionToken}
    <div id="sumsub-target"></div>
  {:else}
    <div class="already-done">
      Your documents have been successfully submitted. No further action is required at this time.

      <AnnotationBox type="info">
        We'll send email updates to {user.email} when your identity verification status changes.
      </AnnotationBox>

      <div>
        <Button href="/wave/settings/identity-and-payments" icon={ArrowRight}
          >Review KYC Status</Button
        >
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
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

  .already-done {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 32rem;
    text-align: center;
  }
</style>

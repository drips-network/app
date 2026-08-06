<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import themeStore from '$lib/stores/theme/theme.store.js';
  import {
    getLivenessCheckpointStatus,
    startLivenessCheckpoint,
  } from '$lib/utils/wave/liveness.js';
  import snsWebSdk, { type SnsWebSdk } from '@sumsub/websdk';
  import { onDestroy, onMount } from 'svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
  let { backTo, sumsubToken } = $derived(data);

  /**
   * `capturing` — the SumSub SDK is on screen taking the selfie.
   * `checking` — the selfie is submitted and we're waiting for the verdict.
   */
  let phase = $state<'capturing' | 'checking'>('capturing');

  let snsWebSdkInstance: SnsWebSdk | null = null;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const POLL_INTERVAL_MS = 2000;

  /**
   * Polls the backend until the checkpoint resolves.
   *
   * The backend is the only authority here: it resolves the challenge from
   * SumSub's webhook, and falls back to asking SumSub directly if that webhook
   * is slow or lost. The loop runs on a fixed interval from the moment the SDK
   * mounts rather than being kicked off by an SDK event, so an event we don't
   * recognise can never leave the user stuck on a spinner.
   */
  async function poll() {
    if (stopped) return;

    try {
      const status = await getLivenessCheckpointStatus(undefined, 'grant_access');

      if (status.satisfied) {
        stopped = true;
        await invalidate('wave:liveness-checkpoint');
        await goto(`/wave/checkpoint/success?backTo=${encodeURIComponent(backTo)}`);
        return;
      }

      // 'expired' means this attempt was superseded (another tab started a new
      // one), so nothing will ever resolve it. Terminal here too, otherwise the
      // loop would spin indefinitely.
      if (
        status.challengeStatus === 'rejected' ||
        status.challengeStatus === 'expired' ||
        status.locked
      ) {
        stopped = true;
        await invalidate('wave:liveness-checkpoint');
        await goto(`/wave/checkpoint?backTo=${encodeURIComponent(backTo)}`);
        return;
      }
    } catch {
      // A blip shouldn't end the flow — the next tick will try again.
    }

    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }

  function launchWebSdk(accessToken: string) {
    snsWebSdkInstance = snsWebSdk
      .init(accessToken, async () => {
        const refreshed = await startLivenessCheckpoint(undefined, 'grant_access');
        return refreshed.accessToken;
      })
      .withConf({
        lang: 'en',
        theme: $themeStore.currentTheme === 'light' ? 'light' : 'dark',
      })
      .withOptions({ addViewportTag: false, adaptIframeHeight: true })
      .on('idCheck.onActionSubmitted', () => {
        phase = 'checking';
      })
      .on('idCheck.onActionCompleted', () => {
        phase = 'checking';
      })
      .build();

    snsWebSdkInstance.launch('#sumsub-target');
  }

  onMount(() => {
    launchWebSdk(sumsubToken);
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  });

  onDestroy(() => {
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
    snsWebSdkInstance?.destroy();
  });
</script>

{#if phase === 'checking'}
  <FlowStepWrapper
    headline="Checking..."
    description="Hang tight, this usually takes a few seconds. Don't close this page."
  >
    <div class="spinner-wrapper">
      <Spinner classes="w-12 h-12" />
    </div>
  </FlowStepWrapper>
{/if}

<div class="wrapper" class:hidden={phase === 'checking'}>
  <div id="sumsub-target"></div>
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

  /* Kept mounted rather than destroyed — tearing the SDK down mid-review can
     abort the upload it's still finishing in the background. */
  .wrapper.hidden {
    display: none;
  }

  #sumsub-target {
    width: 100%;
    height: fit-content;
    border-radius: 1rem;
    overflow: hidden;
    padding: 2rem;
  }

  .spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
  }
</style>

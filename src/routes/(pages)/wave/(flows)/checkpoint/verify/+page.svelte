<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
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

  /** Set once we've been waiting on a verdict for longer than we'd expect. */
  let verdictSlow = $state(false);

  let snsWebSdkInstance: SnsWebSdk | null = null;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let checkingSince: number | null = null;

  const POLL_INTERVAL_MS = 2000;

  /**
   * How long we hide the SDK waiting for a verdict before showing it again.
   *
   * The SDK re-presents its own retry UI in place (bad lighting, no face
   * detected, ...), and it does so without an event we can reliably hook, so
   * an unconditional spinner can bury a prompt the user needs to answer.
   */
  const VERDICT_TIMEOUT_MS = 60000;

  function startChecking() {
    phase = 'checking';
    verdictSlow = false;
    checkingSince = Date.now();
  }

  /** Puts the SDK back on screen — it needs the user again. */
  function backToCapturing() {
    phase = 'capturing';
    checkingSince = null;
  }

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

      // `invalidateAll` rather than a separate `invalidate` call: invalidating
      // before navigating re-runs *this* route's loads, which would start a
      // second challenge and redirect us somewhere we don't want to go.
      if (status.satisfied) {
        stopped = true;
        await goto(`/wave/checkpoint/success?backTo=${encodeURIComponent(backTo)}`, {
          invalidateAll: true,
        });
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
        await goto(`/wave/checkpoint?backTo=${encodeURIComponent(backTo)}`, {
          invalidateAll: true,
        });
        return;
      }
    } catch {
      // A blip shouldn't end the flow — the next tick will try again.
    }

    if (
      phase === 'checking' &&
      checkingSince !== null &&
      Date.now() - checkingSince > VERDICT_TIMEOUT_MS
    ) {
      verdictSlow = true;
      backToCapturing();
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
        startChecking();
      })
      .on('idCheck.onActionCompleted', () => {
        startChecking();
      })
      // Both mean the SDK is showing the user something they have to act on.
      .on('idCheck.onError', () => {
        backToCapturing();
      })
      .on('idCheck.onUploadError', () => {
        backToCapturing();
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
  {#if verdictSlow}
    <div class="slow-note">
      <AnnotationBox type="info">
        This is taking longer than usual. If the check is asking you to try again, follow the
        prompts — otherwise hang tight, we're still waiting on the result.
      </AnnotationBox>
    </div>
  {/if}
  <div id="sumsub-target"></div>
</div>

<style>
  .wrapper {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .slow-note {
    width: 100%;
    max-width: 38rem;
    padding: 0 2rem;
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

<script lang="ts">
  import { page } from '$app/state';
  import Button from '$lib/components/button/button.svelte';
  import cookieManager, {
    ConsentType,
  } from '$lib/components/wave/cookie-consent-banner/cookie-manager.svelte';
  import { INTERCOM_APP_ID, ensureIntercom } from '$lib/components/intercom/intercom';
  import { startSurvey } from '@intercom/messenger-js-sdk';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';
  import BubbleEmoji from '$lib/components/icons/🫧.svelte';

  const { data } = $props();

  let loading = $state(false);

  let needsConsent = $derived(
    cookieManager ? !cookieManager.consentMap[ConsentType.INTERCOM] : false,
  );

  async function handleLaunchSurvey() {
    if (!INTERCOM_APP_ID) return;

    loading = true;

    try {
      await ensureIntercom(data.user);

      startSurvey(page.params.intercomSurveyId as string);
    } finally {
      loading = false;
    }
  }
</script>

<FlowStepWrapper
  headline="We'd love your feedback"
  icon={BubbleEmoji}
  description="Help us improve Drips Wave by sharing your thoughts in a quick survey."
>
  <div class="launch">
    <Button variant="primary" size="large" onclick={handleLaunchSurvey} {loading}
      >Launch survey</Button
    >
    {#if needsConsent}
      <p class="typo-text-small consent-note">Starting the survey will enable Intercom cookies.</p>
    {/if}
  </div>
</FlowStepWrapper>

<style>
  .launch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .consent-note {
    color: var(--color-foreground-level-5);
  }
</style>

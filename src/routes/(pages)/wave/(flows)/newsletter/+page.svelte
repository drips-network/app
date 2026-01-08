<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { setNewsletterSubscription } from '$lib/utils/wave/profile';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import BubbleEmoji from '$lib/components/icons/🫧.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Settings from '$lib/components/icons/Settings.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  const { data } = $props();
  let { newsletterStatus } = $derived(data);

  let loading = $state(false);

  async function handleNewsletterToggle(enabled: boolean) {
    loading = true;
    await doWithErrorModal(
      async () => {
        await setNewsletterSubscription(enabled);
        await invalidate('wave:user:notifications-preferences');
        loading = false;
      },
      () => {
        loading = false;
      },
      enabled
        ? {
            message: 'You subscribed to the Drips Wave newsletter.',
            confetti: true,
          }
        : {
            message: 'You unsubscribed from the Drips Wave newsletter.',
            confetti: false,
          },
    );
  }

  onMount(() => {
    // if ?unsubscribe=true is present in the URL, unsubscribe the user from the newsletter
    if (page.url.searchParams.get('unsubscribe') === 'true' && newsletterStatus.isSubscribed) {
      handleNewsletterToggle(false);
    }
  });
</script>

<FlowStepWrapper
  headline="Stay up-to-date with Drips Wave"
  icon={BubbleEmoji}
  description=" Subscribe to our newsletter to receive the latest updates on Drips Wave programs, events, and more."
>
  <div class="toggle">
    <Toggle
      disabled={loading}
      checked={newsletterStatus.isSubscribed}
      onchange={handleNewsletterToggle}
      label="Receive the Drips Wave newsletter"
    />
  </div>

  <p class="typo-text-small">
    As long as the toggle is enabled, you'll occasionally receive the Drips Wave newsletter at your
    verified email address ({data.user.email}). You can unsubscribe at any time in your Notification
    settings. For more information, please review our
    <a href="/legal/privacy" class="typo-link" target="_blank">Privacy Policy</a>.
  </p>

  {#snippet actions()}
    <Button href="/wave" icon={Settings}>Review notification settings</Button>
    <Button href="/wave" icon={ArrowRight}>To the homepage</Button>
  {/snippet}
</FlowStepWrapper>

<style>
  .toggle {
    max-width: 400px;
    margin: 0 auto;
  }
</style>

<script lang="ts">
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import { onUnreadCountChange, show } from '@intercom/messenger-js-sdk';
  import QuestionCircle from '../icons/QuestionCircle.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import cookieManager, { ConsentType } from '../wave/cookie-consent-banner/cookie-manager.svelte';
  import { fade } from 'svelte/transition';
  import {
    INTERCOM_APP_ID,
    initIntercom,
    shutdownIntercom,
    isIntercomInitialized,
    ensureIntercom,
  } from './intercom';

  interface Props {
    /** In the future this will be a unified Drips account object */
    user: WaveLoggedInUser | null;
  }

  let { user }: Props = $props();

  $effect(() => {
    if (!INTERCOM_APP_ID || !cookieManager) {
      return;
    }

    const consentGiven = cookieManager.consentMap[ConsentType.INTERCOM];

    if (consentGiven) {
      initIntercom(user).then(() => {
        onUnreadCountChange((newUnreadCount: number) => {
          unreadCount = newUnreadCount;
        });
      });
    } else {
      shutdownIntercom();
    }
  });

  let unreadCount = $state(0);

  async function handleButtonClick() {
    await ensureIntercom(user);

    if (!isIntercomInitialized()) return;

    show();
  }
</script>

{#if INTERCOM_APP_ID}
  <div transition:fade={{ duration: 300 }}>
    <MiniButton
      redNumber={unreadCount}
      onclick={handleButtonClick}
      label="Get support"
      icon={QuestionCircle}
    />
  </div>
{/if}

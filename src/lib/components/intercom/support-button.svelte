<script lang="ts">
  import { getIntercomJwt, type WaveLoggedInUser } from '$lib/utils/wave/auth';
  import Intercom, { onUnreadCountChange, show, shutdown } from '@intercom/messenger-js-sdk';
  import QuestionCircle from '../icons/QuestionCircle.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import type { InitType } from '@intercom/messenger-js-sdk/dist/types';
  import cookieManager, { ConsentType } from '../wave/cookie-consent-banner/cookie-manager.svelte';
  import { fade } from 'svelte/transition';

  const INTERCOM_APP_ID = getOptionalEnvVar(
    'PUBLIC_INTERCOM_APP_ID',
    true,
    'Intercom widget will not appear',
  );

  interface Props {
    /** In the future this will be a unified Drips account object */
    user: WaveLoggedInUser | null;
  }

  let { user }: Props = $props();

  let initialized = $state(false);

  async function initIntercom(user: WaveLoggedInUser | null) {
    if (!INTERCOM_APP_ID) {
      return;
    }

    let jwt: string | null = null;

    if (user) {
      jwt = (await getIntercomJwt()).token;
    }

    const intercomSettings: InitType = {
      app_id: INTERCOM_APP_ID,
      region: 'eu',
      hide_default_launcher: true,
    };

    if (jwt) {
      intercomSettings.intercom_user_jwt = jwt;
    }

    Intercom(intercomSettings);

    onUnreadCountChange((newUnreadCount: number) => {
      unreadCount = newUnreadCount;
    });

    initialized = true;
  }

  function shutDownIntercom() {
    if (!initialized) {
      return;
    }

    shutdown();
    initialized = false;
  }

  $effect(() => {
    if (!INTERCOM_APP_ID || !cookieManager) {
      return;
    }

    const consentGiven = cookieManager.consentMap[ConsentType.INTERCOM];

    if (consentGiven) {
      initIntercom(user);
    } else {
      shutDownIntercom();
    }
  });

  let unreadCount = $state(0);

  async function handleButtonClick() {
    if (!cookieManager) return;

    // if the cookie consent for intercom is not enabled yet, we force it to on.
    // the user explicitly requested the support chat, so intercom cookies become strictly necessary.

    if (!cookieManager.consentMap[ConsentType.INTERCOM]) {
      cookieManager.setConsent(ConsentType.INTERCOM, true);
    }

    if (!initialized) {
      await initIntercom(user);
    }

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

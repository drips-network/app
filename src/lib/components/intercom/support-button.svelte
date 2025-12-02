<script lang="ts">
  import { getIntercomJwt, type WaveLoggedInUser } from '$lib/utils/wave/auth';
  import Intercom, { onUnreadCountChange } from '@intercom/messenger-js-sdk';
  import QuestionCircle from '../icons/QuestionCircle.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import type { InitType } from '@intercom/messenger-js-sdk/dist/types';

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

  function initIntercom(jwt: string | null) {
    if (!INTERCOM_APP_ID) {
      return;
    }

    const intercomSettings: InitType = {
      app_id: INTERCOM_APP_ID,
      region: 'eu',
      hide_default_launcher: true,
      custom_launcher_selector: '#intercom-support-button',
    };

    if (jwt) {
      intercomSettings.intercom_user_jwt = jwt;
    }

    Intercom(intercomSettings);

    onUnreadCountChange((newUnreadCount: number) => {
      unreadCount = newUnreadCount;
    });
  }

  $effect(() => {
    if (!INTERCOM_APP_ID) {
      return;
    }

    if (user) {
      getIntercomJwt().then((res) => {
        initIntercom(res.token);
      });
    } else {
      initIntercom(null);
    }
  });

  let unreadCount = $state(0);
</script>

{#if INTERCOM_APP_ID}
  <MiniButton
    redNumber={unreadCount}
    id="intercom-support-button"
    label="Get support"
    icon={QuestionCircle}
  />
{/if}

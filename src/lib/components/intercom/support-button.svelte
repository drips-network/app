<script lang="ts">
  import { getIntercomJwt, type WaveLoggedInUser } from '$lib/utils/wave/auth';
  import Intercom, { onUnreadCountChange } from '@intercom/messenger-js-sdk';
  import QuestionCircle from '../icons/QuestionCircle.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import { scale } from 'svelte/transition';

  interface Props {
    /** In the future this will be a unified Drips account object */
    user: WaveLoggedInUser | null;
  }

  let { user }: Props = $props();

  $effect(() => {
    if (user) {
      getIntercomJwt().then((res) => {
        Intercom({
          app_id: 'soo7r6c6',
          region: 'eu',
          hide_default_launcher: true,
          custom_launcher_selector: '#intercom-support-button',
          intercom_user_jwt: res.token,
        });
      });
    } else {
      Intercom({
        app_id: 'soo7r6c6',
        region: 'eu',
        hide_default_launcher: true,
        custom_launcher_selector: '#intercom-support-button',
      });
    }
  });

  let unreadCount = $state(0);

  onUnreadCountChange((newUnreadCount: number) => {
    unreadCount = newUnreadCount;
  });
</script>

<div class="support-button">
  <MiniButton id="intercom-support-button" label="Get support" icon={QuestionCircle} />
  {#if unreadCount > 0}
    <div
      transition:scale={{ duration: 300 }}
      class="unread-badge tnum"
      class:hidden={unreadCount === 0}
    >
      {unreadCount}
    </div>
  {/if}
</div>

<style>
  .support-button {
    position: relative;
    display: inline-block;
  }

  .unread-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    height: 1rem;
    width: 1rem;
    background: red;
    color: white;
    border-radius: 50%;
    padding: 0.2em 0.5em;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    pointer-events: none;
  }
</style>

<script lang="ts">
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import { getNovuHmac, type WaveLoggedInUser } from '$lib/utils/wave/auth';
  import { Novu, type Notification } from '@novu/js';
  import { onMount } from 'svelte';
  import Bell from '$lib/components/icons/Bell.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import Flyout from '../flyout/flyout.svelte';
  import NotificationsMenu from './components/notifications-menu.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';

  const NOVU_APP_ID = getOptionalEnvVar(
    'PUBLIC_NOVU_APP_ID',
    true,
    'Novu in-app notification widget wont render',
  );

  interface Props {
    user: WaveLoggedInUser;
  }

  let { user }: Props = $props();

  let novu: Novu | null = $state(null);
  let notifications: Notification[] = $state([]);
  let unreadCount = $state(0);

  let initialized = $state(false);

  onMount(async () => {
    if (NOVU_APP_ID) {
      let novuHmac = await getNovuHmac();

      novu = new Novu({
        subscriberId: user.id,
        applicationIdentifier: NOVU_APP_ID,
        apiUrl: 'https://eu.api.novu.co',
        socketUrl: 'wss://eu.socket.novu.co',
        subscriberHash: novuHmac.hmacHash,
      });

      // Set up event listeners
      novu.on('notifications.notification_received', ({ result: notification }) => {
        notifications = [notification, ...notifications];
      });

      novu.on('notification.read.resolved', () => {
        loadNotifications();
      });

      novu.on('notifications.unread_count_changed', (data) => {
        unreadCount = data.result.total;
      });

      // Initial load
      loadNotifications();

      initialized = true;
    }
  });

  async function loadNotifications() {
    if (!novu) return;

    try {
      const result = await novu.notifications.list({
        limit: 10,
      });

      if (result.data?.notifications) {
        notifications = result.data.notifications;
      }

      const countResult = await novu.notifications.count({ read: false });
      if (countResult.data?.count !== undefined) {
        unreadCount = countResult.data.count;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load notifications:', error);
    }
  }

  async function markAllAsRead() {
    if (!novu) return;

    try {
      await novu.notifications.readAll();
      await loadNotifications();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to mark all as read:', error);
    }
  }

  const viewWidth = $derived($breakpointsStore?.dimensions.width);
  const mobileMode = $derived(viewWidth ? viewWidth <= 1024 : false);

  function handleMobileClick() {
    if (!mobileMode) return;
    if (!user) return;

    cupertinoPaneStore.openSheet(NotificationsMenu, {
      notifications,
      unreadCount,
      markAllAsRead,
      cupertinoPaneMode: true,
    });
  }
</script>

{#if initialized}
  <Flyout disabled={mobileMode} onclickWhileDisabled={handleMobileClick} noPadding>
    {#snippet trigger()}
      <MiniButton redNumber={unreadCount} label="Notifications" icon={Bell} />
    {/snippet}

    {#snippet content()}
      <NotificationsMenu {notifications} {unreadCount} {markAllAsRead} />
    {/snippet}
  </Flyout>
{/if}

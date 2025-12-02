<script lang="ts">
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import { getNovuHmac, type WaveLoggedInUser } from '$lib/utils/wave/auth';
  import { Novu, type Notification } from '@novu/js';
  import { onMount } from 'svelte';
  import Bell from '$lib/components/icons/Bell.svelte';
  import Button from '$lib/components/button/button.svelte';
  import MiniButton from '../mini-button/mini-button.svelte';
  import Flyout from '../flyout/flyout.svelte';
  import EyeOpen from '../icons/EyeOpen.svelte';
  import Settings from '../icons/Settings.svelte';
  import NotificationItem from './components/notification-item.svelte';

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
</script>

{#if initialized}
  <Flyout noPadding>
    {#snippet trigger()}
      <MiniButton redNumber={unreadCount} label="Notifications" icon={Bell} />
    {/snippet}

    {#snippet content()}
      <div class="panel-header">
        <h2 class="pixelated">Inbox</h2>
        <div class="header-actions">
          <Button size="small" onclick={markAllAsRead} disabled={unreadCount === 0} icon={EyeOpen}
            >All read</Button
          >
          <Button size="small" icon={Settings}>Settings</Button>
        </div>
      </div>

      <div class="notifications-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <p class="typo-text" style:color="var(--color-foreground-level-6)">No notifications</p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            <NotificationItem {notification} />
          {/each}
        {/if}
      </div>
    {/snippet}
  </Flyout>
{/if}

<style>
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  .notifications-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    max-height: min(calc(100vh - 10rem), 500px);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }
</style>

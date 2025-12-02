<script lang="ts">
  import { Novu, type Notification } from '@novu/js';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import Button from '$lib/components/button/button.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import type { PageData } from './$types';
  import Email from '$lib/components/icons/Email.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Card from '$lib/components/wave/card/card.svelte';

  let { data }: { data: PageData } = $props();

  const NOVU_APP_ID = getOptionalEnvVar(
    'PUBLIC_NOVU_APP_ID',
    true,
    'Novu in-app notification widget wont render',
  );

  let novu: Novu | null = $state(null);
  let notifications: Notification[] = $state([]);
  let hasMore = $state(false);
  let loading = $state(true);
  let loadingMore = $state(false);
  let unreadCount = $state(0);
  let filter: 'all' | 'unread' | 'read' = $state('all');
  let offset = $state(0);
  const limit = 20;

  onMount(() => {
    if (NOVU_APP_ID && data.user) {
      novu = new Novu({
        subscriberId: data.user.id,
        applicationIdentifier: NOVU_APP_ID,
        apiUrl: 'https://eu.api.novu.co',
        socketUrl: 'wss://eu.socket.novu.co',
      });

      // Set up event listeners
      novu.on('notifications.notification_received', () => {
        loadNotifications(true);
      });

      novu.on('notifications.unread_count_changed', (data) => {
        unreadCount = data.result.total;
      });

      // Initial load
      loadNotifications(true);
      loadUnreadCount();
    }
  });

  let initialLoadSuccess = $state(false);

  async function loadNotifications(reset = false) {
    if (!novu) return;

    try {
      if (reset) {
        loading = true;
        offset = 0;
      } else {
        loadingMore = true;
      }

      const filterOptions: Record<string, boolean | undefined> = {};
      if (filter === 'unread') filterOptions.read = false;
      if (filter === 'read') filterOptions.read = true;

      const result = await novu.notifications.list({
        limit,
        offset: reset ? 0 : offset,
        ...filterOptions,
      });

      if (result.data?.notifications) {
        if (reset) {
          notifications = result.data.notifications;
        } else {
          notifications = [...notifications, ...result.data.notifications];
        }
      }

      hasMore = result.data?.hasMore ?? false;

      if (!reset) {
        offset += limit;
      }

      initialLoadSuccess = true;
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  async function loadUnreadCount() {
    if (!novu) return;

    try {
      const countResult = await novu.notifications.count({ read: false });
      if (countResult.data?.count !== undefined) {
        unreadCount = countResult.data.count;
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  async function markAllAsRead() {
    if (!novu) return;

    try {
      await novu.notifications.readAll();
      await loadNotifications(true);
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  function handleFilterChange(newFilter: typeof filter) {
    filter = newFilter;
    offset = 0;
    loadNotifications(true);
  }

  function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
</script>

<Section
  header={{
    label: 'Your notifications',
    icon: Email,
    actions: [
      {
        label: 'Mark all as read',
        icon: CheckCircle,
        variant: 'primary',
        disabled: false,
        handler: markAllAsRead,
      },
    ],
  }}
  skeleton={{
    loaded: initialLoadSuccess,
    empty: notifications.length === 0,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No notifications yet',
    emptyStateText: 'You will see notifications here when they arrive.',
  }}
>
  <Card style="padding: 0">
    {#each notifications as notification}
      <div class="notification-item" class:unread={!notification.read}>
        <div class="notification-content">
          <h4>{notification.subject}</h4>
          <div class="notification-message">
            {@html notification.body}
          </div>
          <div class="notification-timestamp">{formatTimestamp(notification.createdAt)}</div>
        </div>
      </div>
    {/each}
  </Card>

  {#if hasMore}
    <Button onclick={() => loadNotifications(false)} loading={loadingMore}>Load more</Button>
  {/if}
</Section>

<style>
  .notification-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    background-color: var(--color-background-level-1);
  }

  .notification-item.unread {
    background-color: var(--color-background-level-2);
  }

  .notification-content {
    display: flex;
    flex-direction: column;
  }

  .notification-message {
    margin-bottom: 0.5rem;
  }

  .notification-timestamp {
    font-size: 0.875rem;
    color: var(--color-foreground-level-6);
  }
</style>

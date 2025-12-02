<script lang="ts">
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import { Novu, type Notification } from '@novu/js';
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import Bell from '$lib/components/icons/Bell.svelte';
  import Button from '$lib/components/button/button.svelte';

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
  let isOpen = $state(false);
  let buttonElem: HTMLButtonElement | undefined = $state(undefined);
  let panelElem: HTMLDivElement | undefined = $state(undefined);

  console.log({ user })

  onMount(() => {
    if (NOVU_APP_ID && user) {
      console.log(NOVU_APP_ID);
      novu = new Novu({
        subscriberId: user.id,
        applicationIdentifier: NOVU_APP_ID,
        apiUrl: "https://eu.api.novu.co",
        socketUrl: "wss://eu.socket.novu.co",
      });

      // Set up event listeners
      novu.on('notifications.notification_received', () => {
        loadNotifications();
      });

      novu.on('notifications.unread_count_changed', (data) => {
        unreadCount = data.result.total;
      });

      // Initial load
      loadNotifications();
    }
  });

  async function loadNotifications() {
    if (!novu) return;

    try {
      const result = await novu.notifications.list({
        limit: 10,
        read: false,
      });

      if (result.data?.notifications) {
        notifications = result.data.notifications;
      }

      const countResult = await novu.notifications.count({ read: false });
      if (countResult.data?.count !== undefined) {
        unreadCount = countResult.data.count;
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  function togglePanel() {
    isOpen = !isOpen;
  }

  function handleWindowClick(event: MouseEvent) {
    if (
      panelElem &&
      buttonElem &&
      !panelElem.contains(event.target as Node) &&
      !buttonElem.contains(event.target as Node)
    ) {
      isOpen = false;
    }
  }

  async function markAllAsRead() {
    if (!novu) return;

    try {
      await novu.notifications.readAll();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!novu) return;

    try {
      if (!notification.isRead) {
        await notification.read();
      }
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  onMount(() => {
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  });
</script>

<div class="notifications-button-wrapper">
  <button
    class="notification-button"
    onclick={togglePanel}
    bind:this={buttonElem}
    aria-label="Notifications"
    aria-expanded={isOpen}
  >
    <Bell style="fill: var(--color-foreground); width: 20px; height: 20px;" />
    {#if unreadCount > 0}
      <div class="badge" transition:fade={{ duration: 200 }}>
        {unreadCount > 9 ? '9+' : unreadCount}
      </div>
    {/if}
  </button>

  {#if isOpen}
    <div
      class="notifications-panel"
      transition:fly={{ y: -8, duration: 200 }}
      bind:this={panelElem}
    >
      <div class="panel-header">
        <h3 class="typo-text-bold">Inbox</h3>
        <div class="header-actions">
          <button class="text-button typo-text-small" onclick={markAllAsRead}>All read</button>
          <button class="text-button typo-text-small">Settings</button>
        </div>
      </div>

      <div class="notifications-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <p class="typo-text" style:color="var(--color-foreground-level-6)">
              No notifications yet
            </p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            <button
              class="notification-item"
              class:unread={!notification.isRead}
              onclick={() => handleNotificationClick(notification)}
            >
              {#if !notification.isRead}
                <div class="unread-indicator"></div>
              {/if}
              <div class="notification-content">
                <p class="notification-title typo-text-bold">
                  {notification.subject || 'Notification'}
                </p>
                <p class="notification-body typo-text">
                  {notification.body || ''}
                </p>
                {#if notification.createdAt}
                  <p class="notification-time typo-text-small">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>

      {#if notifications.length > 0}
        <div class="panel-footer">
          <Button variant="ghost" href="/wave/notifications">View all</Button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .notifications-button-wrapper {
    position: relative;
  }

  .notification-button {
    position: relative;
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .notification-button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .notification-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .badge {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background-color: var(--color-negative);
    color: white;
    font-size: 0.625rem;
    font-weight: bold;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    padding: 0 0.25rem;
  }

  .notifications-panel {
    position: fixed;
    top: 4.5rem;
    right: 1rem;
    width: 28rem;
    max-width: calc(100vw - 2rem);
    max-height: calc(100vh - 6rem);
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    display: flex;
    flex-direction: column;
    z-index: 1000;
  }

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

  .text-button {
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }

  .text-button:hover {
    background-color: var(--color-primary-level-1);
  }

  .notifications-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }

  .notification-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: left;
    width: 100%;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
  }

  .notification-item:hover {
    background-color: var(--color-foreground-level-1);
  }

  .notification-item:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item.unread {
    background-color: var(--color-primary-level-1);
  }

  .unread-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.375rem;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    margin-bottom: 0.25rem;
    color: var(--color-foreground);
  }

  .notification-body {
    margin-bottom: 0.25rem;
    color: var(--color-foreground-level-6);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .notification-time {
    color: var(--color-foreground-level-6);
  }

  .panel-footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-foreground-level-3);
    display: flex;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .notifications-panel {
      right: 0.5rem;
      width: calc(100vw - 1rem);
    }
  }
</style>

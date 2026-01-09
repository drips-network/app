<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Settings from '$lib/components/icons/Settings.svelte';
  import type { Notification } from '@novu/js';
  import NotificationItem from './notification-item.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';

  let {
    markAllAsRead,
    notifications,
    unreadCount,
    cupertinoPaneMode,
  }: {
    markAllAsRead: () => void;
    notifications: Notification[];
    unreadCount: number;
    cupertinoPaneMode?: boolean;
  } = $props();
</script>

<div class="panel-header">
  <h2 class="pixelated">Inbox</h2>
  <div class="header-actions">
    <Button size="small" onclick={markAllAsRead} disabled={unreadCount === 0} icon={EyeOpen}
      >All read</Button
    >
    <Button size="small" href="/wave/settings/notifications" icon={Settings}>Settings</Button>
  </div>
</div>

<div class="notifications-list" class:cupertinoPaneMode>
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

  .notifications-list.cupertinoPaneMode {
    max-height: none;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }
</style>

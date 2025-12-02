<script lang="ts">
  import type { Notification } from '@novu/js';
  import formatTimestamp from '../format-timestamp';
  import Button from '$lib/components/button/button.svelte';
  import ArrowUpRight from '$lib/components/icons/ArrowUpRight.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';

  let { notification }: { notification: Notification } = $props();

  let markingAsRead = $state(false);

  async function handleMarkRead() {
    markingAsRead = true;

    // Mark the notification as read
    if (notification && !notification.isRead) {
      try {
        await notification.read();
      } finally {
        markingAsRead = false;
      }
    }
  }
</script>

{#key notification.id}
  <div class="notification-item" class:unread={!notification.isRead}>
    {#if !notification.isRead}
      <div class="unread-indicator"></div>
    {/if}
    <div class="notification-content">
      <div class="notification-header">
        <h4 class="notification-title typo-text-small-bold">
          {notification.subject || 'Notification'}
        </h4>
        <span class="notification-time typo-text-small">
          {formatTimestamp(notification.createdAt)}
        </span>
      </div>

      <p class="notification-body typo-text-small">
        {notification.body || ''}
      </p>

      <div class="actions">
        {#if notification.primaryAction && notification.primaryAction?.redirect?.url}
          <Button
            variant="primary"
            size="small"
            icon={ArrowUpRight}
            href={notification.primaryAction.redirect.url}
            target={notification.primaryAction.redirect.target || '_self'}
          >
            {notification.primaryAction.label}
          </Button>
        {/if}

        {#if !notification.isRead}
          <Button
            loading={markingAsRead}
            icon={EyeOpen}
            variant="ghost"
            size="small"
            onclick={handleMarkRead}
          >
            Mark read
          </Button>
        {/if}
      </div>

      {#if notification.createdAt}{/if}
    </div>
  </div>
{/key}

<style>
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

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .notification-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .notification-title {
    color: var(--color-foreground);
  }

  .notification-body {
    color: var(--color-foreground-level-6);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 5;
  }

  .notification-time {
    font-size: 0.75rem;
    white-space: nowrap;
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    gap: 0.25rem;
  }

  .unread-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.375rem;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';

  type Status = 'loading' | 'operational' | 'degraded' | 'down' | 'unknown';

  const LABELS: Record<Status, string> = {
    loading: 'Checking…',
    operational: 'All good',
    degraded: 'Degraded',
    down: 'Outage',
    unknown: 'Status unknown',
  };

  let status = $state<Status>('loading');

  onMount(async () => {
    try {
      const res = await fetch('https://status.drips.network/status.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`status.json ${res.status}`);
      const { overall } = await res.json();
      status = (['operational', 'degraded', 'down'] as const).includes(overall)
        ? overall
        : 'unknown';
    } catch {
      status = 'unknown';
    }
  });
</script>

<div class="system-status-badge {status}">
  <div class="status-circle"></div>
  <span class="typo-text-small">{LABELS[status]}</span>
</div>

<style>
  .system-status-badge {
    width: fit-content;
    padding: 0.2rem 0.5rem;
    display: inline-flex;
    border-radius: 1rem 0 1rem 1rem;
    gap: 0.5rem;
    align-items: center;
    /* Neutral default — used for loading + unknown states. */
    color: var(--color-foreground-level-6);
    background-color: var(--color-foreground-level-2);
  }

  .status-circle {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 50%;
    background-color: var(--color-foreground-level-6);
  }

  .system-status-badge.operational {
    color: var(--color-positive-level-6);
    background-color: var(--color-positive-level-1);
  }
  .system-status-badge.operational .status-circle {
    background-color: var(--color-positive-level-6);
  }

  .system-status-badge.degraded {
    color: var(--color-caution-level-6);
    background-color: var(--color-caution-level-1);
  }
  .system-status-badge.degraded .status-circle {
    background-color: var(--color-caution-level-6);
  }

  .system-status-badge.down {
    color: var(--color-negative-level-6);
    background-color: var(--color-negative-level-1);
  }
  .system-status-badge.down .status-circle {
    background-color: var(--color-negative-level-6);
  }
</style>

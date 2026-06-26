<script lang="ts">
  import { onMount } from 'svelte';
  import { z } from 'zod';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import CrossSmall from '$lib/components/icons/CrossSmall.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';

  const STATUS_URL = 'https://status.drips.network/status.json';

  const incidentSchema = z.object({
    id: z.string().nullable().optional(),
    title: z.string(),
    severity: z.string().optional(),
    status: z.string().optional(),
    startedAt: z.string().optional(),
  });

  const statusSchema = z.object({
    incidents: z
      .object({
        active: z.array(incidentSchema).optional(),
      })
      .optional(),
  });

  type Incident = z.infer<typeof incidentSchema>;

  let active = $state<Incident[]>([]);

  // A stable per-incident key so dismissing one incident doesn't dismiss future
  // ones. Falls back to title + start time when the incident has no id.
  function dismissId(incident: Incident): string {
    return `incident-banner-${incident.id ?? `${incident.title}-${incident.startedAt ?? ''}`}`;
  }

  // Show a single banner at a time so its height stays predictable (sub-app
  // headers offset themselves by a fixed --incident-banner-height).
  let current = $derived(
    active.filter((i) => !$dismissablesStore.includes(dismissId(i)))[0] ?? null,
  );

  // Toggle a root class so headers/content can offset below the fixed banner.
  $effect(() => {
    document.documentElement.classList.toggle('incident-banner-visible', Boolean(current));
    return () => document.documentElement.classList.remove('incident-banner-visible');
  });

  function dismiss(incident: Incident) {
    dismissablesStore.dismiss(dismissId(incident));
  }

  onMount(async () => {
    try {
      const res = await fetch(STATUS_URL, { cache: 'no-store' });
      if (!res.ok) return;
      const parsed = statusSchema.safeParse(await res.json());
      if (!parsed.success) return;
      active = parsed.data.incidents?.active ?? [];
    } catch {
      // Status page unreachable — fail silent; a banner is best-effort.
    }
  });
</script>

{#if current}
  {@const incident = current}
  <div class="incident-banner typo-text-small" role="alert">
    <div class="content">
      <div class="message">
        <ExclamationCircle style="height: 1rem; width: 1rem; fill: currentColor; flex-shrink: 0;" />
        <span class="title">{incident.title}</span>
      </div>
      <a
        class="status-link"
        href="https://status.drips.network"
        target="_blank"
        rel="noopener noreferrer"
      >
        View status
      </a>
    </div>
    <button class="dismiss" aria-label="Dismiss" onclick={() => dismiss(incident)}>
      <CrossSmall style="height: 1rem; width: 1rem; fill: currentColor;" />
    </button>
  </div>
{/if}

<style>
  .incident-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--incident-banner-height);
    z-index: 100;
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
    padding: 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
    view-transition-name: incident-banner;
  }

  /* Fills the space left of the dismiss button and centres its children. */
  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  /* Icon + title; the title is the only part allowed to shrink/ellipsise. */
  .message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    max-width: 100%;
  }

  .title {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Never shrinks or wraps, so "View status" is never cut off. */
  .status-link {
    flex-shrink: 0;
    white-space: nowrap;
    color: inherit;
    font-weight: bold;
    text-decoration: underline;
  }

  .status-link:hover {
    opacity: 0.8;
  }

  .dismiss {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .dismiss:hover {
    background-color: var(--color-negative-level-2);
  }

  /* Two lines on mobile: message on top, "View status" below. */
  @media (max-width: 768px) {
    .content {
      flex-direction: column;
      gap: 0.125rem;
    }
  }
</style>

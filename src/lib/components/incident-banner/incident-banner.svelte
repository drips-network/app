<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { z } from 'zod';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import Calendar from '$lib/components/icons/Calendar.svelte';
  import CrossSmall from '$lib/components/icons/CrossSmall.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';

  const STATUS_URL = 'https://status.drips.network/status.json';

  // The status page groups its components; this is the group holding the Wave
  // components (Wave App, Wave API, …). Incidents affecting anything in it are
  // treated as Wave-affecting.
  const WAVE_GROUP = 'Drips Wave';

  // How far ahead of a maintenance window we start announcing it. Earlier than
  // this and the banner is just noise the user can't act on yet.
  const MAINTENANCE_LEAD_MS = 48 * 60 * 60 * 1000;

  const incidentSchema = z.object({
    id: z.string().nullable().optional(),
    title: z.string(),
    severity: z.string().optional(),
    status: z.string().optional(),
    startedAt: z.string().optional(),
    affected: z.array(z.string()).optional(),
  });

  // Scheduled maintenance. `status` is the window's phase, derived from the
  // clock by the status page: scheduled (upcoming) | in_progress | completed.
  // Only the first two ever appear in `maintenance.active`.
  const maintenanceSchema = incidentSchema.extend({
    scheduled: z.object({ start: z.string(), end: z.string() }),
  });

  const statusSchema = z.object({
    incidents: z
      .object({
        active: z.array(incidentSchema).optional(),
      })
      .optional(),
    maintenance: z
      .object({
        active: z.array(maintenanceSchema).optional(),
      })
      .optional(),
    groups: z
      .array(
        z.object({
          name: z.string(),
          components: z.array(z.object({ name: z.string() })).optional(),
        }),
      )
      .optional(),
  });

  type Incident = z.infer<typeof incidentSchema>;
  type Maintenance = z.infer<typeof maintenanceSchema>;

  let active = $state<Incident[]>([]);
  let maintenance = $state<Maintenance[]>([]);
  // Names of the components in the Wave group, sourced from the status feed so
  // it can't drift out of sync as components are renamed/added.
  let waveComponents = $state<Set<string>>(new Set());

  let onWaveRoute = $derived(page.url.pathname.startsWith('/wave'));

  function isWaveIncident(incident: Incident): boolean {
    return incident.affected?.some((c) => waveComponents.has(c)) ?? false;
  }

  // Non-minor incidents warrant a banner site-wide. Minor incidents are normally
  // noise, but a minor incident affecting a Wave component still warrants one
  // while the user is in the Wave app, where that disruption is directly
  // relevant. Incidents without a severity are treated as non-minor.
  function warrantsBanner(incident: Incident): boolean {
    if (incident.severity?.toLowerCase() !== 'minor') return true;
    return onWaveRoute && isWaveIncident(incident);
  }

  // Maintenance is worth a banner while it runs, and from MAINTENANCE_LEAD_MS
  // before it opens. A window touching only Wave is only shown inside Wave —
  // elsewhere it's about a service the user isn't currently on.
  function warrantsMaintenanceBanner(m: Maintenance): boolean {
    const start = new Date(m.scheduled.start).getTime();
    if (!Number.isFinite(start)) return false;
    if (m.status !== 'in_progress' && start - Date.now() > MAINTENANCE_LEAD_MS) return false;
    const affected = m.affected ?? [];
    const waveOnly = affected.length > 0 && affected.every((c) => waveComponents.has(c));
    return !waveOnly || onWaveRoute;
  }

  // A stable per-entry key so dismissing one doesn't dismiss future ones. For
  // maintenance the phase is part of the key, so dismissing the heads-up doesn't
  // also suppress the banner once the window actually opens. Falls back to
  // title + start time when the entry has no id.
  function dismissId(entry: Incident): string {
    const base = entry.id ?? `${entry.title}-${entry.startedAt ?? ''}`;
    return `incident-banner-${base}${isMaintenance(entry) ? `-${entry.status}` : ''}`;
  }

  function isMaintenance(entry: Incident): entry is Maintenance {
    return 'scheduled' in entry;
  }

  // Show a single banner at a time so its height stays predictable (sub-app
  // headers offset themselves by a fixed --incident-banner-height). An actual
  // incident always outranks a maintenance notice.
  let current = $derived(
    active.filter((i) => warrantsBanner(i) && !$dismissablesStore.includes(dismissId(i)))[0] ??
      maintenance.filter(
        (m) => warrantsMaintenanceBanner(m) && !$dismissablesStore.includes(dismissId(m)),
      )[0] ??
      null,
  );

  // "Aug 20, 02:00–04:00 UTC" — the same UTC framing the status page uses, so
  // the two never disagree about which window is meant.
  function fmtWindow(startIso: string, endIso: string): string {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return '';
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const hhmm = (d: Date) =>
      `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    const day = (d: Date) => `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
    return s.toISOString().slice(0, 10) === e.toISOString().slice(0, 10)
      ? `${day(s)}, ${hhmm(s)}–${hhmm(e)} UTC`
      : `${day(s)}, ${hhmm(s)} – ${day(e)}, ${hhmm(e)} UTC`;
  }

  // Toggle a root class so headers/content can offset below the fixed banner.
  $effect(() => {
    document.documentElement.classList.toggle('incident-banner-visible', Boolean(current));
    return () => document.documentElement.classList.remove('incident-banner-visible');
  });

  function dismiss(incident: Incident) {
    dismissablesStore.dismiss(dismissId(incident));
  }

  async function checkStatus() {
    try {
      const res = await fetch(STATUS_URL, { cache: 'no-store' });
      if (!res.ok) return;
      const parsed = statusSchema.safeParse(await res.json());
      if (!parsed.success) return;
      waveComponents = new Set(
        (parsed.data.groups ?? [])
          .filter((g) => g.name === WAVE_GROUP)
          .flatMap((g) => g.components ?? [])
          .map((c) => c.name),
      );
      active = parsed.data.incidents?.active ?? [];
      maintenance = parsed.data.maintenance?.active ?? [];
    } catch {
      // Status page unreachable — fail silent; a banner is best-effort.
    }
  }

  onMount(() => {
    // Deferred to idle time so the status request doesn't compete with
    // render-critical work during page load. The banner is position: fixed,
    // so appearing late causes no layout shift.
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => void checkStatus());
    } else {
      setTimeout(() => void checkStatus(), 2000);
    }
  });
</script>

{#if current}
  {@const incident = current}
  {@const maint = isMaintenance(incident)}
  <div
    class="incident-banner typo-text-small"
    class:maintenance={maint}
    role={maint ? 'status' : 'alert'}
  >
    <div class="content">
      <div class="message">
        {#if maint}
          <Calendar style="height: 1rem; width: 1rem; fill: currentColor; flex-shrink: 0;" />
          <span class="title">
            {incident.status === 'in_progress'
              ? 'Maintenance in progress'
              : 'Scheduled maintenance'}:
            {incident.title}
          </span>
          <span class="when">{fmtWindow(incident.scheduled.start, incident.scheduled.end)}</span>
        {:else}
          <ExclamationCircle
            style="height: 1rem; width: 1rem; fill: currentColor; flex-shrink: 0;"
          />
          <span class="title">{incident.title}</span>
        {/if}
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

  /* Planned work is neither an outage nor "all good", so it drops the red and
     reads neutral — matching how status.drips.network renders maintenance. */
  .incident-banner.maintenance {
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
  }

  .incident-banner.maintenance .dismiss:hover {
    background-color: var(--color-foreground-level-3);
  }

  /* The scheduled window, secondary to the title — dropped on narrow screens
     where the two-line layout has no room for it. */
  .when {
    flex-shrink: 0;
    white-space: nowrap;
    opacity: 0.75;
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

    .when {
      display: none;
    }
  }
</style>

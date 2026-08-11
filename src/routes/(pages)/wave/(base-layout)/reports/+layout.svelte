<script lang="ts">
  import type { Snippet } from 'svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import ScrollableTabs from '$lib/components/scrollable-tabs/scrollable-tabs.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Graph from '$lib/components/icons/Graph.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import formatDate from '$lib/utils/format-date';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps & { children: Snippet } = $props();
  let { wavePrograms, selectedWaveProgramId, waves, selectedWaveId } = $derived(data);

  let programDropdownOptions = $derived(
    wavePrograms.map((wp) => ({
      value: wp.id,
      title: `${wp.name} Wave`,
    })),
  );

  let waveDropdownOptions = $derived(
    waves.map((wave) => ({
      value: wave.id,
      title: `Wave ${wave.waveNumber} · ${formatDate(wave.startDate, 'short')}${
        wave.status === 'active' ? ' (active)' : wave.status === 'upcoming' ? ' (upcoming)' : ''
      }`,
    })),
  );

  // Tab hrefs carry the current selection params so switching tabs keeps the
  // selected program, wave, and org.
  let tabs = $derived([
    {
      label: 'Contributor',
      href: `/wave/reports/contributor${page.url.search}`,
      icon: User,
    },
    {
      label: 'Maintainer',
      href: `/wave/reports/maintainer${page.url.search}`,
      icon: Orgs,
    },
  ]);

  function updateParams(overrides: Record<string, string | undefined>) {
    const params = new SvelteURLSearchParams(page.url.search);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    goto(`${page.url.pathname}?${params.toString()}`, { keepFocus: true });
  }

  function handleWaveProgramChange(value: string) {
    updateParams({ waveProgramId: value, waveId: undefined });
  }

  function handleWaveChange(value: string) {
    updateParams({ waveId: value });
  }
</script>

<HeadMeta title="Reports | Wave" />

<div class="reports-page">
  <div class="page-header">
    {#snippet headerInfoTooltip()}
      After each wave's review period ends, we generate performance reports summarizing the feedback
      and key stats — a personal one for every participating contributor, and an org-wide one
      visible to all members of participating orgs.
    {/snippet}
    <div style:view-transition-name="reports-header" style:view-transition-class="element-handover">
      <SectionHeader icon={Graph} label="Reports" infoTooltipContent={headerInfoTooltip} />
    </div>
    <div
      class="selectors"
      style:view-transition-name="reports-selectors"
      style:view-transition-class="element-handover"
    >
      {#if wavePrograms.length > 1}
        <Dropdown
          small
          options={programDropdownOptions}
          value={selectedWaveProgramId}
          onchange={handleWaveProgramChange}
        />
      {/if}
      {#if waves.length > 0}
        <Dropdown
          small
          options={waveDropdownOptions}
          value={selectedWaveId ?? undefined}
          onchange={handleWaveChange}
        />
      {/if}
    </div>
  </div>

  <div class="tabs">
    <ScrollableTabs {tabs} />
  </div>

  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .reports-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .selectors {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    /* view-transition-name creates a stacking context at z-index auto; lift
       it above the sticky tab bar (z-index 2) so open dropdown options
       aren't painted behind it. */
    position: relative;
    z-index: 3;
  }

  .tabs {
    position: sticky;
    top: calc(3.5rem + var(--incident-banner-offset, 0px));
    width: 100%;
    background-color: var(--color-background);
    z-index: 2;
  }

  .content {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    .tabs {
      top: calc(2.5rem + var(--incident-banner-offset, 0px));
    }
  }
</style>

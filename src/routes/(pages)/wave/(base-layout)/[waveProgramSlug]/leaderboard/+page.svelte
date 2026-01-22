<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import CoinAnimation from '$lib/components/coin-animation/coin-animation.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import { getLeaderboard } from '$lib/utils/wave/leaderboard.js';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Snapshot } from '../$types.js';

  let { data } = $props();
  const { leaderboard: initialLeaderboard, waveProgram, filters } = $derived(data);

  // pagination
  // svelte-ignore state_referenced_locally
  let entries = $state(initialLeaderboard.data);
  // svelte-ignore state_referenced_locally
  let pagination = $state(initialLeaderboard.pagination);
  let isLoadingMore = $state(false);

  // when initialLeaderboard changes, reset entries and pagination
  $effect(() => {
    entries = initialLeaderboard.data;
    pagination = initialLeaderboard.pagination;
  });

  let fetchTriggerElem = $state<HTMLDivElement>();

  function isTriggerInViewport(elem: HTMLDivElement) {
    const rect = elem.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  async function getMoreEntries() {
    if (isLoadingMore || !pagination.hasNextPage) return;

    isLoadingMore = true;

    try {
      const nextPage = pagination.page + 1;
      const newEntries = await getLeaderboard(undefined, filters, {
        page: nextPage,
        limit: 20,
      });

      entries = [...entries, ...newEntries.data];
      pagination = newEntries.pagination;

      // retrigger if still in viewport
      if (fetchTriggerElem && isTriggerInViewport(fetchTriggerElem) && pagination.hasNextPage) {
        setTimeout(() => {
          getMoreEntries();
        }, 200);
      }
    } finally {
      isLoadingMore = false;
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (observerEntries) => {
        observerEntries.forEach((entry) => {
          if (entry.isIntersecting) {
            getMoreEntries();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );

    if (fetchTriggerElem) {
      observer.observe(fetchTriggerElem);
    }

    return () => {
      if (fetchTriggerElem) {
        observer.unobserve(fetchTriggerElem);
      }
    };
  });

  // restore data on navigation back
  export const snapshot: Snapshot<{
    entries: typeof entries;
    pagination: typeof pagination;
    scrollPos: number;
  }> = {
    capture: () => {
      return {
        entries,
        pagination,
        scrollPos: window.scrollY,
      };
    },
    restore: (snapshotData) => {
      entries = snapshotData.entries;
      pagination = snapshotData.pagination;

      setTimeout(() => {
        window.scrollTo({
          top: snapshotData.scrollPos,
          behavior: 'instant',
        });
      }, 0);
    },
  };

  let moreThanOne = $derived(pagination.total !== 1);

  let isEmpty = $derived(pagination.total === 0);
</script>

<HeadMeta
  title="Leaderboard | {waveProgram.name}"
  description="View the leaderboard for the {waveProgram.name} Wave Program."
/>

<div class="page">
  <Breadcrumbs
    crumbs={[
      { label: 'Wave Programs', href: '/wave' },
      { label: waveProgram.name, href: `/wave/${waveProgram.slug}` },
      { label: 'Leaderboard', href: '' },
    ]}
  />

  <div class="hero">
    <div style:flex-grow="1">
      <SectionHeader icon={Trophy} label="Leaderboard" />
    </div>

    <div class="filter-control">
      <Dropdown
        options={[
          { value: 'all-time', title: 'All Time' },
          { value: 'current-wave', title: 'Latest Wave' },
        ]}
        value={data.currentWaveOnly ? 'current-wave' : 'all-time'}
        onchange={(val) => {
          if (val === 'current-wave') {
            goto(page.url.pathname + '?filter=current-wave');
          } else {
            goto(page.url.pathname);
          }
        }}
      />
    </div>
  </div>

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
    {#if isEmpty}
      No users have earned points yet. Participate in the {waveProgram.name} Wave Program to start earning
      points!
    {:else}
      Showing {pagination.total} user{moreThanOne ? 's' : ''} who {moreThanOne ? 'have' : 'has'} earned
      Points in {#if data.currentWaveOnly}the latest Wave.{:else}all {waveProgram.name} Waves.{/if}
    {/if}
  </span>

  <div class="leaderboard">
    {#each entries as { user, totalPoints }, index (user.id)}
      <div
        in:fade={{ duration: 200 }}
        class="entry typo-text"
        class:first={index === 0}
        class:second={index === 1}
        class:third={index === 2}
      >
        <div class="index">
          <CoinAnimation playSound enable={index < 3} animateOnMount={index === 0}>
            <div class="index-inner">
              {index + 1}
            </div>
          </CoinAnimation>
        </div>

        <div class="user">
          <GithubUserBadge size={index < 3 ? 48 : 32} {user} />
        </div>

        <span class="points typo-text tnum">{totalPoints}</span>
      </div>

      {#if index === 2}
        <div class="spacer"></div>
      {/if}
    {/each}
  </div>
  <div bind:this={fetchTriggerElem} class="fetch-trigger">
    {#if pagination.hasNextPage}
      <Spinner />
    {/if}
  </div>
</div>

<style>
  .page {
    display: flex;
    max-width: 48rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .intro {
    max-width: 36rem;
  }

  .leaderboard {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-control {
    min-width: 10rem;
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .entry {
    padding: 0.25rem;
    margin: -0.25rem;
    border-radius: 3rem 0 3rem 3rem;
    transition: background-color 0.2s;
  }

  .entry:hover {
    background-color: var(--color-foreground-level-1);
  }

  .entry .index {
    width: 2rem;
    height: 2rem;
  }

  .entry .index-inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-foreground-level-2);
    border-radius: 1.5rem;
  }

  .entry.first .index-inner {
    background-color: #fff5e2;
    color: #9f6e0b;
    font-weight: bold;
  }

  .entry.second .index-inner {
    background-color: #e8f4ff;
    color: #344054;
    font-weight: bold;
    border-radius: 1.5rem;
  }

  .entry.third .index-inner {
    background-color: #d89c60;
    color: #5c3814;
    font-weight: bold;
    border-radius: 1.5rem;
  }

  .entry.first .index,
  .entry.second .index,
  .entry.third .index {
    font-weight: bold;
    height: 3rem;
    width: 3rem;
    font-size: 1.25rem;
  }

  .entry .user {
    flex-grow: 1;
  }

  .entry .points {
    margin-right: 0.25rem;
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .spacer {
    height: 0.5rem;
  }

  .fetch-trigger {
    display: flex;
    height: 2rem;
    justify-content: center;
  }
</style>

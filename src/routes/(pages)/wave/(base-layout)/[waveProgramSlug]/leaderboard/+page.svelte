<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import CoinAnimation from '$lib/components/coin-animation/coin-animation.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';

  let { data } = $props();

  let moreThanOne = $derived(data.leaderboard.pagination.total !== 1);

  let isEmpty = $derived(data.leaderboard.pagination.total === 0);
</script>

<div class="page">
  <Breadcrumbs
    crumbs={[
      { label: 'Wave Programs', href: '/wave' },
      { label: data.waveProgram.name, href: `/wave/${data.waveProgram.slug}` },
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
      No users have earned points yet. Participate in the {data.waveProgram.name} Wave Program to start
      earning points!
    {:else}
      Showing {data.leaderboard.pagination.total} user{moreThanOne ? 's' : ''} who {moreThanOne
        ? 'have'
        : 'has'} earned points in {#if data.currentWaveOnly}the latest Wave.{:else}all {data
          .waveProgram.name} Waves.{/if}

      At the end of each Wave, rewards are distributed to each contributor according to the share of
      the total points earned during that Wave.
    {/if}
  </span>

  <div class="leaderboard">
    {#each data.leaderboard.data as { user, totalPoints }, index (user.id)}
      <div
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
</style>

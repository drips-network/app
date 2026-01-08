<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */

  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import type { LeaderboardEntryDto } from '$lib/utils/wave/types/leaderboard';
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import type { Component, ComponentProps } from 'svelte';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';

  let {
    waveProgram,
    leaderboard,
  }: {
    waveProgram: WaveProgramDto;
    leaderboard: {
      totalCount: number;
      firstThreeEntries: LeaderboardEntryDto[];
    };
  } = $props();

  type ComponentAndProps<C extends Component<any>> = {
    component: C;
    props: ComponentProps<C>;
  };

  interface Stat<CT extends Component<any> = Component<any>> {
    key: string;
    value: number | string | ComponentAndProps<CT>;
    tooltip?: string;
    href?: string;
  }

  let stats = $derived<Stat[]>([
    {
      key: 'Issues',
      value: waveProgram.issueCount,
      href: `/wave/${waveProgram.slug}/issues`,
    },
    {
      key: 'Repos',
      value: waveProgram.approvedRepoCount,
      href: `/wave/${waveProgram.slug}/repos`,
    },
    {
      key: 'Maintainers',
      value: waveProgram.approvedOrgCount,
      tooltip: 'Count of orgs and users approved to add their issues into the Wave Program.',
    },
    {
      key: 'Leaderboard',
      value:
        leaderboard.totalCount === 0
          ? 'Empty'
          : {
              component: Pile,
              props: {
                maxItems: 3,
                countOverride: leaderboard.totalCount,
                components: leaderboard.firstThreeEntries.map(({ user }) => ({
                  component: GithubUserBadge,
                  props: {
                    user,
                    link: false,
                    hideName: true,
                  },
                })),
              },
            },
      href: `/wave/${waveProgram.slug}/leaderboard?filter=current-wave`,
    },
    {
      key: 'Waves',
      value: waveProgram.waveCount,
      tooltip: 'Count of current and past Waves in the Wave Program.',
    },
  ]);
</script>

{#snippet stat(
  key: string,
  value: number | string | ComponentAndProps<any>,
  tooltip?: string,
  href?: string,
)}
  <svelte:element this={href ? 'a' : 'div'} class="wave-stat" {href}>
    <div class="header">
      <h5>{key}</h5>

      {#if tooltip}
        <Tooltip>
          <InfoCircle style="width: 16px; height: 16px;" />

          {#snippet tooltip_content()}
            <p class="typo-text">{tooltip}</p>
          {/snippet}
        </Tooltip>
      {/if}

      {#if href}
        <div class="right">
          <ChevronRight />
        </div>
      {/if}
    </div>

    {#if typeof value === 'string' || typeof value === 'number'}
      <p class="value typo-text">{value}</p>
    {:else}
      <value.component {...value.props} />
    {/if}
  </svelte:element>
{/snippet}

<div class="wave-stats">
  {#each stats as { key, value, tooltip, href } (key)}
    {@render stat(key, value, tooltip, href)}
  {/each}
</div>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .header h5 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--color-foreground-level-6);
  }

  .header .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    color: var(--color-foreground-level-5);
  }

  .value {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .wave-stats {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .wave-stat {
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    box-shadow: var(--elevation-low);
    padding: 0.25rem 0.5rem;
    transition:
      box-shadow 0.2s,
      transform 0.2s;
  }

  a.wave-stat:hover:not(:active),
  a.wave-stat:focus-visible:not(:active) {
    box-shadow: var(--elevation-medium);
    transform: translateY(-4px);
  }
</style>

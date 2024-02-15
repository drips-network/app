<script lang="ts">
  import BoxIcon from 'radicle-design-system/icons/Box.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import TrophyIcon from 'radicle-design-system/icons/Trophy.svelte';
  import EtherscanIcon from 'radicle-design-system/icons/Etherscan.svelte';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { PageData } from './$types';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import { goto } from '$app/navigation';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import { PUBLIC_NETWORK } from '$env/static/public';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import EyeOpen from 'radicle-design-system/icons/EyeOpen.svelte';
  import DripList from 'radicle-design-system/icons/DripList.svelte';

  const FEATURED_PROJECT_ACCOUNT_IDS =
    {
      1: [
        '80921576051643469277397866636792942368647018452892810554457309839360',
        '80928956806149918791864723629668437820661066502202314166815319654400',
        '80989205010981758696261160004449877944077887004065826078532843448906',
        '80921140646830818724035150101819719966329403614944137690624336855040',
      ],
      5: [
        '81084611675088797239845552682012929720024883823846356540336220583709',
        '80921553623925136102837120782793736893291544351678576578072673071411',
        '81084953153801269804906196669849986124054336368266435383120426750828',
        '80921553623925136102837120782793736893291544351678576578072673072128',
      ],
    }[PUBLIC_NETWORK] ?? [];

  export let data: PageData;

  $: projects = data.projects;
  $: featuredProjects = projects.filter((p) =>
    FEATURED_PROJECT_ACCOUNT_IDS.includes(p.account.accountId),
  );

  // 2 latest posts. Sort by date
  $: blogPosts = data.blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  // Last 4 projects. TODO: sort by claim date
  $: recentlyClaimedProjects = projects.slice(-4);

  function numberWithCommas(input: number) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let totalDrippedAmounts: ReturnType<typeof totalDrippedApproximation>;
  function update() {
    totalDrippedAmounts = totalDrippedApproximation();
  }
  update();

  let tickHandle: number;
  onMount(async () => {
    tickHandle = tickStore.register(update);
  });
  onDestroy(() => {
    tickStore.deregister(tickHandle);
  });
</script>

<HeadMeta title="Explore" />

<div class="explore">
  <Section
    header={{
      icon: TrophyIcon,
      label: 'Stats',
    }}
    skeleton={{
      loaded: true,
      horizontalScroll: false,
    }}
  >
    <div class="stats">
      <div class="value-wrapper">
        <div class="header">
          <h5>Total dripped</h5>
        </div>
        <span class="large-number pixelated"
          ><AggregateFiatEstimate amounts={totalDrippedAmounts} /></span
        >
      </div>
      <div class="value-wrapper">
        <a
          href="https://etherscan.io/address/0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4"
          target="_blank"
          rel="noreferrer"
          class="header"
        >
          <h5>Total value on Drips</h5>
          <EtherscanIcon />
        </a>
        <span class="large-number pixelated">${numberWithCommas(Math.round(data.tlv))}</span>
      </div>
    </div>
  </Section>

  <Section
    header={{
      icon: BoxIcon,
      label: 'Featured projects',
      actions: [
        {
          label: 'See all',
          handler: () => goto('/app/projects/all'),
          icon: Box,
        },
      ],
    }}
    skeleton={{
      loaded: true,
    }}
  >
    <div class="projects-grid">
      {#each featuredProjects as project}
        <div>
          {#if project.__typename === 'ClaimedProject'}
            <PrimaryColorThemer colorHex={project.color}>
              <ProjectCard {project} />
            </PrimaryColorThemer>
          {/if}
        </div>
      {/each}
    </div>
  </Section>

  <Section
    header={{
      icon: DripListIcon,
      label: 'Featured Drip Lists',
      actions: [
        {
          label: 'See all',
          handler: () => goto('/app/drip-lists/all'),
          icon: DripList,
        },
      ],
    }}
    skeleton={{
      loaded: true,
    }}
  >
    <div class="posts-grid">
      {#each data.featuredDripLists as dripList}
        <DripListCard format="thumblink" {dripList} />
      {/each}
    </div>
  </Section>

  <Section
    header={{
      icon: BoxIcon,
      label: 'Recently claimed projects',
      actions: [
        {
          label: 'See all',
          handler: () => goto('/app/projects/all'),
          icon: Box,
        },
      ],
    }}
    skeleton={{ loaded: true }}
  >
    <div class="projects-grid">
      {#each recentlyClaimedProjects as project}
        <div>
          {#if project.__typename === 'ClaimedProject'}
            <PrimaryColorThemer colorHex={project.color}>
              <ProjectCard {project} />
            </PrimaryColorThemer>
          {/if}
        </div>
      {/each}
    </div>
  </Section>

  <Section
    header={{
      icon: PenIcon,
      label: 'Latest news',
      actions: [
        {
          label: 'Read the blog',
          handler: () => goto('/blog'),
          icon: EyeOpen,
        },
      ],
    }}
    skeleton={{ loaded: true, horizontalScroll: false }}
  >
    <div class="posts-grid">
      {#each blogPosts as post}
        <PostCard newTab compact {...post} />
      {/each}
    </div>
  </Section>

  {#if !$walletStore.connected}
    <EduCard>
      <svelte:fragment slot="text">
        <p>
          Connect your Ethereum wallet to claim your open-source project, create a Drip List, and
          more.
        </p>
      </svelte:fragment>
      <svelte:fragment slot="buttons">
        <Button icon={WalletIcon} variant="primary" on:click={() => walletStore.connect()}
          >Connect your wallet</Button
        >
      </svelte:fragment>
      <svelte:fragment slot="illustration">
        <div class="edu-card-illustration-bg" />
        <div class="edu-card-illustration-wrapper">
          <div class="inner">
            <OneContract />
          </div>
        </div>
      </svelte:fragment>
    </EduCard>
  {/if}
</div>

<style>
  .explore {
    display: flex;
    gap: 3rem;
    flex-direction: column;
  }

  .edu-card-illustration-bg {
    display: none;
  }

  .edu-card-illustration-wrapper {
    position: absolute;
    max-width: 20rem;
    z-index: 1;
    right: -10%;
    top: -10%;
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      position: absolute;
      top: 0;
      background-color: var(--color-primary-level-1);
      width: 100%;
      height: 25%;
      border-radius: 0;
      display: block;
    }

    .edu-card-illustration-wrapper {
      position: relative;
      max-width: 8rem;
      right: 0%;
      top: 0%;
    }
  }

  .stats {
    display: flex;
    gap: 1rem;
  }

  .stats .value-wrapper {
    border: 1px solid var(--color-foreground);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  @media (max-width: 1070px) {
    .stats {
      flex-direction: column;
    }

    .stats .value-wrapper {
      width: 100%;
    }
  }

  .stats .value-wrapper .header {
    display: flex;
    justify-content: space-between;
  }

  .large-number {
    font-size: min(12vw, 80px);
    line-height: min(12vw, 80px);
    color: var(--color-primary);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 2px;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1rem;
    padding: 4px 2px;
  }

  @media (max-width: 767px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

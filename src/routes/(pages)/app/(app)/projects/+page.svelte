<script lang="ts" context="module">
  export const PROJECTS_PAGE_PROJECT_FRAGMENT = gql`
    ${PROJECTS_SECTION_PROJECT_FRAGMENT}
    fragment ProjectsPageProject on Project {
      ...ProjectsSectionProject
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import YourProjectsSection, {
    PROJECTS_SECTION_PROJECT_FRAGMENT,
  } from '$lib/components/your-projects-section/your-projects-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import RepoGitProject from '$lib/components/illustrations/repo-git-project.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import StatsSection from '$lib/components/stats-section/stats-section.svelte';
  import ProminentKeyValuePair from '$lib/components/key-value-pair/prominent-key-value-pair.svelte';
  import Section from '$lib/components/section/section.svelte';
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import RecentlyClaimedProjects from '../components/recently-claimed-projects.svelte';
  import ProjectsGrid from '../components/projects-grid.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';

  export let data;
</script>

<HeadMeta title="Projects" />

<div class="page">
  <EduCard dismissableId="projects-page-intro" negativeMarginWhileCollapsed="-4rem">
    <svelte:fragment slot="text">
      <h1 class="pixelated">Projects on Drips</h1>
      <p>
        Projects are GitHub repositories associated with an Ethereum address, stored in a
        FUNDING.json file. They include maintainers and dependencies, which the owner can choose to
        split a percentage of any incoming funds to.
      </p>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button
        icon={Plus}
        variant="primary"
        on:click={() =>
          modal.show(ClaimProjectStepper, undefined, {
            skipWalletConnect: $walletStore.connected,
          })}>Claim your project</Button
      >
      <Button
        icon={ArrowBoxUpRight}
        href="https://docs.drips.network/get-support/claim-your-repository">Learn More</Button
      >
    </svelte:fragment>
    <svelte:fragment slot="illustration">
      <div class="edu-card-illustration-bg" />
      <div class="edu-card-illustration-wrapper">
        <RepoGitProject />
      </div>
    </svelte:fragment>
  </EduCard>

  <YourProjectsSection
    withClaimProjectButton
    projects={data.yourProjects}
    showVisibilityToggle={true}
  />

  <StatsSection>
    <ProminentKeyValuePair key="Total Donations"
      ><AggregateFiatEstimate
        compact
        amounts={data.totalDrippedAmounts}
        prices={data.totalDrippedPrices}
      /></ProminentKeyValuePair
    >
    <ProminentKeyValuePair key="Total Drips Lists" value={data.chainStats.dripListsCount}
    ></ProminentKeyValuePair>
    <ProminentKeyValuePair key="Total Splits" value={data.chainStats.receiversCount}
    ></ProminentKeyValuePair>
  </StatsSection>

  <Section
    header={{
      icon: BoxIcon,
      label: 'Featured projects',
    }}
    skeleton={{
      loaded: true,
      empty: !data.featuredProjects.length,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No Featured Projects',
      emptyStateText: 'We couldn’t find any featured projects.',
    }}
  >
    <div class="horizontal-scroll">
      <ProjectsGrid projects={data.featuredProjects} />
    </div>
  </Section>

  <RecentlyClaimedProjects projects={data.restProjects} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .edu-card-illustration-bg {
    position: absolute;
    background-color: var(--color-primary-level-2);
    top: 0;
    max-width: 326px;
    width: 35%;
    height: 50%;
    border-radius: 0 0 1rem 1rem;
  }

  .edu-card-illustration-wrapper {
    display: flex;
    z-index: 1;
  }

  h1 {
    color: var(--color-foreground);
  }

  @media (max-width: 716px) {
  }
</style>

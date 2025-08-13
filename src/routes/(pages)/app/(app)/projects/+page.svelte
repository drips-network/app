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
  import { goto } from '$app/navigation';

  export let data;

  function launchClaimProject() {
    if ($walletStore.connected) {
      modal.show(ClaimProjectStepper, undefined, {
        skipWalletConnect: true,
      });
      return;
    }

    goto('/app/claim-project');
  }
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
        <a
          class="typo-link"
          href="https://docs.drips.network/get-support/claim-your-repository"
          target="_blank">Learn more</a
        >
      </p>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button icon={Plus} variant="primary" on:click={launchClaimProject}>Claim your project</Button
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
    <ProminentKeyValuePair key="Total claimed projects" value={data.chainStats.claimedProjectsCount}
    ></ProminentKeyValuePair>
    <ProminentKeyValuePair key="Total Splits" value={data.chainStats.receiversCount}
    ></ProminentKeyValuePair>
  </StatsSection>

  {#if data.featuredProjects.length}
    <Section
      header={{
        icon: BoxIcon,
        label: 'Featured projects',
      }}
      skeleton={{
        loaded: true,
      }}
    >
      <div class="horizontal-scroll">
        <ProjectsGrid projects={data.featuredProjects} />
      </div>
    </Section>
  {/if}

  <RecentlyClaimedProjects projects={data.restProjects} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 3rem;
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

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
      max-width: none;
    }
  }
</style>

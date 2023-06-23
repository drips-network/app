<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import Splits from 'radicle-design-system/icons/Splits.svelte';
  import BecomeSupporterCard from '../become-supporter-card/become-supporter-card.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let project: GitProject;
  export let unclaimedFunds: { tokenAddress: string; amount: bigint }[] | undefined = undefined;
</script>

<svelte:head>
  <title>{project.source.repoName} | Drips</title>
  <meta
    name="description"
    content="Support {project.source
      .repoName} on Drips and help make Open-Source Software sustainable."
  />
</svelte:head>

<PrimaryColorThemer colorHex={project.owner ? project.color : undefined}>
  <div class="project-profile">
    <div class="header">
      {#if project.owner}
        <div class="owner">
          <IdentityBadge address={project.owner.address} /> is raising funds for...
        </div>
      {/if}
      <ProjectProfileHeader {project} />
    </div>
    <div class="content">
      {#if project.owner}
        <SectionHeader icon={Heart} label="Supporters" />
        <SectionHeader icon={Splits} label="Splits" />
      {:else}
        <div class="section">
          <SectionHeader icon={Wallet} label="Claimable funds" />
          <UnclaimedProjectCard
            unclaimedTokensExpanded={unclaimedFunds && unclaimedFunds.length > 0}
            {unclaimedFunds}
          />
        </div>
      {/if}
    </div>
    {#if project.owner}
      <aside>
        <div class="become-supporter-card">
          <BecomeSupporterCard {project} />
        </div>
      </aside>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .project-profile {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 18rem);
    grid-template-rows: auto auto;
    grid-template-areas:
      'header sidebar'
      'content sidebar';
    gap: 2rem;
  }

  .content {
    grid-area: content;
    align-self: top;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .header {
    grid-area: header;
    margin-bottom: 3rem;
  }

  .header .owner {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  aside {
    grid-area: sidebar;
  }

  .become-supporter-card {
    position: sticky;
    top: 0;
  }

  @media (max-width: 1024px) {
    .project-profile {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas:
        'header'
        'sidebar'
        'content';
    }

    aside {
      padding: 2rem 0;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

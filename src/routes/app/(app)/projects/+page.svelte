<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import BoxIcon from 'radicle-design-system/icons/Box.svelte';
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import DownloadIcon from 'radicle-design-system/icons/Download.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';
  import type { ClaimedGitProject } from '$lib/utils/metadata/types';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';

  // TODO: Really fetch projects

  const MOCK_PROJECT_1: ClaimedGitProject = {
    claimed: true,
    repoDriverAccount: {
      userId: '0',
      driver: 'repo',
    },
    owner: {
      driver: 'address',
      userId: '0',
      address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
    },
    source: {
      forge: 'github',
      repoName: 'svelte-stepper',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
    emoji: '🚶',
    color: '#fcc842',
  };

  const MOCK_PROJECT_2: ClaimedGitProject = {
    claimed: true,
    repoDriverAccount: {
      userId: '0',
      driver: 'repo',
    },
    owner: {
      driver: 'address',
      userId: '0',
      address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
    },
    source: {
      forge: 'github',
      repoName: 'svelte-stored-writable',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
    emoji: '💾',
    color: '#FF0000',
  };

  const projects = [MOCK_PROJECT_1, MOCK_PROJECT_2, MOCK_PROJECT_1, MOCK_PROJECT_2, MOCK_PROJECT_2];
</script>

<svelte:head>
  <title>Projects | Drips</title>
  <meta name="description" content="Drips Projects Page" />
</svelte:head>

<div class="page">
  <div class="section">
    <SectionHeader
      icon={BoxIcon}
      label="Your projects"
      actions={[
        {
          handler: () => undefined,
          label: 'Claim project',
          icon: PlusIcon,
          variant: 'primary',
        },
      ]}
    />
    <SectionSkeleton
      horizontalScroll={false}
      loaded
      emptyStateEmoji="🫙"
      emptyStateHeadline="No claimed projects"
      emptyStateText="If you develop an open-source project, click &quot;Claim project&quot; to get started."
    >
      <div class="projects">
        {#each projects as project}
          <div>
            <PrimaryColorThemer colorHex={project.color}
              ><ProjectCard {project} /></PrimaryColorThemer
            >
          </div>
        {/each}
      </div>
    </SectionSkeleton>
  </div>

  <div class="section">
    <SectionHeader icon={TokensIcon} label="Earnings" />
    <SectionSkeleton loaded>
      <div class="earnings-card">
        <div class="values">
          <KeyValuePair key="Collectable now" highlight>$0.00</KeyValuePair>
          <KeyValuePair key="Total earned">$0.00</KeyValuePair>
          <KeyValuePair key="Next payout">April 17</KeyValuePair>
        </div>
        <div>
          <Button variant="primary" icon={DownloadIcon}>Collect earnings</Button>
        </div>
      </div>
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .projects {
    display: flex;
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding-top: 2px;
    flex-wrap: wrap;
  }

  .projects > * {
    flex: 1;
    max-width: calc(25% - 0.75rem);
  }

  .earnings-card {
    display: flex;
    gap: 4rem;
    justify-content: space-between;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    padding: 1.5rem;
    border-radius: 1rem 0 1rem 1rem;
    align-items: center;
  }

  .earnings-card > .values {
    display: flex;
    gap: 4rem;
  }
</style>

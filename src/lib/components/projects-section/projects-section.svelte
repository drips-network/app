<script lang="ts">
  import type { ClaimedGitProject } from '$lib/utils/metadata/types';
  import { onMount } from 'svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import ProjectCard from '../project-card/project-card.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import assert from '$lib/utils/assert';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import SectionHeader from '../section-header/section-header.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { goto } from '$app/navigation';

  export let address: string;

  let projects: ClaimedGitProject[] | undefined;
  let error = false;
  let loaded = false;
  onMount(async () => {
    try {
      const service = await GitProjectService.new();

      assert(address);
      projects = await service.getAllByOwner(address.toLowerCase());
      loaded = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      loaded = true;
      error = true;
    }
  });

  $: isSelf = address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<div class="section">
  <SectionHeader
    icon={Box}
    label="Claimed projects"
    actions={isSelf
      ? [
          {
            handler: () => goto(`/app/claim-project`),
            label: 'Claim project',
            icon: Plus,
            variant: 'primary',
          },
        ]
      : []}
  />
  <SectionSkeleton
    horizontalScroll={false}
    {loaded}
    empty={projects?.length === 0}
    {error}
    emptyStateEmoji="🫙"
    emptyStateHeadline="No claimed projects"
    emptyStateText="If you develop an open-source project, click &quot;Claim project&quot; to get started."
  >
    {#if projects}
      <div class="projects">
        {#each projects as project}
          <div>
            <PrimaryColorThemer colorHex={project.color}
              ><ProjectCard {project} /></PrimaryColorThemer
            >
          </div>
        {/each}
      </div>
    {/if}
  </SectionSkeleton>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

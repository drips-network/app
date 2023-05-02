<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import Splits from 'radicle-design-system/icons/Splits.svelte';
  import BecomeSupporterCard from '../become-supporter-card/become-supporter-card.svelte';
  import ProjectProfileHeader from '../project-profile-header/project-profile-header.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';

  export let project: GitProject;
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
      <ProjectProfileHeader {project} />
    </div>
    <div class="content">
      {#if project.owner}
        <SectionHeader icon={Heart} label="Supporters" />
        <SectionHeader icon={Splits} label="Splits" />
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
</style>

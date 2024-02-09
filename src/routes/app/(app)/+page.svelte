<script lang="ts">
  import TrophyIcon from 'radicle-design-system/icons/Trophy.svelte';
  import BoxIcon from 'radicle-design-system/icons/Box.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import Section from '$lib/components/section/section.svelte';
  import type { PageData } from './$types';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import { goto } from '$app/navigation';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';

  const FEATURED_PROJECT_ACCOUNT_IDS = [
    '80921576051643469277397866636792942368647018452892810554457309839360',
    '80928956806149918791864723629668437820661066502202314166815319654400',
  ];

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
</script>

<div class="explore">
  <Section
    header={{
      icon: TrophyIcon,
      label: 'Stats',
    }}
    skeleton={{}}
  />

  <Section
    header={{
      icon: BoxIcon,
      label: 'Featured projects',
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
      icon: PenIcon,
      label: 'Latest news',
      actions: [
        {
          label: 'Read the blog',
          handler: () => goto('/blog'),
        },
      ],
    }}
    skeleton={{ loaded: true }}
  >
    <div class="posts-grid">
      {#each blogPosts as post}
        <PostCard compact {...post} />
      {/each}
    </div>
  </Section>

  <Section
    header={{
      icon: DripListIcon,
      label: 'Featured Drip Lists',
    }}
    skeleton={{ loaded: true }}
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
</div>

<style>
  .explore {
    display: flex;
    gap: 3rem;
    flex-direction: column;
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
</style>

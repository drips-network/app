<script lang="ts">
  import GithubIcon from 'radicle-design-system/icons/Github.svelte';
  import GitlabIcon from 'radicle-design-system/icons/Gitlab.svelte';
  import RadicleIcon from 'radicle-design-system/icons/Radicle.svelte';
  import GitIcon from 'radicle-design-system/icons/Git.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';

  export let project: GitProject;

  type Size = 'small' | 'medium' | 'large' | 'huge';
  export let size: Size = 'small';
  export let outline = false;

  const CONTAINER_SIZES: Record<Size, string> = {
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  const EMOJI_FONT_SIZES: Record<Size, string> = {
    small: '1.5rem',
    medium: '2rem',
    large: '3rem',
    huge: '5rem',
  };
  $: emojiFontSize = EMOJI_FONT_SIZES[size];
</script>

<PrimaryColorThemer colorHex={project.claimed ? project.color : undefined}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    style:box-shadow={outline ? 'var(--elevation-low)' : ''}
  >
    {#if project.owner}
      <div class="project-avatar" style:background-color="var(--color-primary)">
        <span class="emoji" style:font-size={emojiFontSize}>{project.emoji}</span>
      </div>
    {/if}

    {#if !project.owner}
      <div class="project-avatar">
        {#if project.source.forge === 'github'}
          <GithubIcon />
        {:else if project.source.forge === 'gitlab'}
          <!-- TODO: Real GitLab icon -->
          <GitlabIcon />
        {:else if project.source.forge === 'radicle'}
          <!-- TODO: Real Radicle icon -->
          <RadicleIcon />
        {:else if project.source.forge === 'generic'}
          <!-- TODO: Real Git icon -->
          <GitIcon />
        {/if}
      </div>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .wrapper {
    height: calc(2rem - 1px);
    width: calc(2rem - 1px);
    border-radius: 1000rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
    user-select: none;
    position: relative;
    flex-shrink: 0;
    margin: 1px;
  }

  .project-avatar {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 95%;
  }
</style>

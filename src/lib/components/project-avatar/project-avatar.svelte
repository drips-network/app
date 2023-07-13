<script lang="ts">
  import GithubIcon from 'radicle-design-system/icons/Github.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import twemoji from 'twemoji';

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

  $: emojiElem = project.claimed
    ? twemoji.parse(project.emoji, { folder: 'svg', ext: '.svg' })
    : undefined;
</script>

<PrimaryColorThemer colorHex={project.claimed ? project.color : undefined}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    class:with-outline={outline}
  >
    {#if project.owner}
      <div class="project-avatar" style:background-color="var(--color-primary)">
        <div class="inner">
          {@html emojiElem}
        </div>
      </div>
    {/if}

    {#if !project.owner}
      <div class="project-avatar">
        <GithubIcon />
      </div>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .wrapper {
    height: 2rem;
    width: 2rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
    user-select: none;
    position: relative;
    flex-shrink: 0;
    border-radius: 50%;
  }

  .project-avatar {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 95%;
    transition: background-color 0.3s;
  }

  .project-avatar .inner {
    height: 60%;
    width: 60%;
  }

  .project-avatar .inner * {
    height: 100%;
    width: 100%;
  }

  .with-outline {
    border: 1px solid var(--color-foreground);
  }

  .emoji {
    font-family: initial;
  }
</style>

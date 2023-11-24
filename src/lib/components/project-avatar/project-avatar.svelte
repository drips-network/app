<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import type { ProjectAvatarFragment } from './__generated__/gql.generated';

  export const PROJECT_AVATAR_FRAGMENT = gql`
    fragment ProjectAvatar on Project {
      ... on ClaimedProject {
        color
        emoji
      }
    }
  `;
</script>

<script lang="ts">
  import GithubIcon from 'radicle-design-system/icons/Github.svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import twemoji from 'twemoji';
  import isClaimed from '$lib/utils/project/is-claimed';

  export let project: ProjectAvatarFragment;

  type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  export let size: Size = 'small';
  export let outline = false;

  const CONTAINER_SIZES: Record<Size, string> = {
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  $: emojiElem =
    isClaimed(project) && project.emoji
      ? twemoji.parse(project.emoji, { folder: 'svg', ext: '.svg' })
      : undefined;
</script>

<PrimaryColorThemer colorHex={isClaimed(project) ? project.color : undefined}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    class:with-outline={outline}
  >
    {#if isClaimed(project)}
      <div class="project-avatar" style:background-color="var(--color-primary)">
        <div class="inner">
          {@html emojiElem}
        </div>
      </div>
    {:else}
      <div class="project-avatar">
        <GithubIcon style="width: min(80%, 3rem); height: min(80%, 3rem)" />
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
</style>

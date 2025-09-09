<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const PROJECT_AVATAR_FRAGMENT = gql`
    fragment ProjectAvatar on ProjectData {
      ... on ClaimedProjectData {
        chain
        color
        avatar {
          ... on EmojiAvatar {
            emoji
          }
          ... on ImageAvatar {
            cid
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import GithubIcon from '$lib/components/icons/Github.svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import Question from '$lib/components/icons/Question.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { onMount } from 'svelte';
  import twemoji from '$lib/utils/twemoji';
  import type { ProjectAvatarFragment } from './__generated__/gql.generated';

  export let project: ProjectAvatarFragment;

  export let pendingAvatar = false;

  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
  export let size: Size = 'small';
  export let outline = project.__typename === 'ClaimedProjectData';

  const CONTAINER_SIZES: Record<Size, string> = {
    micro: '0.8rem',
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    xlarge: '6.5rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  const IMAGE_SIZES = {
    micro: 32,
    tiny: 48,
    small: 64,
    medium: 96,
    large: 128,
    xlarge: 192,
    huge: 256,
  };
  $: imageSize = IMAGE_SIZES[size];

  $: emojiElem =
    isClaimed(project) && project.avatar.__typename === 'EmojiAvatar'
      ? twemoji(project.avatar.emoji)
      : undefined;

  let customImageEl: HTMLImageElement | undefined = undefined;
  let customImageLoading = false;
  let prevAvatarCid: string | undefined = undefined;
  $: {
    if (
      project.__typename === 'ClaimedProjectData' &&
      project.avatar.__typename === 'ImageAvatar' &&
      project.avatar.cid !== prevAvatarCid
    ) {
      customImageLoading = true;
      prevAvatarCid = project.avatar.cid;
    }
  }

  onMount(async () => {
    if (customImageEl && customImageEl.complete) {
      customImageLoading = false;
    }
  });
</script>

<PrimaryColorThemer colorHex={isClaimed(project) ? project.color : undefined}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    class:with-outline={outline}
  >
    <div class="loading-state" class:visible={customImageLoading}>
      <Spinner />
    </div>

    {#if isClaimed(project)}
      {#if pendingAvatar}
        <div class="project-avatar">
          <Question />
        </div>
      {:else if project.avatar.__typename === 'ImageAvatar'}
        <div class="project-avatar">
          <img
            bind:this={customImageEl}
            on:load={() => (customImageLoading = false)}
            src="/api/custom-avatars/{project.avatar.cid}?size={imageSize}"
            alt="project avatar"
            loading="lazy"
          />
        </div>
      {:else if emojiElem}
        <div class="project-avatar" style:background-color="var(--color-primary)">
          <div class="inner">
            {@html emojiElem}
          </div>
        </div>
      {/if}
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

  .loading-state {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
    background-color: var(--color-foreground-level-2);
  }

  .loading-state.visible {
    opacity: 1;
    transition: opacity 0.3s;
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

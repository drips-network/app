<script lang="ts">
  import Question from '$lib/components/icons/Question.svelte';
  import twemoji from '$lib/utils/twemoji';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';

  export let ecosystem: Ecosystem;

  $: pendingAvatar = !ecosystem.avatar || !ecosystem.avatar.emoji.trim();

  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
  export let size: Size = 'small';
  export let outline = true;

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

  $: emojiElem = ecosystem.avatar?.emoji ? twemoji(ecosystem.avatar.emoji) : undefined;
</script>

<PrimaryColorThemer colorHex={ecosystem.color}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    class:with-outline={outline}
  >
    {#if pendingAvatar}
      <div class="project-avatar">
        <Question />
      </div>
    {:else if emojiElem}
      <div class="project-avatar" style:background-color="var(--color-primary)">
        <div class="inner">
          {@html emojiElem}
        </div>
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

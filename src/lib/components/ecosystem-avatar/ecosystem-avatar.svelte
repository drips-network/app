<script lang="ts" module>
  import { gql } from 'graphql-request';

  export const ECOSYSTEM_AVATAR_FRAGMENT = gql`
    fragment EcosystemAvatar on EcosystemMainAccount {
      color
      avatar {
        ... on EmojiAvatar {
          emoji
        }
      }
    }
  `;
</script>

<script lang="ts">
  import twemoji from '$lib/utils/twemoji';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import EcosystemIcon from '../icons/Ecosystem.svelte';
  import type { EcosystemAvatarFragment } from './__generated__/gql.generated';


  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
  interface Props {
    ecosystem: EcosystemAvatarFragment | undefined;
    disabled?: boolean;
    size?: Size;
    outline?: boolean;
  }

  let {
    ecosystem,
    disabled = false,
    size = 'small',
    outline = true
  }: Props = $props();

  const CONTAINER_SIZES: Record<Size, string> = {
    micro: '0.8rem',
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    xlarge: '6.5rem',
    huge: '8rem',
  };
  let containerSize = $derived(CONTAINER_SIZES[size]);

  let pendingAvatar =
    $derived(!ecosystem?.avatar ||
    ecosystem.avatar.__typename !== 'EmojiAvatar' ||
    !ecosystem.avatar.emoji.trim());
  let emojiElem =
    $derived(ecosystem?.avatar?.__typename === 'EmojiAvatar' ? twemoji(ecosystem.avatar.emoji) : undefined);
</script>

<PrimaryColorThemer colorHex={ecosystem?.color}>
  <div
    class="wrapper"
    style="width: {containerSize}; height: {containerSize}"
    class:with-outline={outline}
  >
    {#if pendingAvatar}
      <div class="ecosystem-avatar">
        <EcosystemIcon
          style="
            width: min(80%, 3rem);
            height: min(80%, 3rem);
            fill: {disabled
            ? 'var(--color-foreground-level-6)'
            : 'var(--color-foreground-level-5)'};"
        />
      </div>
    {:else if emojiElem}
      <div class="ecosystem-avatar" style:background-color="var(--color-primary)">
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

  .ecosystem-avatar {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 95%;
    transition: background-color 0.3s;
  }

  .ecosystem-avatar .inner {
    height: 60%;
    width: 60%;
  }

  .ecosystem-avatar .inner * {
    height: 100%;
    width: 100%;
  }

  .with-outline {
    border: 1px solid var(--color-foreground);
  }
</style>

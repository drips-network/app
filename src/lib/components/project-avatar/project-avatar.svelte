<script lang="ts" module>
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
      ... on UnClaimedProjectData {
        chain
      }
    }
  `;
</script>

<script lang="ts">
  import GithubIcon from '$lib/components/icons/Github.svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import Question from '$lib/components/icons/Question.svelte';
  import type { ProjectAvatarFragment } from './__generated__/gql.generated';
  import EmojiOrIpfsAvatar from '../emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import type { ComponentProps } from 'svelte';

  interface Props {
    project: ProjectAvatarFragment;
    size?: ComponentProps<typeof EmojiOrIpfsAvatar>['size'];
    pendingAvatar?: boolean;
  }

  let { project, size = 'small', pendingAvatar = false }: Props = $props();
</script>

<PrimaryColorThemer colorHex={isClaimed(project) ? project.color : undefined}>
  {#if isClaimed(project)}
    <EmojiOrIpfsAvatar
      emoji={!pendingAvatar && project.avatar.__typename === 'EmojiAvatar'
        ? project.avatar.emoji
        : undefined}
      ipfsCid={!pendingAvatar && project.avatar.__typename === 'ImageAvatar'
        ? project.avatar.cid
        : undefined}
      {size}
      placeholderIcon={Question}
    />
  {:else}
    <EmojiOrIpfsAvatar {size} placeholderIcon={GithubIcon} />
  {/if}
</PrimaryColorThemer>

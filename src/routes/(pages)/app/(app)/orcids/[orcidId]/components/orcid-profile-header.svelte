<script lang="ts" module>
  export const ORCID_PROFILE_HEADER_FRAGMENT = gql`
    ${ORCID_BADGE_FRAGMENT}
    fragment OrcidProfileHeader on OrcidLinkedIdentity {
      ...OrcidBadge
      orcid
      chain
      owner {
        address
      }
      isClaimed
      areSplitsValid
      orcidMetadata {
        givenName
        familyName
      }
    }
  `;
</script>

<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { gql } from 'graphql-request';
  import type { OrcidProfileHeaderFragment } from './__generated__/gql.generated';
  import twemoji from '$lib/utils/twemoji';
  import OrcidBadge, { ORCID_BADGE_FRAGMENT } from './orcid-badge.svelte';
  import OrcidAvatar from './orcid-avatar.svelte';
  import type Orcid from '$lib/utils/orcids/entities';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import getOrcidDisplayName from '$lib/utils/orcids/display-name';

  interface Props {
    orcid: Orcid;
    orcidAccount: OrcidProfileHeaderFragment;
    shareButton?: ComponentProps<typeof ShareButton> | undefined;
  }

  let { orcid, orcidAccount, shareButton = undefined }: Props = $props();

  const orcidName = getOrcidDisplayName(orcidAccount);
</script>

<div class="flex flex-col gap-4 items-start sm:flex-row sm:justify-between relative">
  <div class="max-w-full flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <div class="avatar">
      <OrcidAvatar size="huge" outline />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{orcidName}</h1>
      {#if orcid.bio}
        <span
          class="typo-text-small line-clamp-1 twemoji-text"
          style:color="var(--color-foreground-level-6)"
          >{@html twemoji(orcid.bio)}
        </span>
      {/if}
      <div class="secondary">
        {#if orcidAccount.owner}
          <IdentityBadge address={orcidAccount.owner.address} />
        {/if}
        <OrcidBadge
          size="tiny"
          orcid={orcidAccount}
          forceUnclaimed
          tooltip={false}
          linkTo="external-url"
          outlined
          copyable
        />
        {#if shareButton}
          <ShareButton buttonVariant="muted" {...shareButton} />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .secondary {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
</style>

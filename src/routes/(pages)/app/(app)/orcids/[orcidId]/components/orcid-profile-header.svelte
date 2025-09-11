<script lang="ts" context="module">
  export const ORCID_PROFILE_HEADER_FRAGMENT = gql`
    ${ORCID_BADGE_FRAGMENT}
    fragment OrcidProfileHeader on OrcidLinkedIdentity {
      ...OrcidBadge
      orcid
      chain
      owner {
        address
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
  import filterCurrentChainData from '$lib/utils/orcids/filter-current-chain-data';
  import OrcidAvatar from './orcid-avatar.svelte';
  import type Orcid from '$lib/utils/orcids/entities';
  import isClaimed from '$lib/utils/orcids/is-claimed';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let orcid: Orcid;
  export let orcidAccount: OrcidProfileHeaderFragment;
  export let shareButton: ComponentProps<ShareButton> | undefined = undefined;

  $: orcidChainData = filterCurrentChainData(orcidAccount.chainData);
</script>

<div class="flex flex-col gap-4 items-start sm:flex-row sm:justify-between relative">
  <div class="max-w-full flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <div class="avatar">
      <OrcidAvatar size="huge" outline/>
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{orcid.name}</h1>
      {#if orcid.bio}
        <span
          class="typo-text-small line-clamp-1 twemoji-text"
          style:color="var(--color-foreground-level-6)"
          >{@html twemoji(orcid.bio)}
        </span>
      {/if}
      <div style:display="flex" style:gap="0.75rem" style:margin-top="0.5rem" style:flex-wrap="wrap">
        {#if isClaimed(orcidChainData)}
          <IdentityBadge address={orcidChainData.headerLinkedTo.address} />
        {/if}
        <OrcidBadge size="tiny" orcid={orcidAccount} forceUnclaimed tooltip={false} linkTo="external-url" outlined copyable/>
        {#if shareButton}
          <ShareButton buttonVariant="muted" {...shareButton} />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>

</style>

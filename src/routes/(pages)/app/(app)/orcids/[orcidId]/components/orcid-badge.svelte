<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import OrcidTooltip, { ORCID_TOOLTIP_FRAGMENT } from './orcid-tooltip.svelte';

  export const ORCID_BADGE_FRAGMENT = gql`
    ${ORCID_TOOLTIP_FRAGMENT}
    fragment OrcidBadge on OrcidAccount {
      ...OrcidTooltip
      source {
        url
      }
      chainData {
        ... on ClaimedOrcidAccountData {
          chain
        }
      }
    }
  `;
</script>

<script lang="ts">
  import buildExternalUrl from '$lib/utils/build-external-url';
  import {
    SupportedChain,
  } from '$lib/graphql/__generated__/base-types';
  import network from '$lib/stores/wallet/network';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import filterCurrentChainData from '$lib/utils/orcids/filter-current-chain-data';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import getLastPathSegment from '$lib/utils/get-last-path-segment';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';
  import isClaimed from '$lib/utils/orcids/is-claimed';
  import OrcidAvatar from './orcid-avatar.svelte';
  import OrcidName from './orcid-name.svelte';
  import type { OrcidBadgeFragment } from './__generated__/gql.generated';

  export let orcid: OrcidBadgeFragment;

  export let tooltip = true;
  /** display orcid as if it's unclaimed, even if it is claimed */
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkToNewTab = false;
  export let linkTo: 'external-url' | 'orcid-page' | 'nothing' = 'orcid-page';
  export let size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' = 'small';
  export let smallText = false;
  export let chainOverride: SupportedChain | undefined = undefined;

  let unclaimedOrcid: OrcidBadgeFragment;
  $: unclaimedOrcid = {
    __typename: 'OrcidAccount',
    source: { ...orcid.source },
    chainData: [
      {
        chain: chainOverride ?? network.gqlName,
        __typename: 'UnClaimedOrcidAccountData',
      },
    ],
  } as OrcidBadgeFragment;

  $: processedOrcid = forceUnclaimed ? unclaimedOrcid : orcid;

  $: chainData = filterCurrentChainData(processedOrcid.chainData, undefined, chainOverride);
  $: orcidId = getLastPathSegment(processedOrcid.source.url)
</script>

<PrimaryColorThemer colorHex={undefined}>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="orcid-badge gap-{smallText ? 1 : 2} flex items-center typo-text"
      href={linkTo === 'orcid-page' && orcidId
        ? buildOrcidUrl(orcidId)
        : buildExternalUrl(processedOrcid.source.url)}
      target={linkTo === 'external-url' || linkToNewTab ? '_blank' : ''}
    >
      {#if !hideAvatar}
        <div class="avatar-and-forge">
          {#if !forceUnclaimed && isClaimed(chainData)}
            <div>
              <OrcidAvatar
                {size}
              />
            </div>
          {/if}
          <div><OrcidAvatar {size} /></div>
        </div>
      {/if}
      <div class="name flex-1 min-w-0 truncate">
        <OrcidName tiny={smallText} orcid={processedOrcid} />
      </div>
    </svelte:element>
    <svelte:fragment slot="tooltip-content">
      <OrcidTooltip orcid={processedOrcid} />
    </svelte:fragment>
  </Tooltip>
</PrimaryColorThemer>

<style>
  a:focus-visible {
    outline: none;
  }

  a .name {
    transition: background-color 0.3s ease;
  }

  a:focus-visible .name {
    background-color: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }

  .avatar-and-forge {
    display: flex;
    flex-direction: row;
  }

  .avatar-and-forge > *:nth-child(2) {
    margin-left: -0.75rem;
  }
</style>

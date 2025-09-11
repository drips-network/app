<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import OrcidTooltip, { ORCID_TOOLTIP_FRAGMENT } from './orcid-tooltip.svelte';

  export const ORCID_BADGE_FRAGMENT = gql`
    ${ORCID_TOOLTIP_FRAGMENT}
    fragment OrcidBadge on OrcidLinkedIdentity {
      ...OrcidTooltip
      chain
      orcid
      isClaimed
      isLinked
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
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';
  import OrcidAvatar from './orcid-avatar.svelte';
  import OrcidName from './orcid-name.svelte';
  import type { OrcidBadgeFragment } from './__generated__/gql.generated';
  import CheckIcon from '$lib/components/icons/CheckCircle.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import { fade } from 'svelte/transition';

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
  export let outlined: boolean = false;
  export let copyable: boolean = false;

  let copySuccess = false

  let unclaimedOrcid: OrcidBadgeFragment;
  $: unclaimedOrcid = {
    ...orcid,
    chain: chainOverride ?? network.gqlName,
    isClaimed: false,
    isLinked: false
  } as OrcidBadgeFragment;

  $: processedOrcid = forceUnclaimed ? unclaimedOrcid : orcid;

  async function copyClipboard(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(orcid.orcid);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
  }
</script>

<PrimaryColorThemer colorHex={undefined}>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="orcid-badge gap-{smallText ? 1 : 2} flex items-center typo-text"
      class:outlined={outlined}
      href={linkTo === 'orcid-page'
        ? buildOrcidUrl(orcid.orcid)
        : buildExternalUrl(orcid.orcid)}
      target={linkTo === 'external-url' || linkToNewTab ? '_blank' : ''}
    >
      {#if !hideAvatar}
        <div class="avatar-and-forge">
          <div><OrcidAvatar {size} /></div>
        </div>
      {/if}
      <div class="name flex-1 min-w-0 truncate">
        <OrcidName tiny={smallText} orcid={processedOrcid} />
      </div>
      {#if copyable}
        <div class="copy">
          <button on:click={copyClipboard}>
            {#if copySuccess}
              <span transition:fade={{ duration: 200 }}>
                <CheckIcon style="fill: var(--color-foreground)" />
              </span>
            {:else}
              <span transition:fade={{ duration: 200 }}>
                <CopyIcon style="fill: var(--color-foreground)" />
              </span>
            {/if}
          </button>
        </div>
      {/if}
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

  .orcid-badge.outlined {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.25rem 0.75rem 0.25rem 0.25rem;
    display: inline-flex;
  }

  .copy {
    display: flex;
    align-items: center;
  }

  .copy button {
    height: 1rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy button > * {
    position: absolute;
  }
</style>

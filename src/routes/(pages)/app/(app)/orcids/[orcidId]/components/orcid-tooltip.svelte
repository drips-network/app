<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const ORCID_TOOLTIP_FRAGMENT = gql`
    fragment OrcidTooltip on OrcidLinkedIdentity {
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
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import type { OrcidTooltipFragment } from './__generated__/gql.generated';
  import OrcidAvatar from './orcid-avatar.svelte';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';
  import OrcidName from './orcid-name.svelte';

  export let orcid: OrcidTooltipFragment;
</script>

<div class="orcid-tooltip">
  <div
    class="background"
    style:background-color={orcid.isClaimed
      ? 'var(--color-primary-level-2)'
      : 'var(--color-foreground-level-1)'}
  />
  <div class="header">
    <OrcidAvatar size="large" outline />
    <a class="name typo-header-4" href={buildOrcidUrl(orcid.orcid)}><OrcidName {orcid} /></a>
    {#if orcid.owner}
      <div class="owner typo-text-small">
        <span>Owned by </span>
        <IdentityBadge linkToNewTab address={orcid.owner.address} disableTooltip size="small" />
      </div>
    {/if}
  </div>
  <a
    class="typo-text-small"
    href={buildExternalUrl(buildOrcidUrl(orcid.orcid, { external: true }))}
    target="_blank"
    rel="noreferrer">View ORCID</a
  >
</div>

<style>
  .orcid-tooltip {
    width: 100%;
    max-width: fit-content;
    min-width: 10rem;
  }

  .header {
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .name {
    text-decoration: none;
  }

  .background {
    position: absolute;
    top: 0.5rem;
    left: 0;
    right: 0;
    height: 3rem;
    border-radius: 1rem 0 0 0;
  }

  .owner {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: -0.25rem;
    color: var(--color-foreground-level-6);
  }

  .owner * {
    white-space: nowrap;
  }

  a {
    text-decoration: underline;
    color: var(--color-foreground-level-6);
    margin-bottom: 0;
  }
</style>

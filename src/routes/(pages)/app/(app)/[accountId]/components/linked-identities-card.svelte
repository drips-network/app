<script lang="ts" context="module">
  import Button from '$lib/components/button/button.svelte';
  import Link from '$lib/components/icons/Link.svelte';
  import { gql } from 'graphql-request';

  export const LINKED_IDENTITIES_CARD_FRAGMENT = gql`
    fragment LinkedIdentities on LinkedIdentity {
      ... on OrcidLinkedIdentity {
        orcid
        chain
        isClaimed
        isLinked
      }
    }
  `;
</script>

<script lang="ts">
  import OrcidBadge from '../../orcids/[orcidId]/components/orcid-badge.svelte';
  import type { LinkedIdentitiesFragment } from './__generated__/gql.generated';

  export let linkedIdentities: LinkedIdentitiesFragment[] = [];
</script>

<div class="linked-identities-card">
  {#if linkedIdentities.length}
    <h5>Linked Identities</h5>
    <ul>
      {#each linkedIdentities as linkedIdentity}
        <li>
          {#if linkedIdentity.__typename === 'OrcidLinkedIdentity'}
            <OrcidBadge orcid={linkedIdentity} hideType={false} />
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <span>Identities can be used to find and support you.</span>
    <a class="typo-link" target="_blank" href="https://docs.drips.network/TODO">Learn more</a>
  {/if}
  <Button icon={Link} variant="muted">Link identity</Button>
</div>

<style>
  .linked-identities-card {
    border-radius: 1rem 0 1rem 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
  }

  .typo-link {
    color: var(--color-foreground);
    margin-bottom: 0.5rem;
  }
</style>

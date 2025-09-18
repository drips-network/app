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
        areSplitsValid
      }
    }
  `;
</script>

<script lang="ts">
  import OrcidBadge from '../../orcids/[orcidId]/components/orcid-badge.svelte';
  import type { LinkedIdentitiesFragment } from './__generated__/gql.generated';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import linkIdentitySteps from '$lib/flows/link-identity-flow/link-identity-steps';

  export let linkedIdentities: LinkedIdentitiesFragment[] = [];
  export let canLinkIdentity: boolean = false;

  function launchLinkIdentityFlow() {
    modal.show(Stepper, undefined, linkIdentitySteps());
  }
</script>

<div class="linked-identities-card" class:can-link-identity={canLinkIdentity}>
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
  {#if canLinkIdentity}
    <div class="actions">
      <Button icon={Link} variant="muted" on:click={launchLinkIdentityFlow}>Link identity</Button>
    </div>
  {/if}
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

  .actions {
    display: flex;
    flex-direction: column;
  }

  .can-link-identity .actions {
    flex-direction: row;
  }
</style>

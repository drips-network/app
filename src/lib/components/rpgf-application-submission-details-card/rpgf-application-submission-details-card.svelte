<script lang="ts" context="module">
  export const RPGF_APPLICATION_SUBMISSION_DETAILS_CARD_PROJECT_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment RpgfApplicationSubmissionDetailsCardProject on Project {
      ...ProjectBadge
      source {
        url
      }
    }
  `;
</script>

<script lang="ts">
  import type { ApplicationVersion } from '$lib/utils/rpgf/types/application';
  import { gql } from 'graphql-request';
  import Copyable from '../copyable/copyable.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import type { RpgfApplicationSubmissionDetailsCardProjectFragment } from './__generated__/gql.generated';

  export let applicationVersion: ApplicationVersion;
  export let submitterWalletAddress: string;
  export let project: RpgfApplicationSubmissionDetailsCardProjectFragment;
</script>

<RpgfApplicationDetailsCard title="Details" key="details">
  <div class="fields">
    <div class="field">
      <h2 class="typo-header-4">GitHub repository</h2>
      <Copyable value={project.source.url} alwaysVisible>
        <ProjectBadge linkTo="external-url" size="tiny" forceUnclaimed {project} tooltip={false} />
      </Copyable>
    </div>

    <div class="field">
      <h2 class="typo-header-4">Submitted by</h2>
      <IdentityBadge address={submitterWalletAddress} />
    </div>

    <div class="field">
      <h2 class="typo-header-4">Submitted at</h2>
      <p>
        {new Date(applicationVersion.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  </div>

  {#if applicationVersion.easAttestationUID}
    <div class="field">
      <h2 class="typo-header-4">EAS attestation UID</h2>
      <Copyable value={applicationVersion.easAttestationUID} alwaysVisible>
        <p>{applicationVersion.easAttestationUID}</p>
      </Copyable>
    </div>
  {/if}
</RpgfApplicationDetailsCard>

<style>
  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .fields > .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

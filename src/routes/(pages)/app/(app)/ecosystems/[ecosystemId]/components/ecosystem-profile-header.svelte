<script lang="ts" module>
  export const PROJECT_PROFILE_HEADER_FRAGMENT = gql`
    ${ECOSYSTEM_BADGE_FRAGMENT}
    ${ECOSYSTEM_AVATAR_FRAGMENT}
    fragment EcosystemProfileHeader on EcosystemMainAccount {
      ...EcosystemBadge
      ...EcosystemAvatar
      name
      description
      owner {
        accountId
        address
      }
    }
  `;
</script>

<script lang="ts">
  import twemoji from '$lib/utils/twemoji';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import EcosystemAvatar, {
    ECOSYSTEM_AVATAR_FRAGMENT,
  } from '$lib/components/ecosystem-avatar/ecosystem-avatar.svelte';
  import { ECOSYSTEM_BADGE_FRAGMENT } from '$lib/components/ecosystem-badge/ecosystem-badge.svelte';
  import { gql } from 'graphql-request';
  import type { EcosystemProfileHeaderFragment } from './__generated__/gql.generated';

  interface Props {
    ecosystem: Ecosystem;
    ecosystemChainData: EcosystemProfileHeaderFragment | undefined;
  }

  let { ecosystem, ecosystemChainData }: Props = $props();
</script>

<div
  class="ecosystem-profile-header flex flex-col gap-4 items-center sm:flex-row sm:justify-between relative"
>
  <div
    class="max-w-full flex-1 min-w-0 flex flex-col gap-2 items-center sm:flex-row sm:gap-8 sm:items-center"
  >
    <div class="avatar">
      <EcosystemAvatar ecosystem={ecosystemChainData} size="huge" />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{ecosystem.name}</h1>

      {#if ecosystem.description}
        <p class="line-clamp-2 text-center sm:text-left twemoji-text">
          {@html twemoji(ecosystem.description)}
        </p>
      {/if}

      {#if ecosystem.ownerAddress}
        <div class="flex justify-center sm:justify-start" style:margin-top="0.5rem">
          <div class="identity-wrapper">
            <IdentityBadge address={ecosystem.ownerAddress} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .identity-wrapper {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.25rem 0.75rem 0.25rem 0.25rem;
    display: inline-flex;
  }
</style>

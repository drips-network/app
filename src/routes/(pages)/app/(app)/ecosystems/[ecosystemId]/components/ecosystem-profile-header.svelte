<script lang="ts">
  import twemoji from '$lib/utils/twemoji';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import EcosystemAvatar from './ecosystem-avatar.svelte';

  export let ecosystem: Ecosystem;
</script>

<div
  class="ecosystem-profile-header flex flex-col gap-4 items-center sm:flex-row sm:justify-between relative"
>
  <div
    class="max-w-full flex-1 min-w-0 flex flex-col gap-2 items-center sm:flex-row sm:gap-8 sm:items-center"
  >
    <div class="avatar">
      <EcosystemAvatar {ecosystem} size="huge" />
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

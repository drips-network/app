<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import type { AuditLogActor } from '$lib/utils/rpgf/types/auditLog';

  interface Props {
    actor: AuditLogActor;
  }

  let { actor }: Props = $props();
</script>

{#if actor.type === 'user'}
  <IdentityBadge address={actor.walletAddress} />
{:else if actor.type === 'system'}
  <div class="badge">
    <img src="/icons/icon-192.png" alt="Fern Logo" />
    <span class="typo-text">System</span>
  </div>
{:else if actor.type === 'kyc-provider'}
  {#if actor.provider === 'Fern'}
    <div class="badge">
      <img src="/assets/fern-logo.png" alt="Fern Logo" />
      <span class="typo-text">Fern KYC</span>
    </div>
  {:else if actor.provider === 'Treova'}
    <div class="badge">
      <img src="/assets/treova-logo.png" alt="Treova Logo" />
      <span class="typo-text">Treova</span>
    </div>
  {:else}
    <div class="badge">
      <span class="typo-text">KYC Provider</span>
    </div>
  {/if}
{/if}

<style>
  .badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  img {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.75rem;
  }
</style>

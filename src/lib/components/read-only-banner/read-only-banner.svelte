<script lang="ts">
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';
  import network from '$lib/stores/wallet/network';
</script>

{#if network.readOnlyMode}
  <div class="read-only-banner typo-text-small">
    <div class="content">
      <WarningIcon style="height: 1rem; width: 1rem; fill: currentColor; flex-shrink: 0;" />
      <span>
        The official Metis deployment of Drips is now read-only.
        <a href="https://drips.network" target="_blank" rel="noopener noreferrer">
          Visit drips.network
        </a>
        for active deployments.
      </span>
    </div>
  </div>
{/if}

<style>
  .read-only-banner {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.5rem 1rem;
    text-align: center;
    width: 100%;
    view-transition-name: read-only-banner;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  a {
    color: inherit;
    font-weight: bold;
    text-decoration: underline;
  }

  a:hover {
    opacity: 0.8;
  }
</style>

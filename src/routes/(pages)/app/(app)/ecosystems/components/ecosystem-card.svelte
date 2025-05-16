<script lang="ts" context="module">
  export const ECOSYTEM_CARD_FRAGMENT = gql`
    fragment EcosystemCard on EcosystemMainAccount {
      name
      description
      owner {
        address
      }
      totalEarned {
        tokenAddress
        amount
      }
    }
  `;
</script>

<script lang="ts">
  import Box from '$lib/components/icons/Box.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import EcosystemGraph from '$lib/components/illustrations/ecosystem-graph.svelte';
  import type { EcosystemsListItem } from '$lib/utils/ecosystems/schemas';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import formatNumber from '$lib/utils/format-number';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { gql } from 'graphql-request';
  import type { EcosystemCardFragment } from './__generated__/gql.generated';

  export let ecosystem: EcosystemsListItem;
  export let ecosystemChainData: EcosystemCardFragment | undefined;
  export let isHidden: boolean = false;

  $: projectsCountFormatted = formatNumber(ecosystem.nodeCount ?? 0);

  function buildEcosystemUrl(ecosystem: EcosystemsListItem): string {
    return `/app/ecosystems/${ecosystem.id}`;
  }
</script>

<!-- TODO: revise for mobile
 https://www.figma.com/design/vyI7f996JF8zwhnXwAwXdC/%F0%9F%92%A7-Drips?node-id=14154-27574&t=222o2fzNGWe88LkK-4
 -->
<a class="ecosystem-card-wrapper" href={buildEcosystemUrl(ecosystem)}>
  <div class="ecosystem-card" class:hidden-project={isHidden}>
    <div class="background" />
    {#if $$slots.banner}
      <div class="banner">
        <slot name="banner" />
      </div>
    {/if}
    <div class="header">
      <div class="graph">
        <EcosystemGraph />
      </div>
    </div>
    <div class="details">
      <h1 class="name">
        <span class="pixelated">
          {ecosystem.name}
        </span>
      </h1>
      {#if ecosystem.description}
        <p class="description">{ecosystem.description}</p>
      {/if}
      <div class="avatar">
        <!-- vitalik.eth -->
        <IdentityBadge
          disableLink
          address={ecosystemChainData
            ? ecosystemChainData.owner.address
            : ecosystem.ownerAddress || 'TODO'}
          disableTooltip
          size="medium"
        />
      </div>
      <div class="cubbies">
        <div>
          <Box style="fill: var(--color-foreground)" /><strong class="typo-text-bold"
            >Projects</strong
          >{projectsCountFormatted}
        </div>
        {#if ecosystemChainData}
          <div>
            <Coin style="fill: var(--color-foreground)" /><strong class="typo-text-bold"
              >Funds</strong
            >
            <AggregateFiatEstimate amounts={ecosystemChainData?.totalEarned} />
          </div>
        {/if}
      </div>
    </div>
  </div>
</a>

<style>
  .ecosystem-card-wrapper {
    padding: 2px 0;
    margin: -2px 0;
  }

  .ecosystem-card {
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem 0.75rem 0.75rem 0.75rem;
    position: relative;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    transition:
      box-shadow 0.2s,
      backgorund-color 0.2s,
      transform 0.2s;
    aspect-ratio: 1.807;
  }

  @media (max-width: 768px) {
    .ecosystem-card {
      aspect-ratio: 0.593;
    }
  }

  .ecosystem-card-wrapper:hover:not(:active) .ecosystem-card,
  .ecosystem-card-wrapper:focus-visible .ecosystem-card {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .ecosystem-card-wrapper:focus-visible {
    outline: none;
    background-color: var(--color-foreground-level-1);
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    border-radius: 1rem 0 0 0;
    background: linear-gradient(
      180deg,
      var(--color-primary-level-2) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
    text-align: center;
  }

  .header {
    flex-grow: 1;
  }

  .graph {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .hidden-project {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  .avatar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .cubbies {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border-top: 1px solid var(--color-foreground-level-2);
    position: relative;
    top: 0.75rem;
    left: -0.75rem;
    width: calc(100% + 1.5rem);
  }

  .cubbies > * {
    flex-grow: 1;
    border-right: 1px solid var(--color-foreground-level-2);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-basis: 50%;
    gap: 0.25rem;
  }

  .cubbies > *:last-child {
    border-right: none;
  }

  .banner {
    position: absolute;
    width: calc(100% - 4rem);
    z-index: 1;
    left: 2rem;
    top: 2rem;
  }

  @media (max-width: 768px) {
    .banner {
      width: calc(100% - 2rem);
      left: 1rem;
      top: 1rem;
    }
  }

  @keyframes fadeIn {
    to {
      opacity: 0.3;
    }
  }
</style>

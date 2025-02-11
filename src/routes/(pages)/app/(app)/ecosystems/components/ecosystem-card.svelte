<script lang="ts" context="module">
  export const PROJECT_CARD_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_NAME_FRAGMENT}
    fragment ProjectCard on Project {
      ...ProjectName
      isVisible
      source {
        forge
        ownerName
        repoName
      }
      chainData {
        ... on ClaimedProjectData {
          chain
          owner {
            accountId
          }
        }
        ... on UnClaimedProjectData {
          chain
          owner {
            accountId
          }
        }
        ...ProjectAvatar
      }
    }
  `;
</script>

<script lang="ts">
  import { gql } from 'graphql-request';
  import { PROJECT_AVATAR_FRAGMENT } from '$lib/components/project-avatar/project-avatar.svelte';
  import { PROJECT_NAME_FRAGMENT } from '$lib/components/project-badge/components/project-name.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import EcosystemGraph from '$lib/components/illustrations/ecosystem-graph.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let ecosystem: Ecosystem;
  export let isHidden: boolean = false;
  export let isInteractive: boolean = false;

  const donations: number = 186_833.91;
  const currencyFormatterShort = Intl.NumberFormat('en-US', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  });
  const currencyFormatterLong = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  $: donationsFormatted =
    $breakpointsStore?.breakpoint === 'mobile'
      ? currencyFormatterShort.format(donations)
      : currencyFormatterLong.format(donations);

  function buildEcosystemUrl(ecosystem: Ecosystem, exact = true): string {
    return `/app/ecosystems/${ecosystem.id}}${exact ? '?exact' : ''}`;
    // return `/app/ecosystems/github-mhgbrown-${encodeURIComponent('cached_resource')}`;
  }
</script>

<!-- TODO: revise for mobile
 https://www.figma.com/design/vyI7f996JF8zwhnXwAwXdC/%F0%9F%92%A7-Drips?node-id=14154-27574&t=222o2fzNGWe88LkK-4
 -->
<a
  class="ecosystem-card-wrapper"
  class:ecosystem-card-wrapper--interactive={isInteractive}
  href={buildEcosystemUrl(ecosystem)}
>
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
      <p class="description">The essential Ethereum ecosystem.</p>
      <div class="avatar">
        <!-- vitalik.eth -->
        <IdentityBadge
          disableLink
          address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
          disableTooltip
          size="medium"
        />
        <span>with <span>Drips AI</span></span>
      </div>
      <div class="cubbies">
        <div>
          <Box style="fill: var(--color-foreground)" /><strong class="typo-text-bold"
            >Projects</strong
          >2,618
        </div>
        <div>
          <Coin style="fill: var(--color-foreground)" /><strong class="typo-text-bold">Funds</strong
          >{donationsFormatted}
        </div>
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

  .ecosystem-card-wrapper.ecosystem-card-wrapper--interactive .cubbies {
    display: none;
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

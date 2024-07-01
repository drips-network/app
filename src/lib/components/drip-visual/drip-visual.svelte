<script lang="ts" context="module">
  export const DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT = gql`
    fragment DripVisualAddressDriverAccount on AddressDriverAccount {
      driver
      address
    }
  `;

  export const DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT = gql`
    fragment DripVisualNftDriverAccount on NftDriverAccount {
      driver
      accountId
    }
  `;

  export const DRIP_VISUAL_PROJECT_FRAGMENT = gql`
    ${IDENTITY_CARD_PROJECT_FRAGMENT}
    fragment DripVisualProject on Project {
      ...IdentityCardProject
      ... on UnclaimedProject {
        account {
          driver
          accountId
        }
      }
      ... on ClaimedProject {
        account {
          driver
          accountId
        }
      }
    }
  `;

  export const DRIP_VISUAL_DRIP_LIST_FRAGMENT = gql`
    ${IDENTITY_CARD_DRIP_LIST_FRAGMENT}
    fragment DripVisualDripList on DripList {
      ...IdentityCardDripList
    }
  `;

  export const DRIP_VISUAL_USER_FRAGMENT = gql`
    ${DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT}
    fragment DripVisualUser on User {
      account {
        ...DripVisualAddressDriverAccount
      }
    }
  `;
</script>

<script lang="ts">
  import amtDeltaUnitStore, {
    FRIENDLY_NAMES,
    MULTIPLIERS,
  } from '$lib/stores/amt-delta-unit/amt-delta-unit.store';
  import { tweened } from 'svelte/motion';
  import DripsAnimation from '../drips-animation/drips-animation.svelte';
  import FormattedAmount from '../formatted-amount/formatted-amount.svelte';
  import IdentityCard, {
    IDENTITY_CARD_DRIP_LIST_FRAGMENT,
    IDENTITY_CARD_PROJECT_FRAGMENT,
  } from '../identity-card/identity-card.svelte';
  import { gql } from 'graphql-request';
  import query from '$lib/graphql/dripsQL';
  import type {
    DripListNameQuery,
    DripListNameQueryVariables,
    DripVisualAddressDriverAccountFragment,
    DripVisualDripListFragment,
    DripVisualNftDriverAccountFragment,
    DripVisualProjectFragment,
    DripVisualUserFragment,
  } from './__generated__/gql.generated';
  import { browser } from '$app/environment';

  export let from: DripVisualAddressDriverAccountFragment | undefined = undefined;
  export let to:
    | DripVisualNftDriverAccountFragment
    | DripVisualAddressDriverAccountFragment
    | DripVisualProjectFragment
    | DripVisualDripListFragment
    | DripVisualUserFragment
    | undefined = undefined;
  export let visual: 'stream' | 'donation' = 'stream';
  export let disableLinks = false;
  export let amountPerSecond: bigint | undefined = undefined;
  export let halted = false;

  export let tokenInfo: { decimals: number; symbol: string } | undefined = undefined;

  let animationSpeed = tweened(0, {
    duration: 500,
  });

  $: {
    animationSpeed.set(to && amountPerSecond && !halted ? 1 : 0);
  }

  let windowWidth = (browser && window.innerWidth) || 0;
  $: verticalAnimation = windowWidth <= 768;

  function getAmtPerSec() {
    const multiplier = MULTIPLIERS[$amtDeltaUnitStore];

    return (amountPerSecond ?? 0n) * BigInt(multiplier);
  }

  async function fetchDripList(accountId: string) {
    const dripListNameQuery = gql`
      ${IDENTITY_CARD_DRIP_LIST_FRAGMENT}
      query DripListName($id: ID!) {
        dripList(id: $id) {
          ...IdentityCardDripList
        }
      }
    `;

    const result = await query<DripListNameQuery, DripListNameQueryVariables>(dripListNameQuery, {
      id: accountId,
    });

    return result.dripList;
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="drip-visual">
  <div class="no-shrink">
    <IdentityCard disableLink={disableLinks} address={from?.address} title="From" />
  </div>
  <div class="visual relative">
    {#if visual === 'stream'}
      <DripsAnimation vertical={verticalAnimation} speedMultiplier={$animationSpeed} />
    {:else if visual === 'donation'}
      <div
        class="absolute overlay flex items-center justify-center {halted
          ? 'text-foreground-level-3'
          : 'text-primary'} transition duration-200"
      >
        <svg
          class="h-10 transform rotate-90 origin-center md:h-14 md:transform-none"
          viewBox="0 0 84 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M56.9032 56C44.7097 56 28.4516 44.8 -1.22392e-06 28C28.4516 11.2 44.7097 3.76772e-06 56.9032 3.23473e-06C70.4516 2.64251e-06 84 12.6 84 28C84 43.4 70.4516 56 56.9032 56Z"
            fill="currentColor"
          />
        </svg>
      </div>
    {/if}
  </div>
  <div class="no-shrink">
    {#if to && to.__typename === 'AddressDriverAccount'}
      <IdentityCard disableLink={disableLinks} address={to.address} title="To" />
    {:else if to && to.__typename === 'NftDriverAccount'}
      {#await fetchDripList(to.accountId)}
        <IdentityCard loading />
      {:then result}
        {#if result}
          <IdentityCard dripList={result} title="To" />
        {/if}
      {/await}
    {:else if (to && to.__typename === 'ClaimedProject') || (to && to.__typename === 'UnclaimedProject')}
      <IdentityCard disableLink={disableLinks} project={to} title="To" />
    {:else if to && to.__typename === 'DripList'}
      <IdentityCard disableLink={disableLinks} dripList={to} title="To" />
    {:else if to && to.__typename === 'User'}
      <IdentityCard disableLink={disableLinks} address={to.account.address} title="To" />
    {:else}
      <IdentityCard disableLink={disableLinks} address={undefined} title="To" />
    {/if}
  </div>
  {#if tokenInfo}<div class="amt-per-sec typo-text tabular-nums">
      <FormattedAmount
        preserveTrailingZeroes={false}
        decimals={tokenInfo.decimals}
        amount={getAmtPerSec()}
      />
      {tokenInfo.symbol} <span class="muted">/{FRIENDLY_NAMES[$amtDeltaUnitStore]}</span>
    </div>{/if}
</div>

<style>
  .drip-visual {
    position: relative;
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .no-shrink {
    flex-shrink: 0;
  }

  .visual {
    flex: 1;
  }

  .amt-per-sec {
    height: 1.5rem;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--color-background);
    box-shadow: var(--elevation-medium);
    padding: 0 0.5rem;
    border-radius: 0.75rem;
    color: var(--color-foreground-level-6);
  }

  .muted {
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 768px) {
    .drip-visual {
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 128rem;
    }

    .visual {
      height: 8rem;
      width: 12rem;
      flex: initial;
    }

    .amt-per-sec {
      left: unset;
      right: unset;
      transform: unset;
      transform: translateY(-50%);
    }
  }
</style>

<script lang="ts" module>
  import { gql } from 'graphql-request';

  export const DRIP_LIST_CARD_FRAGMENT = gql`
    ${EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT}
    ${SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_ECOSYSTEM_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_ECOSYSTEM_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_SUB_LIST_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_ORCID_RECEIVER_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    ${SUPPORTER_PILE_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    fragment DripListCard on DripList {
      chain
      ...EditDripListFlowDripList
      name
      isVisible
      account {
        accountId
      }
      owner {
        accountId
        address
      }
      splits {
        ... on AddressReceiver {
          ...SplitsComponentAddressReceiver
        }
        ... on ProjectReceiver {
          ...SplitsComponentProjectReceiver
        }
        ... on DripListReceiver {
          ...SplitsComponentDripListReceiver
        }
        ... on EcosystemMainAccountReceiver {
          ...SplitsComponentEcosystemReceiver
        }
        ... on SubListReceiver {
          ...SplitsComponentSubListReceiver
        }
        ... on LinkedIdentityReceiver {
          ...SplitsComponentOrcidReceiver
        }
      }
      totalEarned {
        tokenAddress
        amount
      }
      support {
        ...SupporterPile
        ... on StreamSupport {
          stream {
            timeline {
              ...CurrentAmountsTimelineItem
            }
            config {
              amountPerSecond {
                tokenAddress
              }
            }
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Pen from '$lib/components/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits from '../splits/splits.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import ShareButton from '../share-button/share-button.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import Pile from '../pile/pile.svelte';
  import { browser } from '$app/environment';
  import TextExpandable from '../text-expandable.svelte/text-expandable.svelte';
  import type { DripListCardFragment } from './__generated__/gql.generated';
  import getSupportersPile, { SUPPORTER_PILE_FRAGMENT } from './methods/get-supporters-pile';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import { fade } from 'svelte/transition';
  import { BASE_URL } from '$lib/utils/base-url';
  import twemoji from '$lib/utils/twemoji';
  import {
    CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT,
    currentAmounts,
  } from '$lib/utils/current-amounts';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import { onMount } from 'svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';
  import {
    SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_ECOSYSTEM_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_SUB_LIST_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_ORCID_RECEIVER_FRAGMENT,
  } from '../splits/types';
  import type { SupportedChain } from '$lib/graphql/__generated__/base-types';
  import { NETWORK_CONFIG } from '$lib/stores/wallet/network';
  import CoinFlying from '../icons/CoinFlying.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import formatNumber from '$lib/utils/format-number';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-members/edit-drip-list-steps';
  import { EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT } from '$lib/flows/edit-drip-list/fragments';

  // "partial" is reduced version w/ link to Drip List page for listing contexts
  // "minimal" is similar, but further reduced to just title, owner, description,

  interface Props {
    data: {
      dripList: DripListCardFragment;
    };
    //  total funded, and number of splits
    variant?: 'full' | 'partial' | 'minimal';
    isHidden?: boolean;
    hideTotal?: boolean;
    hideSupporterPile?: boolean;
    hideDescription?: boolean;
    clampTitle?: boolean;
    openInNewTab?: boolean;
    maxSplitRows?: number | undefined;
    chainOverride?: SupportedChain | undefined;
  }

  let {
    data,
    variant = 'full',
    isHidden = false,
    hideTotal = false,
    hideSupporterPile = false,
    hideDescription = false,
    clampTitle = true,
    openInNewTab = false,
    maxSplitRows = undefined,
    chainOverride = undefined,
  }: Props = $props();

  function triggerEditModal() {
    modal.show(Stepper, undefined, editDripListSteps(dripList));
  }

  let incomingStreamsTotalStreamed = $state<{ tokenAddress: string; amount: bigint }[]>();
  function updateIncomingStreamsTotalStreamed() {
    const incomingStreams = mapFilterUndefined(dripList.support, (s) => {
      if (s.__typename === 'StreamSupport') {
        return s.stream;
      }
    });

    incomingStreamsTotalStreamed = mergeAmounts(
      incomingStreams.map((stream) => {
        const amount = currentAmounts(
          stream.timeline,
          stream.config.amountPerSecond.tokenAddress,
        ).currentAmount;

        return {
          tokenAddress: amount.tokenAddress,
          amount: amount.amount / BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER),
        };
      }),
    );
  }
  onMount(() => {
    const tick = tickStore.register(updateIncomingStreamsTotalStreamed);
    return () => tickStore.deregister(tick);
  });

  let dripList = $derived(data.dripList);
  let listOwner = $derived(dripList.owner);
  let isOwnList = $derived($walletStore && checkIsUser(dripList.owner.accountId));
  let title = $derived(dripList.name);
  let description = $derived(dripList.description ?? '');
  let supportersPile = $derived(getSupportersPile(dripList.support, 'tiny'));
  let isPartial = $derived(variant === 'partial');
  let isMinimal = $derived(variant === 'minimal');
  let clampTitleClass = $derived(!clampTitle ? '' : isMinimal ? 'line-clamp-2' : 'line-clamp-1');
  let totalEarned = $derived(
    mergeAmounts(incomingStreamsTotalStreamed ?? [], dripList.totalEarned),
  );
  let urlBase = $derived(
    chainOverride
      ? `https://${Object.values(NETWORK_CONFIG).find((n) => n.gqlName === chainOverride)?.subdomain}`
      : '',
  );
  let dripListUrl = $derived(`${urlBase}/app/drip-lists/${dripList.account.accountId}`);
  let downloadableImageUrl = $derived(
    `${urlBase}/api/share-images/drip-list/${dripList.account.accountId}.png?target=og`,
  );
  let splitsFormatted = $derived(formatNumber(dripList?.splits?.length || 0));
</script>

<svelte:element
  this={isPartial || isMinimal ? 'a' : 'section'}
  href={dripListUrl}
  target={openInNewTab ? '_blank' : undefined}
  class="drip-list-card rounded-drip-lg overflow-hidden shadow-low group"
  class:hidden-list={isHidden}
  class:minimal={isMinimal}
>
  <div class="flex flex-col gap-4">
    <header class="px-6 pt-6 flex flex-col gap-2 lg:gap-4">
      <div class="title-and-actions">
        <h1
          class="{clampTitleClass} title rounded twemoji-text"
          style:font-size={isPartial || isMinimal ? '28px' : undefined}
        >
          {@html twemoji(title)}
        </h1>
        {#if !isPartial && !isMinimal}
          <div class="flex items-center gap-2 -my-1">
            <ShareButton
              buttonVariant="normal"
              url="{BASE_URL}{dripListUrl}"
              {downloadableImageUrl}
              disabled={!dripList.isVisible}
            />
            {#if isOwnList}
              <Button disabled={!dripList.isVisible} onclick={triggerEditModal} icon={Pen}
                >Edit list</Button
              >
            {/if}
          </div>
        {/if}
      </div>
      {#if !hideDescription && description.length > 0}
        <div class="description twemoji-text" class:typo-text-small={isMinimal}>
          <TextExpandable
            numberOfLines={isPartial || isMinimal ? 2 : 4}
            isExpandable={!isPartial && !isMinimal}
          >
            {@html twemoji(description)}
          </TextExpandable>
        </div>
      {/if}
      {#if !isPartial}
        <div class="flex gap-2">
          {#if !isMinimal}Created by
          {/if}<IdentityBadge
            showAvatar={true}
            showIdentity={true}
            address={listOwner.address}
            disableTooltip={true}
          />
        </div>
      {/if}
    </header>

    {#if !isMinimal}
      <section class="list">
        <div class="flex flex-col gap-1.5">
          <div class="totals">
            <div class="drip-icon">
              <Drip />
            </div>
            {#if !hideTotal}
              <div class="typo-text tabular-nums total-streamed-badge">
                {#if browser}
                  <AggregateFiatEstimate supressUnknownAmountsWarning amounts={totalEarned} />
                {/if}
                <span class="muted">&nbsp;total</span>
              </div>
            {/if}
            {#if !hideSupporterPile && supportersPile.length > 0}
              <div
                in:fade={{ duration: 300 }}
                class="hide-on-mobile flex items-center gap-1.5 min-w-0"
              >
                <span class="typo-text-small truncate muted">Supported by</span>
                <Pile maxItems={3} components={supportersPile} itemsClickable={!isPartial} />
              </div>
            {/if}
          </div>
          <PaddedHorizontalScroll disableScroll={isPartial}>
            <div class="splits-component" style:pointer-events={isPartial ? 'none' : undefined}>
              <Splits
                disableLinks={isPartial}
                maxRows={maxSplitRows ??
                  (isPartial ? (dripList.description && !hideDescription ? 3 : 4) : undefined)}
                groupsExpandable={!isPartial}
                list={dripList.splits}
                {chainOverride}
              />
            </div>
          </PaddedHorizontalScroll>
        </div>
      </section>
    {/if}

    {#if isMinimal}
      <section class="cubbies">
        <div>
          <CoinFlying style="fill: var(--color-foreground)" /><AggregateFiatEstimate
            supressUnknownAmountsWarning
            amounts={totalEarned}
            compact
          />
        </div>
        <div><DripListIcon style="fill: var(--color-foreground)" />{splitsFormatted}</div>
      </section>
    {/if}
  </div>
</svelte:element>

<style>
  .drip-list-card {
    box-shadow: var(--elevation-low);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    position: relative;
    background: var(--color-background);
  }

  a.drip-list-card:hover,
  a.drip-list-card:focus-visible {
    box-shadow: var(--elevation-medium);
    transform: translateY(-0.125rem);
  }

  .drip-list-card .title-and-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    text-align: left;
  }

  .drip-list-card .title-and-actions {
    flex-wrap: wrap;
  }

  .drip-list-card .title-and-actions h1 {
    min-width: fit-content;
  }

  .totals {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .totals .drip-icon {
    width: 1.5rem;
  }

  .totals .total-streamed-badge {
    background-color: var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

  .list {
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .splits-component {
    margin-left: 10px;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }

  .cubbies {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--color-foreground-level-2);
    position: relative;
    left: -0.5rem;
    width: calc(100% + 1rem);
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

  .drip-list-card.minimal {
    height: 16.5rem;
  }

  .drip-list-card.minimal .title {
    line-height: 1.15;
  }

  .drip-list-card.minimal > div {
    height: 100%;
  }

  .drip-list-card.minimal header {
    height: 100%;
  }

  .drip-list-card.minimal .description {
    order: 3;
    margin-top: auto;
  }

  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none;
    }
  }

  .hidden-list {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 0.3;
    }
  }
</style>

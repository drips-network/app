<script lang="ts" context="module">
  export const SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${PROJECT_BADGE_FRAGMENT}
    fragment SupportersSectionSupportItem on SupportItem {
      ... on DripListSupport {
        account {
          accountId
        }
        date
        dripList {
          ...DripListBadge
        }
        weight
      }
      ... on OneTimeDonationSupport {
        account {
          accountId
        }
        amount {
          amount
          tokenAddress
        }
        date
      }
      ... on ProjectSupport {
        account {
          accountId
          driver
        }
        date
        project {
          ...ProjectBadge
        }
        weight
      }
    }
  `;
</script>

<script lang="ts">
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import SectionHeader from '../section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import type { Stream } from '$lib/stores/streams/types';
  import SupportItem from './components/support-item.svelte';
  import { gql } from 'graphql-request';
  import type { SupportersSectionSupportItemFragment } from './__generated__/gql.generated';
  import balancesStore from '$lib/stores/balances/balances.store';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import { AddressDriverClient, constants, Utils, type SplitEvent } from 'radicle-drips';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import formatDate from '$lib/utils/format-date';
  import aggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '../drip-list-badge/drip-list-badge.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import formatAmtPerSec from '$lib/stores/amt-delta-unit/utils/format-amt-per-sec';
  import { browser } from '$app/environment';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildStreamUrl from '$lib/utils/build-stream-url';
  import streamState, { STREAM_STATE_LABELS } from '$lib/utils/stream-state';
  import unreachable from '$lib/utils/unreachable';
  import streamsStore from '$lib/stores/streams/streams.store';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { onMount } from 'svelte';

  export let supportItems: SupportersSectionSupportItemFragment[];
  export let supportStreams: Stream[] = [];
  export let accountId: string;
  export let ownerAccountId: string | undefined = undefined;

  export let forceLoading = false;
  export let type: 'project' | 'dripList';
  export let headline = 'Support';
  export let emptyStateHeadline = 'No supporters';
  export let emptyStateText = `This ${
    type === 'dripList' ? 'Drip List' : 'project'
  } doesnʼt have any supporters yet.`;

  export let infoTooltip: string | undefined = undefined;

  interface StreamSupport {
    __typename: 'StreamSupport';
    account: {
      __typename: 'AddressDriverAccount';
      accountId: string;
    };
    stream: Stream;
  }

  $: allItems = [
    ...supportItems,
    ...supportStreams.map<StreamSupport>((stream) => ({
      __typename: 'StreamSupport',
      account: {
        __typename: 'AddressDriverAccount',
        accountId: stream.sender.accountId,
      },
      stream,
    })),
  ];

  // Our API currently doesn't track split amounts yet, so we need to aggregate them manually here.
  let projectAndDripListSupportAmounts: {
    [accountId: string]: { tokenAddress: string; amount: bigint }[] | 'pending';
  } = {};

  let incomingSplitEvents: SplitEvent[] | undefined = undefined;
  onMount(async () => {
    const subgraphClient = getSubgraphClient();
    incomingSplitEvents = await subgraphClient.getSplitEventsByReceiverAccountId(accountId);
  });

  function updateProjectAndDripListSupportAmounts(
    items: typeof allItems,
    incomingSplitEvents: SplitEvent[],
  ) {
    items.forEach((i) => {
      if (i.__typename === 'ProjectSupport' || i.__typename === 'DripListSupport') {
        if (projectAndDripListSupportAmounts[i.account.accountId] === undefined) {
          const splitEventsFromReceiver = incomingSplitEvents.filter(
            (e) => e.accountId === i.account.accountId,
          );

          projectAndDripListSupportAmounts[i.account.accountId] = splitEventsFromReceiver.reduce<
            {
              tokenAddress: string;
              amount: bigint;
            }[]
          >((acc, curr) => {
            const currTokenAddress = Utils.Asset.getAddressFromId(curr.assetId);
            const existing = acc.find((e) => e.tokenAddress === currTokenAddress);

            if (existing) {
              existing.amount += curr.amount;
            } else {
              acc.push({
                tokenAddress: currTokenAddress,
                amount: curr.amount,
              });
            }

            return acc;
          }, []);
        }
      }
    });
  }
  $: browser &&
    incomingSplitEvents &&
    updateProjectAndDripListSupportAmounts(allItems, incomingSplitEvents);

  $: allItemsWithAmount = mapFilterUndefined(allItems, (i) => {
    if (i.__typename === 'StreamSupport') {
      $balancesStore;

      const estimate = balancesStore.getEstimateByStreamId(i.stream.id);

      return {
        ...i,
        amounts: estimate
          ? [
              {
                __typename: 'Amount',
                tokenAddress: i.stream.streamConfig.amountPerSecond.tokenAddress,
                amount: estimate.totalStreamed,
              },
            ]
          : undefined,
      };
    } else if (i.__typename === 'OneTimeDonationSupport') {
      return {
        ...i,
        amounts: [
          {
            __typename: 'Amount',
            tokenAddress: i.amount.tokenAddress,
            amount: BigInt(i.amount.amount),
          },
        ],
      };
    } else if (i.__typename === 'ProjectSupport' || i.__typename === 'DripListSupport') {
      const incomingSplitTotal = projectAndDripListSupportAmounts[i.account.accountId];

      return {
        ...i,
        amounts:
          incomingSplitTotal === 'pending' || incomingSplitTotal === undefined
            ? undefined
            : incomingSplitTotal.map((ist) => ({
                __typename: 'Amount',
                tokenAddress: ist.tokenAddress,
                amount: ist.amount,
              })),
      };
    } else {
      return undefined;
    }
  });

  const tokensStoreConnectedReadable = tokensStore.connected;
  const fiatEstimatesStartedReadable = fiatEstimates.started;

  $: allTokenAddresses = allItemsWithAmount.reduce<string[]>((acc, i) => {
    if (!i.amounts) return acc;

    return [...acc, ...i.amounts.map((a) => a.tokenAddress)];
  }, []);

  $: $fiatEstimatesStartedReadable &&
    $tokensStoreConnectedReadable &&
    fiatEstimates.track(allTokenAddresses);

  $: priceReadable = fiatEstimates.price(allTokenAddresses);

  $: allItemsWithFiatEstimate =
    $priceReadable &&
    allItemsWithAmount.map((i) => {
      if (!$tokensStoreConnectedReadable) {
        return {
          ...i,
          fiatEstimate: {
            fiatEstimateCents: 'pending' as const,
            includesUnknownPrice: false,
          },
        };
      }

      const { amounts } = i;

      if (!amounts) {
        return {
          ...i,
          fiatEstimate: {
            fiatEstimateCents: 'pending' as const,
            includesUnknownPrice: false,
          },
        };
      }

      if (i.__typename === 'StreamSupport') {
        amounts[0].amount = amounts[0].amount / BigInt(constants.AMT_PER_SEC_MULTIPLIER);
      }

      const aggregateEstimate = aggregateFiatEstimate(priceReadable, amounts);

      return {
        ...i,
        fiatEstimate: aggregateEstimate,
      };
    });

  let sortBy = 'amount';

  $: sorted = allItemsWithFiatEstimate.sort((a, b) => {
    if (sortBy === 'amount') {
      return Number(b.fiatEstimate.fiatEstimateCents) - Number(a.fiatEstimate.fiatEstimateCents);
    } else {
      return 0;
    }
  });

  function getOneTimeDonationSubAmountLabel(item: (typeof sorted)[number]) {
    if (item.__typename !== 'OneTimeDonationSupport') {
      throw new Error(
        'getOneTimeDonationSubAmountLabel only works for OneTimeDonationSupport items',
      );
    }

    const token = tokensStore.getByAddress(item.amounts[0].tokenAddress);

    if (!token) return 'Unknown token';

    return `${formatTokenAmount(item.amounts[0], token.info.decimals, 1n, false)} ${
      token.info.symbol
    }`;
  }

  function getStreamSupportSubAmountLabel(item: (typeof sorted)[number]) {
    if (item.__typename !== 'StreamSupport') {
      throw new Error(
        'getOneTimeDonationSubAmountLabel only works for OneTimeDonationSupport items',
      );
    }

    const token =
      (item.amounts && tokensStore.getByAddress(item.amounts[0].tokenAddress)) ?? undefined;

    if (!token) return 'Unknown token';

    const { stream } = item;

    return `${
      STREAM_STATE_LABELS[
        streamState(
          item.stream.id,
          item.stream.streamConfig.startDate,
          stream.streamConfig.durationSeconds,
          stream.paused,
          balancesStore.getEstimateByStreamId(item.stream.id) ?? unreachable(),
          streamsStore.getAssetConfig(stream.sender.accountId, token?.info.address) ??
            unreachable(),
        )
      ]
    } · ${formatAmtPerSec(
      item.stream.streamConfig.amountPerSecond.amount,
      token.info.decimals,
      token.info.symbol,
    )}`;
  }
</script>

<section class="app-section">
  <SectionHeader {infoTooltip} icon={Heart} label={headline} />
  <SectionSkeleton
    loaded={!forceLoading &&
      $tokensStoreConnectedReadable &&
      !allItemsWithFiatEstimate.find((i) => i.fiatEstimate.fiatEstimateCents === 'pending')}
    empty={sorted.length === 0}
    emptyStateEmoji="🫧"
    {emptyStateHeadline}
    {emptyStateText}
  >
    <div class="items">
      {#each sorted as item}
        {#if item.__typename === 'OneTimeDonationSupport'}
          <SupportItem
            tokenAddress={item.amount.tokenAddress}
            title={{
              component: IdentityBadge,
              props: {
                tag: item.account.accountId === ownerAccountId ? 'Owner' : undefined,
                disableTooltip: true,
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimate={item.fiatEstimate}
            subAmount={getOneTimeDonationSubAmountLabel(item)}
          />
        {/if}
        {#if item.__typename === 'StreamSupport'}
          {@const stream = item.stream}
          <SupportItem
            tokenAddress={item.stream.streamConfig.amountPerSecond.tokenAddress}
            href={buildStreamUrl(
              stream.sender.accountId,
              stream.streamConfig.amountPerSecond.tokenAddress,
              stream.streamConfig.dripId,
            )}
            title={{
              component: IdentityBadge,
              props: {
                disableTooltip: true,
                tag: stream.sender.accountId === ownerAccountId ? 'Owner' : undefined,
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            fiatEstimate={item.fiatEstimate}
            subAmount={getStreamSupportSubAmountLabel(item)}
          />
        {/if}
        {#if item.__typename === 'DripListSupport'}
          <SupportItem
            href="/app/drip-lists/{item.dripList.account.accountId}"
            title={{
              component: DripListBadge,
              props: {
                isLinked: false,
                avatarSize: 'tiny',
                dripList: item.dripList,
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimate={item.fiatEstimate}
            subAmount={`splits ${getSplitPercent(item.weight, 'pretty')} of funds`}
          />
        {/if}
        {#if item.__typename === 'ProjectSupport'}
          {@const source = item.project.source}
          <SupportItem
            href={buildProjectUrl(source.forge, source.ownerName, source.repoName)}
            title={{
              component: ProjectBadge,
              props: {
                linkTo: 'nothing',
                tooltip: false,
                size: 'tiny',
                project: item.project,
                maxWidth: false,
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimate={item.fiatEstimate}
            subAmount={`splits ${getSplitPercent(item.weight, 'pretty')} of funds`}
          />
        {/if}
      {/each}
    </div>
  </SectionSkeleton>
</section>

<style>
  .items {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>

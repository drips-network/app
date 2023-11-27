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
  import Droplet from 'radicle-design-system/icons/Droplet.svelte';
  import { AddressDriverClient, constants } from 'radicle-drips';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import formatDate from '$lib/utils/format-date';
  import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import aggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate';
  import DripList from 'radicle-design-system/icons/DripList.svelte';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '../drip-list-badge/drip-list-badge.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import formatAmtPerSec from '$lib/stores/amt-delta-unit/utils/format-amt-per-sec';
  import unreachable from '$lib/utils/unreachable';
  import { browser } from '$app/environment';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildStreamUrl from '$lib/utils/build-stream-url';

  export let supportItems: SupportersSectionSupportItemFragment[];
  export let supportStreams: Stream[] = [];
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

  function updateProjectAndDripListSupportAmounts(items: typeof allItems) {
    items.forEach(async (i) => {
      if (i.__typename === 'ProjectSupport' || i.__typename === 'DripListSupport') {
        if (projectAndDripListSupportAmounts[i.account.accountId] === undefined) {
          projectAndDripListSupportAmounts[i.account.accountId] = 'pending';

          projectAndDripListSupportAmounts[i.account.accountId] = await getIncomingSplitTotal(
            i.account.accountId,
          );
        }
      }
    });
  }
  $: browser && updateProjectAndDripListSupportAmounts(allItems);

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

  function getSubAmount(item: (typeof sorted)[number]) {
    if (item.__typename === 'ProjectSupport' || item.__typename === 'DripListSupport') {
      return '...';
    }

    if (!$tokensStoreConnectedReadable || !item.amounts) {
      return '...';
    }

    const token = tokensStore.getByAddress(item.amounts[0].tokenAddress);

    if (!token) return 'Unknown token';

    const precisionMultiplier = item.__typename === 'StreamSupport' ? undefined : 1n;
    const preserveTrailingZeroes = item.__typename === 'StreamSupport';

    return `${formatTokenAmount(
      item.amounts[0],
      token.info.decimals,
      precisionMultiplier,
      preserveTrailingZeroes,
    )} ${token.info.symbol}`;
  }
</script>

<section class="app-section">
  <SectionHeader {infoTooltip} icon={Heart} label={headline} />
  <SectionSkeleton
    loaded={!forceLoading &&
      $tokensStoreConnectedReadable &&
      !allItemsWithFiatEstimate.find((i) => i.fiatEstimate.fiatEstimateCents === 'pending')}
    empty={false}
    emptyStateEmoji="🫧"
    {emptyStateHeadline}
    {emptyStateText}
  >
    <div class="items">
      {#each sorted as item}
        {#if item.__typename === 'OneTimeDonationSupport'}
          <SupportItem
            icon={Droplet}
            title={{
              component: IdentityBadge,
              props: {
                disableTooltip: true,
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimateCents={item.fiatEstimate.fiatEstimateCents}
            subAmount={getSubAmount(item)}
          />
        {/if}
        {#if item.__typename === 'StreamSupport'}
          {@const stream = item.stream}
          {@const token =
            ($tokensStore &&
              tokensStore.getByAddress(stream.streamConfig.amountPerSecond.tokenAddress)) ??
            unreachable()}
          <SupportItem
            href={buildStreamUrl(
              stream.sender.address,
              token.info.address,
              stream.streamConfig.dripId,
            )}
            icon={TokenStreams}
            title={{
              component: IdentityBadge,
              props: {
                disableTooltip: true,
                tag: stream.sender.accountId === ownerAccountId ? 'Owner' : undefined,
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            fiatEstimateCents={item.fiatEstimate.fiatEstimateCents}
            subAmount={formatAmtPerSec(
              item.stream.streamConfig.amountPerSecond.amount,
              token.info.decimals,
              token.info.symbol,
            )}
          />
        {/if}
        {#if item.__typename === 'DripListSupport'}
          <SupportItem
            href="/app/drip-lists/{item.dripList.account.accountId}"
            icon={DripList}
            title={{
              component: DripListBadge,
              props: {
                isLinked: false,
                avatarSize: 'small',
                dripList: item.dripList,
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimateCents={item.fiatEstimate.fiatEstimateCents}
            subAmount={`${getSplitPercent(item.weight)}% of incoming funds`}
          />
        {/if}
        {#if item.__typename === 'ProjectSupport'}
          {@const source = item.project.source}
          <SupportItem
            href={buildProjectUrl(source.forge, source.ownerName, source.repoName)}
            icon={Box}
            title={{
              component: ProjectBadge,
              props: {
                linkTo: 'nothing',
                tooltip: false,
                size: 'tiny',
                project: item.project,
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimateCents={item.fiatEstimate.fiatEstimateCents}
            subAmount={`${getSplitPercent(item.weight)}% of incoming funds`}
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

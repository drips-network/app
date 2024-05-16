<script lang="ts" context="module">
  export const SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${PROJECT_BADGE_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
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
      ... on StreamSupport {
        stream {
          config {
            amountPerSecond {
              amount
              tokenAddress
            }
            dripId
          }
          sender {
            account {
              accountId
              address
            }
          }
          timeline {
            ...CurrentAmountsTimelineItem
          }
        }
        date
      }
    }
  `;
</script>

<script lang="ts">
  import Heart from '$lib/components/icons/Heart.svelte';
  import SectionHeader from '../section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import SupportItem from './components/support-item.svelte';
  import { gql } from 'graphql-request';
  import type { SupportersSectionSupportItemFragment } from './__generated__/gql.generated';
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
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { onMount } from 'svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT } from '$lib/flows/create-stream-flow/methods/current-amounts';

  export let supportItems: SupportersSectionSupportItemFragment[];
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
    items: SupportersSectionSupportItemFragment[],
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
    updateProjectAndDripListSupportAmounts(supportItems, incomingSplitEvents);

  const tokensStoreConnectedReadable = tokensStore.connected;
  const fiatEstimatesStartedReadable = fiatEstimates.started;

  // function getOneTimeDonationSubAmountLabel(item: (typeof sorted)[number]) {
  //   if (item.__typename !== 'OneTimeDonationSupport') {
  //     throw new Error(
  //       'getOneTimeDonationSubAmountLabel only works for OneTimeDonationSupport items',
  //     );
  //   }

  //   const token = tokensStore.getByAddress(item.amounts[0].tokenAddress);

  //   if (!token) return 'Unknown token';

  //   return `${formatTokenAmount(item.amounts[0], token.info.decimals, 1n, false)} ${
  //     token.info.symbol
  //   }`;
  // }

  // function getStreamSupportSubAmountLabel(item: (typeof sorted)[number]) {
  //   if (item.__typename !== 'StreamSupport') {
  //     throw new Error(
  //       'getOneTimeDonationSubAmountLabel only works for OneTimeDonationSupport items',
  //     );
  //   }

  //   const token =
  //     (item.amounts && tokensStore.getByAddress(item.amounts[0].tokenAddress)) ?? undefined;

  //   if (!token) return 'Unknown token';

  //   const { stream } = item;

  //   return `${
  //     STREAM_STATE_LABELS[
  //       streamState(
  //         item.stream.id,
  //         item.stream.streamConfig.startDate,
  //         stream.streamConfig.durationSeconds,
  //         stream.paused,
  //         balancesStore.getEstimateByStreamId(item.stream.id) ?? unreachable(),
  //         streamsStore.getAssetConfig(stream.sender.accountId, token?.info.address) ??
  //           unreachable(),
  //       )
  //     ]
  //   } · ${formatAmtPerSec(
  //     item.stream.streamConfig.amountPerSecond.amount,
  //     token.info.decimals,
  //     token.info.symbol,
  //   )}`;
</script>

<section class="app-section">
  <SectionHeader {infoTooltip} icon={Heart} label={headline} />
  <SectionSkeleton
    loaded={true}
    empty={supportItems.length === 0}
    emptyStateEmoji="🫧"
    {emptyStateHeadline}
    {emptyStateText}
  >
    <div class="items">
      {#each supportItems as item}
        <!-- {#if item.__typename === 'OneTimeDonationSupport'}
          <SupportItem
            tokenAddress={item.amount.tokenAddress}
            title={{
              component: IdentityBadge,
              props: {
                tag:
                  item.account.accountId === $walletStore.dripsAccountId
                    ? 'You'
                    : item.account.accountId === ownerAccountId
                    ? 'Owner'
                    : undefined,
                disableTooltip: true,
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            subtitle={formatDate(item.date)}
            fiatEstimate={item.fiatEstimate}
            subAmount={getOneTimeDonationSubAmountLabel(item)}
          />
        {/if} -->
        {#if item.__typename === 'StreamSupport'}
          {@const stream = item.stream}
          <SupportItem
            tokenAddress={item.stream.config.amountPerSecond.tokenAddress}
            href={buildStreamUrl(
              stream.sender.account.accountId,
              stream.config.amountPerSecond.tokenAddress,
              stream.config.dripId,
            )}
            title={{
              component: IdentityBadge,
              props: {
                disableTooltip: true,
                tag:
                  stream.sender.account.accountId === $walletStore.dripsAccountId
                    ? 'You'
                    : stream.sender.account.accountId === ownerAccountId
                    ? 'Owner'
                    : undefined,
                address: item.stream.sender.account.address,
              },
            }}
            subAmount={'sub amount'}
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

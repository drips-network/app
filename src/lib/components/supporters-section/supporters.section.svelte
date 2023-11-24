<script lang="ts" context="module">
  export const SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT = gql`
    fragment SupportersSectionSupportItem on SupportItem {
      ... on DripListSupport {
        account {
          accountId
        }
      }
      ... on OneTimeDonationSupport {
        account {
          accountId
        }
        amount {
          amount
          tokenAddress
        }
      }
      ... on ProjectSupport {
        account {
          accountId
          driver
        }
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
  import assert from '$lib/utils/assert';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import Droplet from 'radicle-design-system/icons/Droplet.svelte';
  import { AddressDriverClient } from 'radicle-drips';
  import formatTokenAmount from '$lib/utils/format-token-amount';

  export let supportItems: SupportersSectionSupportItemFragment[];
  export let supportStreams: Stream[] = [];

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

  $: allItemsWithAmount = mapFilterUndefined(allItems, (i) => {
    if (i.__typename === 'StreamSupport') {
      $balancesStore;

      const estimate = balancesStore.getEstimateByStreamId(i.stream.id);
      assert(estimate);

      return {
        ...i,
        amount: {
          __typename: 'Amount',
          tokenAddress: estimate.tokenAddress,
          amount: estimate.totalStreamed,
        },
      };
    } else if (i.__typename === 'OneTimeDonationSupport') {
      return {
        ...i,
        amount: {
          __typename: 'Amount',
          tokenAddress: i.amount.tokenAddress,
          amount: BigInt(i.amount.amount),
        },
      };
    } else {
      return undefined;
    }
  });

  const tokensStoreConnectedReadable = tokensStore.connected;
  $: $tokensStoreConnectedReadable &&
    fiatEstimates.track(allItemsWithAmount.map((i) => i.amount.tokenAddress));

  $: allItemsWithFiatEstimate = allItemsWithAmount.map((i) => {
    if (!$tokensStoreConnectedReadable) {
      return {
        ...i,
        fiatEstimateUsd: 'pending' as const,
      };
    }

    const { amount } = i;
    const token = tokensStore.getByAddress(amount.tokenAddress);

    if (!token) {
      return {
        ...i,
        fiatEstimateUsd: undefined,
      };
    }

    const converted = fiatEstimates.convert(amount, token.info.decimals);

    return {
      ...i,
      fiatEstimateUsd: converted ?? ('unsupported' as const),
    };
  });

  let sortBy = 'amount';

  $: sorted = allItemsWithFiatEstimate.sort((a, b) => {
    if (sortBy === 'amount') {
      return Number(b.fiatEstimateUsd) - Number(a.fiatEstimateUsd);
    } else {
      return 0;
    }
  });

  function getSubAmount(item: (typeof sorted)[number]) {
    if (!$tokensStoreConnectedReadable) {
      return '...';
    }

    const token = tokensStore.getByAddress(item.amount.tokenAddress);

    if (!token) return 'Unknown token';

    return `${formatTokenAmount(item.amount, token.info.decimals, 1n, false)} ${token.info.symbol}`;
  }
</script>

<section class="app-section">
  <SectionHeader {infoTooltip} icon={Heart} label={headline} />
  <SectionSkeleton
    loaded={true}
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
                address: AddressDriverClient.getUserAddress(item.account.accountId),
              },
            }}
            subtitle="Date goes here"
            fiatEstimateCents={item.fiatEstimateUsd}
            subAmount={getSubAmount(item)}
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
  }
</style>

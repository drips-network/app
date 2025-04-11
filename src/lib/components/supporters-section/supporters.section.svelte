<script lang="ts" context="module">
  export const SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${PROJECT_BADGE_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    ${STREAM_STATE_STREAM_FRAGMENT}
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
        totalSplit {
          tokenAddress
          amount
        }
      }
      ... on OneTimeDonationSupport {
        account {
          accountId
          address
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
        totalSplit {
          tokenAddress
          amount
        }
      }
      ... on StreamSupport {
        stream {
          ...StreamStateStream
          config {
            amountPerSecond {
              amount
              tokenAddress
            }
            dripId
          }
          createdAt
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
  import type SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import SupportItem from './components/support-item.svelte';
  import { gql } from 'graphql-request';
  import type { SupportersSectionSupportItemFragment } from './__generated__/gql.generated';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import formatDate from '$lib/utils/format-date';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '../drip-list-badge/drip-list-badge.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildStreamUrl from '$lib/utils/build-stream-url';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT } from '$lib/utils/current-amounts';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import RealtimeAmount from '../amount/realtime-amount.svelte';
  import streamState, {
    STREAM_STATE_LABELS,
    STREAM_STATE_STREAM_FRAGMENT,
  } from '$lib/utils/stream-state';
  import formatAmtPerSec from '$lib/stores/amt-delta-unit/utils/format-amt-per-sec';
  import { fade } from 'svelte/transition';
  import AddUnknownTokenButton from './components/add-unknown-token-button.svelte';
  import Section from '../section/section.svelte';

  export let supportItems: SupportersSectionSupportItemFragment[];

  export let ownerAccountId: string | undefined = undefined;

  export let type: 'project' | 'dripList' | 'address' | 'ecosystem';
  export let headline = 'Support';
  export let emptyStateHeadline = 'No supporters';

  export let collapsed = false;
  export let collapsable = false;

  let emptyStateText: string;
  $: {
    switch (type) {
      case 'project':
        emptyStateText = `This project doesnʼt have any supporters yet.`;
        break;
      case 'dripList':
        emptyStateText = `This Drip List doesnʼt have any supporters yet.`;
        break;
      case 'address':
        emptyStateText = `This user doesnʼt have any supporters yet.`;
        break;
      case 'ecosystem':
        emptyStateText = `This ecosystem doesnʼt have any supporters yet.`;
        break;
    }
  }

  export let infoTooltip: string | undefined = undefined;

  /** Bind to this to get the section skeleton instance of this section. */
  export let sectionSkeleton: SectionSkeleton | undefined = undefined;
</script>

<section class="app-section">
  <Section
    bind:collapsed
    bind:collapsable
    header={{
      icon: Heart,
      label: headline,
      infoTooltip,
    }}
    skeleton={{
      loaded: true,
      empty: supportItems.length === 0,
      emptyStateEmoji: '🫧',
      emptyStateHeadline,
      emptyStateText,
    }}
    bind:skeletonInstance={sectionSkeleton}
  >
    <div class="items">
      {#each supportItems as item}
        {#if item.__typename === 'OneTimeDonationSupport'}
          <SupportItem
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
                address: item.account.address,
              },
            }}
            subtitle={formatDate(item.date)}
          >
            <svelte:fragment slot="amount-value">
              <AggregateFiatEstimate amounts={[item.amount]} />
            </svelte:fragment>
            <svelte:fragment slot="amount-sub">
              {@const amount = item.amount}
              {@const token = $tokensStore && tokensStore.getByAddress(amount.tokenAddress)}
              {#if token}
                <div in:fade|global={{ duration: 300 }}>
                  {formatTokenAmount(
                    {
                      tokenAddress: amount.tokenAddress,
                      amount: BigInt(amount.amount),
                    },
                    token.info.decimals,
                    1n,
                    false,
                  )}
                  {token.info.symbol}
                </div>
              {:else if tokensStore.customTokensLoaded}
                <AddUnknownTokenButton tokenAddress={amount.tokenAddress} />
              {:else}
                <!-- Placeholder for right height during SSR -->
                <span>⠀</span>
              {/if}
            </svelte:fragment>
          </SupportItem>
        {/if}
        {#if item.__typename === 'StreamSupport'}
          {@const stream = item.stream}
          <SupportItem
            href={buildStreamUrl(
              stream.sender.account.accountId,
              stream.config.amountPerSecond.tokenAddress,
              stream.config.dripId,
            )}
            subtitle={formatDate(item.stream.createdAt)}
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
          >
            <svelte:fragment slot="amount-value">
              <RealtimeAmount
                unknownTokenButton={false}
                showFiatValue
                showDelta={false}
                timeline={stream.timeline}
                tokenAddress={stream.config.amountPerSecond.tokenAddress}
              />
            </svelte:fragment>
            <svelte:fragment slot="amount-sub">
              {@const token =
                $tokensStore &&
                tokensStore.getByAddress(stream.config.amountPerSecond.tokenAddress)}
              {#if token}
                <div in:fade|global={{ duration: 300 }}>
                  {STREAM_STATE_LABELS[streamState(stream)]} · {formatAmtPerSec(
                    BigInt(stream.config.amountPerSecond.amount),
                    token.info.decimals,
                    token.info.symbol,
                  )}
                </div>
              {:else}
                <!-- Placeholder for right height during SSR -->
                <span>⠀</span>
              {/if}
            </svelte:fragment>
          </SupportItem>
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
          >
            <svelte:fragment slot="amount-value">
              <AggregateFiatEstimate amounts={item.totalSplit} />
            </svelte:fragment>
            <svelte:fragment slot="amount-sub">
              Splits {getSplitPercent(item.weight, 'pretty')} of funds
            </svelte:fragment>
          </SupportItem>
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
          >
            <svelte:fragment slot="amount-value">
              <AggregateFiatEstimate amounts={item.totalSplit} />
            </svelte:fragment>
            <svelte:fragment slot="amount-sub">
              Splits {getSplitPercent(item.weight, 'pretty')} of funds
            </svelte:fragment>
          </SupportItem>
        {/if}
        <!-- TODO: also ecosystem support -->
      {/each}
    </div>
  </Section>
</section>

<style>
  .items {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>

<script lang="ts">
  import type getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import SectionHeader from '../section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import ProjectBadge from '../project-badge/project-badge.svelte';
  import type { Stream } from '$lib/stores/streams/types';
  import Amount from '../amount/amount.svelte';
  import StreamStateBadge from '../stream-state-badge/stream-state-badge.svelte';
  import DripListBadge from '../drip-list-badge/drip-list-badge.svelte';
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import createDripListStreamSteps from '$lib/flows/create-drip-list-stream/create-drip-list-stream-steps';

  export let type: 'project' | 'dripList';
  export let headline = 'Supporters';
  export let emptyStateHeadline = 'No supporters';
  export let emptyStateText = `This ${
    type === 'dripList' ? 'Drip List' : 'project'
  } doesnʼt have any supporters yet.`;
  export let isDripListOwner = false;
  export let dripListId: string | undefined = undefined;

  export let infoTooltip: string | undefined = undefined;

  export let incomingSplits:
    | ReturnType<typeof getIncomingSplits>
    | Awaited<ReturnType<typeof getIncomingSplits>>
    | undefined;

  export let forceLoading = false;
  export let supportStreams: Stream[] = [];

  function flattenIncomingSplits(incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>>) {
    return [
      ...incomingSplits.dripLists.map((v) => ({ type: 'dripList' as const, item: v })),
      ...incomingSplits.projects.map((v) => ({ type: 'project' as const, item: v })),
      ...incomingSplits.users.map((v) => ({ type: 'user' as const, item: v })),
    ];
  }
</script>

<section class="app-section">
  <SectionHeader
    {infoTooltip}
    icon={Heart}
    label={headline}
    actions={type === 'dripList' && isDripListOwner && dripListId
      ? [
          {
            label: 'New support stream',
            icon: Plus,
            handler: () =>
              dripListId && modal.show(Stepper, undefined, createDripListStreamSteps(dripListId)),
            variant: 'primary',
          },
        ]
      : []}
  />
  {#if forceLoading}
    <SectionSkeleton loaded={false} />
  {:else if incomingSplits === undefined}
    <SectionSkeleton empty={false} />
  {:else}
    {#await incomingSplits}
      <SectionSkeleton loaded={false} />
    {:then result}
      <SectionSkeleton
        loaded={true}
        empty={flattenIncomingSplits(result).length === 0 && supportStreams.length === 0}
        emptyStateEmoji="🫧"
        {emptyStateHeadline}
        {emptyStateText}
      >
        <div class="lists">
          {#if type === 'dripList' && supportStreams.length > 0}
            <h5>Support streams</h5>
            <!-- TODO: Limit supporters list to some max amount, make expandable -->
            <div class="supporters-list">
              {#each supportStreams as stream}
                <a
                  href="/app/{stream.sender.accountId}/tokens/{stream.streamConfig.amountPerSecond
                    .tokenAddress}/streams/{stream.streamConfig.dripId}"
                  class="item clickable"
                >
                  <IdentityBadge size="medium" address={stream.sender.address} />
                  <div class="amount">
                    <StreamStateBadge
                      streamId={stream.id}
                      {...stream}
                      senderId={stream.sender.accountId}
                      tokenAddress={stream.streamConfig.amountPerSecond.tokenAddress}
                      size="small"
                    />
                    <span
                      ><Amount
                        amountPerSecond={stream.streamConfig.amountPerSecond}
                        amountPerSecClasses="text-foreground-level-5 tabular-nums"
                        showPlusMinus={false}
                      /></span
                    >
                    <ChevronRight />
                  </div>
                </a>
              {/each}
            </div>
          {/if}
          {#if type === 'dripList'}
            <h5>Other supporters</h5>
          {/if}
          {#if flattenIncomingSplits(result).length > 0}
            <div class="supporters-list">
              {#each flattenIncomingSplits(result) as incomingSplit}
                <div class="item">
                  {#if incomingSplit.type === 'user'}
                    <IdentityBadge size="medium" address={incomingSplit.item.value.address} />
                  {:else if incomingSplit.type === 'dripList'}
                    <DripListBadge
                      listId={incomingSplit.item.value.account.accountId}
                      listName={incomingSplit.item.value.name}
                      owner={incomingSplit.item.value.account.owner.address}
                    />
                  {:else if incomingSplit.type === 'project'}
                    <ProjectBadge project={incomingSplit.item.value} />
                  {/if}
                  <span class="muted"
                    >{getSplitPercent(incomingSplit.item.weight)}% of incoming funds
                  </span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="supporters-list">
              <div class="item">
                <span class="muted">No other supporters</span>
              </div>
            </div>
          {/if}
        </div>
      </SectionSkeleton>
    {:catch}
      <SectionSkeleton loaded={true} error={true} />
    {/await}
  {/if}
</section>

<style>
  .lists {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lists h5 {
    color: var(--color-foreground-level-6);
  }

  .lists h5:not(:first-child) {
    margin-top: 1rem;
  }

  .supporters-list {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .supporters-list .item {
    padding: 1rem 1.5rem;
    min-height: 4rem;
    display: flex;
    gap: 3rem;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    transition: background-color 0.3s;
  }

  .supporters-list .item.clickable:hover,
  .supporters-list .item.clickable:focus-visible {
    background-color: var(--color-primary-level-1);
  }

  .supporters-list .item:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .muted {
    color: var(--color-foreground-level-6);
  }

  .amount {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>

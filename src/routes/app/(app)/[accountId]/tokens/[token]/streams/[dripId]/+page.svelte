<script lang="ts" context="module">
  export const STREAM_PAGE_STREAM_FRAGMENT = gql`
    ${DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT}
    ${DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    ${CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT}
    ${DELETE_STREAM_CONFIRM_STEP_STREAM_FRAGMENT}
    ${EDIT_STREAM_FLOW_STREAM}
    ${STREAM_STATE_BADGE_STREAM_FRAGMENT}
    fragment StreamPageStream on Stream {
      ...StreamStateBadgeStream
      ...EditStreamFlowStream
      ...DeleteStreamConfirmStep
      timeline {
        ...CurrentAmountsTimelineItem
        timestamp
        type
        currentAmount {
          amount
        }
      }
      sender {
        account {
          ...DripVisualAddressDriverAccount
          accountId
        }
        balances {
          tokenAddress
          outgoing {
            ...CurrentAmountsUserBalanceTimelineItem
          }
        }
      }
      receiver {
        ... on User {
          account {
            ...DripVisualAddressDriverAccount
          }
        }
        ... on DripList {
          account {
            ...DripVisualNftDriverAccount
          }
        }
      }
      name
      createdAt
      config {
        durationSeconds
        startDate
        amountPerSecond {
          tokenAddress
        }
      }
      isPaused
    }
  `;
</script>

<script lang="ts">
  import DripVisual, {
    DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT,
  } from '$lib/components/drip-visual/drip-visual.svelte';

  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  import type { StreamPageStreamFragment } from './__generated__/gql.generated';
  import type { PageData } from './$types';
  import {
    CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT,
    CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT,
    streamCurrentAmountsStore,
  } from '$lib/utils/current-amounts';
  import FormattedAmount from '$lib/components/formatted-amount/formatted-amount.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import checkIsUser from '$lib/utils/check-is-user';
  import Button from '$lib/components/button/button.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import deleteStreamFlowSteps from '$lib/flows/delete-stream-flow/delete-stream-flow-steps';
  import { DELETE_STREAM_CONFIRM_STEP_STREAM_FRAGMENT } from '$lib/flows/delete-stream-flow/confirm.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Pause from '$lib/components/icons/Pause.svelte';
  import pauseFlowSteps from '$lib/flows/pause-flow/pause-flow-steps';
  import Play from '$lib/components/icons/Play.svelte';
  import unpauseFlowSteps from '$lib/flows/unpause-flow/unpause-flow-steps';
  import editStreamFlowSteps from '$lib/flows/edit-stream-flow/edit-stream-flow-steps';
  import { EDIT_STREAM_FLOW_STREAM } from '$lib/flows/edit-stream-flow/enter-new-details.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import StreamStateBadge, {
    STREAM_STATE_BADGE_STREAM_FRAGMENT,
  } from '$lib/components/stream-state-badge/stream-state-badge.svelte';
  import { fade } from 'svelte/transition';
  import { TimelineItemType } from '$lib/graphql/__generated__/base-types';
  import formatDate from '$lib/utils/format-date';
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { quintOut } from 'svelte/easing';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';

  export let data: PageData;
  const stream: StreamPageStreamFragment = data.stream;

  $: currentStreamAmounts = streamCurrentAmountsStore(
    stream.timeline,
    stream.config.amountPerSecond.tokenAddress,
  );

  $: tokenAddress = stream.config.amountPerSecond.tokenAddress.toLowerCase();
  $: token = $tokensStore && tokensStore.getByAddress(tokenAddress);

  $: endTimelineItem = stream.timeline.find((item) => item.type === TimelineItemType.End);
  $: endDate = endTimelineItem?.timestamp ? new Date(endTimelineItem.timestamp) : undefined;
  $: startDate = new Date(stream.config.startDate ?? stream.createdAt);

  let elapsedDurationPercentage = tweened(0, { duration: 1000, easing: quintOut });

  function updateElapsedDurationPercentage() {
    if (!stream || !stream.config.startDate || !startDate) return;

    const streamStartTimestamp = startDate.getTime();

    const now = new Date().getTime();
    const end = endDate?.getTime() ?? now;

    const newValue = Math.min(
      100,
      ((now - streamStartTimestamp) / (end - streamStartTimestamp)) * 100,
    );

    elapsedDurationPercentage.set(Math.max(0, newValue));
  }
  onMount(() => {
    const interval = setInterval(updateElapsedDurationPercentage, 1000);
    return () => clearInterval(interval);
  });

  $: senderOutgoingBalanceTimeline = stream.sender.balances.find(
    (b) => b.tokenAddress.toLowerCase() === tokenAddress,
  )?.outgoing;
  $: senderOutgoingBalance = senderOutgoingBalanceTimeline
    ? streamCurrentAmountsStore(senderOutgoingBalanceTimeline, tokenAddress)
    : undefined;
</script>

<HeadMeta title={stream.name ?? 'Stream'} />

<div class="wrapper">
  <div class="header">
    <div class="headline">
      <h1>
        {stream.name
          ? stream.name
          : stream.receiver.__typename === 'DripList'
          ? 'Continuous donation'
          : 'Unnamed stream'}
        <div class="state-badge" style:display="inline-block" style:vertical-align="middle">
          <StreamStateBadge {stream} />
        </div>
      </h1>
    </div>
    {#if $walletStore && checkIsUser(stream.sender.account.accountId)}
      <div in:fade|local={{ duration: 300 }} class="actions">
        <Button
          icon={Pen}
          on:click={() => modal.show(Stepper, undefined, editStreamFlowSteps(stream))}>Edit</Button
        >
        {#if stream.isPaused}
          <Button
            icon={Play}
            on:click={() => modal.show(Stepper, undefined, unpauseFlowSteps(stream))}
            >Unpause</Button
          >
        {:else}
          <Button
            icon={Pause}
            on:click={() => modal.show(Stepper, undefined, pauseFlowSteps(stream))}>Pause</Button
          >
        {/if}

        <Button
          icon={Trash}
          on:click={() => modal.show(Stepper, undefined, deleteStreamFlowSteps(stream))}
          >Delete</Button
        >
      </div>
    {/if}
  </div>
  <DripVisual
    from={stream.sender.account}
    to={stream.receiver.account}
    amountPerSecond={$currentStreamAmounts.currentDeltaPerSecond.amount}
    tokenInfo={token ? { symbol: token.info.symbol, decimals: token.info.decimals } : undefined}
    halted={false}
  />
  <div class="details">
    <div class="key-value-group">
      <div class="key-value">
        <div class="keys">
          <h5 class="key">Total Streamed</h5>
        </div>
        <div class="total-streamed">
          <div class="value-box" class:align-right={stream.config.durationSeconds === undefined}>
            <span class="highlight large-text tabular-nums" data-testid="total-streamed">
              {#if token}
                <div in:fade|local={{ duration: 300 }}>
                  <FormattedAmount
                    amount={$currentStreamAmounts.currentAmount.amount}
                    decimals={token.info.decimals}
                  />
                  {#if !endTimelineItem}
                    {token.info.symbol}
                  {/if}
                </div>
              {/if}
            </span>
          </div>
          {#if endTimelineItem}
            <span class="typo-header-5">OF</span>
            <div class="value-box">
              <span class="large-text tabular-nums">
                {#if token}
                  <div in:fade|local={{ duration: 300 }}>
                    <FormattedAmount
                      amount={BigInt(endTimelineItem.currentAmount.amount)}
                      decimals={token.info.decimals}
                      preserveTrailingZeroes={false}
                    />
                    {token?.info.symbol}
                  </div>
                {/if}
              </span>
            </div>
          {/if}
        </div>
      </div>
      {#if startDate && endTimelineItem}
        {@const endTimestamp = new Date(endTimelineItem.timestamp)}
        <div class="key-value">
          <div class="keys">
            <h5 class="key">
              {new Date().getTime() > startDate.getTime() ? 'Progress' : 'Scheduled'}
            </h5>
          </div>
          <div class="rounded-drip-lg shadow-low pt-3 px-4 pb-4 relative overflow-hidden">
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-8 relative z-10"
            >
              <div>
                <div class="typo-header-5">
                  {new Date().getTime() > (startDate.getTime() ?? 0) ? 'Started' : 'Starts'}
                </div>
                <div class="small-text">
                  {formatDate(startDate, 'verbose')}
                </div>
              </div>
              <div>
                <div class="typo-header-5">
                  {new Date().getTime() > (endTimestamp.getTime() ?? 0) ? 'Ended' : 'Ends'}
                </div>
                <div class="small-text">{formatDate(endTimestamp, 'verbose')}</div>
              </div>
            </div>
            <div class="absolute overlay flex flex-col sm:flex-row">
              <div style:flex-basis="{$elapsedDurationPercentage}%" class="bg-primary-level-1" />
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="secondary-details">
      <div class="key-value">
        <h5 class="key greyed-out">Created at</h5>
        <span class="value small-text">{formatDate(new Date(stream.createdAt), 'verbose')}</span>
      </div>
      {#if $senderOutgoingBalance}
        <div class="key-value">
          <div class="with-info-icon">
            <h5 class="key greyed-out">Senderʼs balance</h5>
            <Tooltip>
              <InfoCircle style="height: 1.25rem" />
              <svelte:fragment slot="tooltip-content">
                The stream sender's currently remaining {'TOKEN'} balance. When this cannot cover all
                the sender's streams for this token anymore, all their streams for this token will cease.
              </svelte:fragment>
            </Tooltip>
          </div>

          {#if token}
            <span
              in:fade|local={{ duration: 200, delay: 250 }}
              class="value small-text tabular-nums"
            >
              <FormattedAmount decimals={18} amount={$senderOutgoingBalance.currentAmount.amount} />
              {token?.info.symbol}
            </span>
          {:else}
            <div out:fade|local={{ duration: 200 }} class="loading value small-text tabular-nums" />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- <div class="wrapper">
    <article class="stream-page" in:fly={{ duration: 300, y: 16 }}>
      <header class="hero">
        <div class="flex flex-col-reverse gap-4 md:flex-row items-center">
          <h1>{stream.name}</h1>
          stream state badge
        </div>
        {#if checkIsUser(stream.sender.accountId)}
          <div class="actions">
            {#if stream?.managed}
              {#if !stream.paused}
                <Button
                  icon={PauseIcon}
                  disabled={state !== 'active'}
                  on:click={() =>
                    modal.show(Stepper, undefined, {
                      steps: pauseFlowSteps(stream ?? unreachable()),
                    })}>Pause</Button
                >
              {:else}
                <Button
                  icon={PlayIcon}
                  on:click={() =>
                    modal.show(Stepper, undefined, {
                      steps: unpauseFlowSteps(stream ?? unreachable()),
                    })}>Unpause</Button
                >
              {/if}
            {/if}
            {#if stream}
              <Button
                icon={DeleteIcon}
                on:click={() =>
                  modal.show(Stepper, undefined, deleteStreamFlowSteps(stream ?? unreachable()))}
                >Delete</Button
              >
              <Button
                icon={PenIcon}
                disabled={state === 'ended'}
                on:click={() =>
                  modal.show(Stepper, undefined, editStreamFlowSteps(stream ?? unreachable()))}
                >Edit</Button
              >
            {/if}
          </div>
        {/if}
      </header>
      <DripVisual
        from={{
          address: stream.sender.address,
          driver: Driver.Address,
          __typename: 'AddressDriverAccount',
        }}
        to={stream.receiver.driver === 'nft'
          ? {
              __typename: 'NftDriverAccount',
              driver: Driver.Nft,
              accountId: stream.receiver.accountId,
            }
          : {
              __typename: 'AddressDriverAccount',
              driver: Driver.Address,
              address: stream.receiver.address,
            }}
        amountPerSecond={stream.streamConfig.amountPerSecond.amount}
        tokenInfo={{
          symbol: token?.info.symbol ?? unreachable(),
          decimals: token?.info.decimals ?? unreachable(),
        }}
        halted={estimate?.currentAmountPerSecond === 0n}
      />
      <div class="details">
        <div class="key-value-group">
          <div class="key-value">
            <div class="keys">
              <h5 class="key">Total Streamed</h5>
            </div>
            <div class="total-streamed">
              <div class="value-box" class:align-right={hasDuration}>
                <span class="highlight large-text tabular-nums" data-testid="total-streamed">
                  <FormattedAmount
                    amount={estimate?.totalStreamed ?? unreachable()}
                    decimals={token?.info.decimals ?? unreachable()}
                  />
                  {#if !hasDuration}
                    {token?.info.symbol}
                  {/if}
                </span>
              </div>
              {#if hasDuration}
                <span class="typo-header-5">OF</span>
                <div class="value-box">
                  <span class="large-text tabular-nums">
                    <FormattedAmount
                      amount={targetAmount ?? unreachable()}
                      decimals={token?.info.decimals ?? unreachable()}
                      preserveTrailingZeroes={false}
                    />
                    {token?.info.symbol}
                  </span>
                </div>
              {/if}
            </div>
          </div>
          {#if streamStartDate && streamEndDate}
            <div class="key-value">
              <div class="keys">
                <h5 class="key">
                  {new Date().getTime() > streamStartDate.getTime() ? 'Progress' : 'Scheduled'}
                </h5>
              </div>
              <div class="rounded-drip-lg shadow-low pt-3 px-4 pb-4 relative overflow-hidden">
                <div
                  class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-8 relative z-10"
                >
                  <div>
                    <div class="typo-header-5">
                      {new Date().getTime() > (streamStartDate?.getTime() ?? 0)
                        ? 'Started'
                        : 'Starts'}
                    </div>
                    <div class="small-text">
                      {formatDate(streamStartDate ?? unreachable(), 'verbose')}
                    </div>
                  </div>
                  <div>
                    <div class="typo-header-5">
                      {new Date().getTime() > (streamEndDate?.getTime() ?? 0) ? 'Ended' : 'Ends'}
                    </div>
                    <div class="small-text">{formatDate(streamEndDate, 'verbose')}</div>
                  </div>
                </div>
                <div class="absolute overlay flex flex-col sm:flex-row">
                  <div style:flex-basis="{elapsedDurationPercentage}%" class="bg-primary-level-1" />
                </div>
              </div>
            </div>
          {/if}
          <div class="key-value" class:order-last={streamStartDate && streamEndDate}>
            <h5 class="key greyed-out">
              Stream created at
            </h5>
            <span class="value small-text"
              >{formatDate(streamCreated ?? unreachable(), 'verbose')}</span
            >
          </div>
          <div class="key-value">
            <div class="with-info-icon">
              <h5 class="key greyed-out">Senderʼs balance</h5>
              <Tooltip>
                <InfoCircleIcon style="height: 1.25rem" />
                <svelte:fragment slot="tooltip-content">
                  The stream sender's currently remaining {'TOKEN'} balance. When this cannot
                  cover all the sender's streams for this token anymore, all their streams for this token
                  will cease.
                </svelte:fragment>
              </Tooltip>
            </div>
            <span class="value small-text tabular-nums">
              <FormattedAmount
                decimals={18}
                amount={0n}
              />
              {token?.info.symbol}
            </span>
          </div>
          {#if outOfFundsDate}
            <div class="key-value">
              <div class="with-info-icon">
                <h5 class="key greyed-out">
                  Senderʼs balance {state === 'out-of-funds' ? 'ran' : 'runs'} out of funds
                </h5>
                <Tooltip>
                  <InfoCircleIcon style="height: 1.25rem" />
                  <svelte:fragment slot="tooltip-content">
                    Projection of when the stream ran or will run out of funds based on the sender's
                    remaining {token?.info.symbol} balance. This date changes if the sender adds funds,
                    or adds / removes streams for this token.
                  </svelte:fragment>
                </Tooltip>
              </div>
              <span class="value small-text"
                >{formatDate(outOfFundsDate ?? unreachable(), 'verbose')}</span
              >
            </div>
          {/if}
        </div>
        <StreamDeveloperSection
          amtPerSec={stream.streamConfig.amountPerSecond.amount}
          tokenDecimals={token?.info.decimals}
          tokenAddress={token?.info.address}
        />
      </div>
    </article>
  {/if}
</div> -->
<style>
  .wrapper {
    position: relative;
    max-width: 56rem;
    margin: 0 auto 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header > .headline {
    gap: 1rem;
    align-items: center;
    float: left;
  }

  .secondary-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .loading-state {
    width: 100%;
    position: absolute;
    padding: 30vh 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stream-page {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .with-info-icon {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .key-value-group {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .key-value {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  .key-value > .keys {
    display: flex;
    justify-content: space-between;
  }

  .align-right {
    text-align: right;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .total-streamed {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .value-box {
    flex: 1 1 0px;
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem;
    box-shadow: var(--elevation-low);
    display: flex;
    overflow: hidden;
    min-height: 4rem;
    align-items: center;
    position: relative;
    width: 100%;
  }

  .value-box.align-right {
    justify-content: right;
  }

  .value.loading {
    width: 100%;
    max-width: 12rem;
    height: 1em;
    background-color: var(--color-foreground-level-3);
    animation: pulse 1s infinite;
    border-radius: 0.5rem;
  }

  @keyframes pulse {
    0% {
      background-color: var(--color-foreground-level-3);
    }
    50% {
      background-color: var(--color-foreground-level-2);
    }
    100% {
      background-color: var(--color-foreground-level-3);
    }
  }

  .small-text {
    font-size: clamp(1rem, 3vw, 1.25rem);
  }

  .large-text {
    font-size: clamp(1rem, 5vw, 2rem);
    line-height: 2rem;
  }

  .highlight {
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    .align-right {
      text-align: left;
    }

    .actions {
      display: flex;
    }

    .total-streamed {
      flex-direction: column;
    }

    .key-value {
      gap: 0.25rem;
    }

    .value-box,
    .value-box.align-right {
      justify-content: center;
    }
  }
</style>

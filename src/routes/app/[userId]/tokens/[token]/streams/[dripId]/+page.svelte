<script lang="ts">
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import streams from '$lib/stores/streams';
  import makeStreamId from '$lib/stores/streams/methods/make-stream-id';
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import type { Receiver, Stream } from '$lib/stores/streams/types';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import StreamVisual from '$lib/components/stream-visual/stream-visual.svelte';
  import balances from '$lib/stores/balances';
  import decodeUserId from '$lib/utils/decode-user-id';
  import unreachable from '$lib/utils/unreachable';
  import FormattedAmount from '$lib/components/formatted-amount/formatted-amount.svelte';
  import tokens from '$lib/stores/tokens';
  import formatDate from '$lib/utils/format-date';
  import type { TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
  import StreamStateBadge, {
    type StreamState,
  } from '$lib/components/stream-state-badge/stream-state-badge.svelte';
  import { fly } from 'svelte/transition';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import InfoCircleIcon from 'radicle-design-system/icons/InfoCircle.svelte';
  import Button from '$lib/components/button/button.svelte';
  import PauseIcon from 'radicle-design-system/icons/Pause.svelte';
  import PlayIcon from 'radicle-design-system/icons/Play.svelte';
  import DeleteIcon from 'radicle-design-system/icons/Trash.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import pauseFlowSteps from '$lib/flows/pause-flow/pause-flow-steps';
  import unpauseFlowSteps from '$lib/flows/unpause-flow/unpause-flow-steps';
  import deleteStreamFlowSteps from '$lib/flows/delete-stream-flow/delete-stream-flow-steps';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import editStreamFlowSteps from '$lib/flows/edit-stream-flow/edit-stream-flow-steps';

  const { userId, token: tokenAddress, dripId } = $page.params;

  let dripsUserId: string | undefined;
  let streamId: string | undefined;
  let error: 'invalid-id' | 'not-found' | undefined;
  let loading = true;
  let stream: Stream | undefined;
  let token: TokenInfoWrapper | undefined;

  $: {
    $streams;
    if (streamId) stream = streams.getStreamById(streamId);
  }

  $: estimate = streamId ? $balances && balances.getEstimateByStreamId(streamId) : undefined;
  $: streamScheduledStart = stream?.dripsConfig.startDate;
  $: streamCreated = streamHistory?.[0].timestamp;
  $: streamStartDate = stream
    ? new Date(streamScheduledStart ?? streamCreated ?? unreachable())
    : undefined;
  $: streamEndDate =
    streamStartDate && stream?.dripsConfig.durationSeconds
      ? new Date(streamStartDate.getTime() + stream?.dripsConfig.durationSeconds * 1000)
      : undefined;

  let streamState: StreamState | undefined;
  $: {
    if (estimate && stream) {
      if (stream?.paused) {
        streamState = 'paused';
      } else if (stream && streamEndDate && streamEndDate.getTime() < new Date().getTime()) {
        streamState = 'ended';
      } else if (
        stream?.dripsConfig.startDate &&
        stream.dripsConfig.startDate.getTime() > new Date().getTime()
      ) {
        streamState = 'scheduled';
      } else if (stream && estimate.currentAmountPerSecond === 0n) {
        streamState = 'out-of-funds';
      } else if (stream && estimate.currentAmountPerSecond > 0n) {
        streamState = 'active';
      }
    }
  }

  let streamHistory: ReturnType<typeof getStreamHistory> | undefined;

  function getStreamHistory(dripsUserId: string, tokenAddress: string, streamId: string) {
    const assetConfigHistory = streams.getAssetConfig(dripsUserId, tokenAddress)?.history;
    assert(assetConfigHistory, 'Unable to find asset config history');

    return assetConfigHistory.reduce<
      { timestamp: Date; runsOutOfFunds?: Date; receiverConfig: Receiver }[]
    >((acc, hi) => {
      const matchingReceiver = hi.streams.find((receiver) => receiver.streamId === streamId);

      return matchingReceiver
        ? [
            ...acc,
            {
              timestamp: hi.timestamp,
              runsOutOfFunds: hi.runsOutOfFunds,
              receiverConfig: matchingReceiver,
            },
          ]
        : acc;
    }, []);
  }

  /**
   * The date at which the particular token ran out of funds, even if its associated asset
   * config was changed later.
   */
  let outOfFundsDate: Date | undefined;
  $: {
    if (streamHistory) {
      const latestStreamHistoryItem = streamHistory[streamHistory.length - 1];

      if (
        latestStreamHistoryItem.runsOutOfFunds?.getTime() ===
          latestStreamHistoryItem.timestamp.getTime() &&
        streamState === 'out-of-funds'
      ) {
        const reverseHistory = streamHistory;
        reverseHistory.reverse();

        // Find the latest history item which wasn't already out-of-funds when it was created.
        outOfFundsDate = reverseHistory.find(
          (hi) => hi.runsOutOfFunds && hi.runsOutOfFunds.getTime() !== hi.timestamp.getTime(),
        )?.runsOutOfFunds;
      } else {
        outOfFundsDate = latestStreamHistoryItem.runsOutOfFunds;
      }
    }
  }

  onMount(async () => {
    try {
      token = tokens.getByAddress(tokenAddress) ?? unreachable();
      dripsUserId = (await decodeUserId(userId)).dripsUserId;
      streamId = makeStreamId(dripsUserId, tokenAddress, dripId);
    } catch {
      error = 'invalid-id';
      return;
    }

    try {
      stream = streams.getStreamById(streamId);
      if (stream) {
        streamHistory = getStreamHistory(dripsUserId, tokenAddress, streamId);
      }

      stream?.dripsConfig.durationSeconds;

      await streams.fetchAccount(dripsUserId);
      stream = streams.getStreamById(streamId);
      assert(stream);
    } catch {
      error = 'not-found';
    }
  });

  $: loading = !(stream && estimate);

  $: {
    if (stream && streamId && dripsUserId) {
      streamHistory = getStreamHistory(dripsUserId, tokenAddress, streamId);
    }
  }
</script>

<svelte:head>
  <title>{stream?.name ?? 'Stream'} | Drips</title>
  <meta name="description" value="Radicle Drips Dashboard" />
</svelte:head>

<div class="wrapper">
  {#if error === 'invalid-id'}
    <LargeEmptyState
      emoji="💀"
      headline="Invalid stream ID"
      description="Please make sure you're supplying a valid stream ID in the URL."
    />
  {:else if error === 'not-found'}
    <LargeEmptyState
      emoji="🧐"
      headline="Stream not found"
      description="We weren't able to find a stream with this ID."
    />
  {:else if loading}
    <div class="loading-state" out:fly={{ duration: 300, y: -16 }}>
      <Spinner />
    </div>
  {:else if stream}
    <div class="stream-page" in:fly={{ duration: 300, y: 16 }}>
      <div class="hero">
        <div class="title-and-state">
          <h1>{stream.name ?? 'Unnamed stream'}</h1>
          <StreamStateBadge state={streamState ?? unreachable()} />
        </div>
        {#if checkIsUser(stream.sender.userId) && stream.managed}
          <div class="actions">
            {#if stream && !stream.paused}<Button
                icon={PauseIcon}
                disabled={streamState !== 'active'}
                on:click={() =>
                  modal.show(Stepper, undefined, {
                    steps: pauseFlowSteps(stream ?? unreachable()),
                  })}>Pause</Button
              >{/if}
            {#if stream && stream.paused}<Button
                icon={PlayIcon}
                on:click={() =>
                  modal.show(Stepper, undefined, {
                    steps: unpauseFlowSteps(stream ?? unreachable()),
                  })}>Unpause</Button
              >{/if}
            {#if stream}<Button
                icon={DeleteIcon}
                on:click={() =>
                  modal.show(Stepper, undefined, deleteStreamFlowSteps(stream ?? unreachable()))}
                >Delete</Button
              >{/if}
            {#if stream}<Button
                icon={PenIcon}
                disabled={streamState === 'ended' || !stream.managed}
                on:click={() =>
                  modal.show(Stepper, undefined, editStreamFlowSteps(stream ?? unreachable()))}
                >Edit</Button
              >{/if}
          </div>
        {/if}
      </div>
      <StreamVisual
        fromAddress={stream.sender.address}
        toAddress={stream.receiver.address}
        amountPerSecond={stream.dripsConfig.amountPerSecond.amount}
        tokenInfo={{
          symbol: token?.info.symbol ?? unreachable(),
          decimals: token?.info.decimals ?? unreachable(),
        }}
        halted={estimate?.currentAmountPerSecond === 0n}
      />
      <div class="details">
        <div class="key-value">
          <h5 class="key">Total Streamed</h5>
          <span class="value typo-text-mono-bold highlight" data-testid="total-streamed">
            <FormattedAmount
              amount={estimate?.totalStreamed ?? unreachable()}
              decimals={token?.info.decimals ?? unreachable()}
            />
            {token?.info.symbol}
          </span>
        </div>
        <div class="key-value-row">
          <div class="key-value">
            <h5 class="key">Scheduled start</h5>
            <span class="value">{formatDate(streamStartDate ?? unreachable(), 'verbose')}</span>
          </div>
          <div class="key-value align-right">
            <h5 class="key">Scheduled end</h5>
            {#if streamEndDate}<span class="value">{formatDate(streamEndDate, 'verbose')}</span
              >{:else}
              <span class="value greyed-out">∞</span>{/if}
          </div>
        </div>
        <div class="key-value-row">
          <div class="key-value">
            <div class="with-info-icon">
              <h5 class="key">Remaining balance for token</h5>
              <Tooltip
                text={`The stream sender's currently remaining ${token?.info.symbol} balance. When this cannot cover all the sender's streams for this token anymore, all their streams for this token will cease.`}
              >
                <InfoCircleIcon style="height: 1.25rem" />
              </Tooltip>
            </div>
            <span class="value typo-text-mono-bold">
              <FormattedAmount
                decimals={token?.info.decimals ?? unreachable()}
                amount={$balances.accounts[dripsUserId ?? unreachable()][tokenAddress].totals
                  .remainingBalance}
              />
              {token?.info.symbol}
            </span>
          </div>
          <div class="key-value align-right">
            <div class="with-info-icon">
              <h5 class="key">
                Token {streamState === 'out-of-funds' ? 'ran' : 'runs'} out of funds
              </h5>
              <Tooltip
                text={`Projection of when the stream ran or will run out of funds based on the sender's remaining ${token?.info.symbol} balance. This date changes if the sender adds funds, or adds / removes streams for this token.`}
              >
                <InfoCircleIcon style="height: 1.25rem" />
              </Tooltip>
            </div>
            {#if outOfFundsDate}
              <span class="value">{formatDate(outOfFundsDate ?? unreachable(), 'verbose')}</span>
            {:else}
              <span class="value greyed-out">∞</span>
            {/if}
          </div>
        </div>
        <div class="key-value-row">
          <div class="key-value">
            <h5 class="key">Created at</h5>
            <span class="value">{formatDate(streamCreated ?? unreachable())}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
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

  .title-and-state {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .with-info-icon {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .align-right .with-info-icon {
    justify-content: flex-end;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .key-value-row {
    display: flex;
    justify-content: space-between;
  }

  .key-value {
    display: flex;
    flex-direction: column;
  }

  .key-value > .value {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .key-value > .value.highlight {
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    font-size: 2.25rem;
    color: var(--color-primary);
  }

  .key-value > .value.greyed-out {
    color: var(--color-foreground-level-4);
  }

  .align-right {
    text-align: right;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    .hero {
      align-items: center;
    }

    .title-and-state {
      flex-direction: column;
      align-items: left;
    }

    .key-value-row {
      flex-direction: column;
      gap: 1rem;
    }

    .align-right {
      text-align: left;
    }

    .align-right .with-info-icon {
      justify-content: flex-start;
    }

    .actions {
      display: flex;
      justify-content: space-around;
    }
  }
</style>

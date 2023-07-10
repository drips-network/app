<script lang="ts">
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import streams from '$lib/stores/streams';
  import makeStreamId from '$lib/stores/streams/methods/make-stream-id';
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import type { Stream } from '$lib/stores/streams/types';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import StreamVisual from '$lib/components/stream-visual/stream-visual.svelte';
  import balances from '$lib/stores/balances';
  import decodeAccountId from '$lib/utils/decode-user-id';
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
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import getStreamHistory from '$lib/utils/stream-history';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { browser } from '$app/environment';
  import walletStore from '$lib/stores/wallet/wallet.store';

  const walletInitialized = walletStore.initialized;

  const { accountId, token: tokenAddress, dripId } = $page.params;

  let dripsAccountId: string | undefined;
  let streamId: string | undefined;
  let error: 'invalid-id' | 'not-found' | 'unknown-token' | undefined;
  let loading = true;
  let stream: Stream | undefined;
  let token: TokenInfoWrapper | undefined;

  $: {
    $streams;
    if (streamId && dripsAccountId) {
      stream = streams.getStreamById(streamId);
    }
  }

  $: {
    if (stream && dripsAccountId && streamId) {
      streamHistory = getStreamHistory(
        streams.getAssetConfig(dripsAccountId, tokenAddress) ?? unreachable(),
        streamId,
      );
    }
  }

  let streamName: string | undefined;
  $: {
    if (stream) {
      streamName =
        stream.receiver.driver === 'nft'
          ? 'Drip List Support Stream'
          : stream.name ?? 'Unnamed stream';
    }
  }

  $: estimate = streamId ? $balances && balances.getEstimateByStreamId(streamId) : undefined;
  $: streamScheduledStart = stream?.streamConfig.startDate;
  $: streamCreated = streamHistory?.[0].timestamp;
  $: streamStartDate =
    stream && streamHistory
      ? new Date(streamScheduledStart ?? streamCreated ?? unreachable())
      : undefined;
  $: streamEndDate =
    streamStartDate && stream?.streamConfig.durationSeconds
      ? new Date(streamStartDate.getTime() + stream?.streamConfig.durationSeconds * 1000)
      : undefined;

  let streamState: StreamState | undefined;
  $: {
    if (estimate && stream) {
      if (stream?.paused) {
        streamState = 'paused';
      } else if (stream && streamEndDate && streamEndDate.getTime() < new Date().getTime()) {
        streamState = 'ended';
      } else if (
        stream?.streamConfig.startDate &&
        stream.streamConfig.startDate.getTime() > new Date().getTime()
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

  async function getStreamInfo() {
    if (!browser || !$walletInitialized) return;

    token = tokens.getByAddress(tokenAddress);

    if (!token) {
      error = 'unknown-token';
      return;
    }

    try {
      token = tokens.getByAddress(tokenAddress) ?? unreachable();
      dripsAccountId = (await decodeAccountId(accountId)).dripsAccountId;
      streamId = makeStreamId(dripsAccountId, tokenAddress, dripId);
    } catch {
      error = 'invalid-id';
      return;
    }

    try {
      stream = streams.getStreamById(streamId);
      if (stream) {
        streamHistory = getStreamHistory(
          streams.getAssetConfig(accountId, tokenAddress) ?? unreachable(),
          streamId,
        );
      }

      await streams.fetchAccount(dripsAccountId);
      stream = streams.getStreamById(streamId);
      assert(stream);
    } catch {
      error = 'not-found';
      return;
    }

    error = undefined;
  }

  onMount(getStreamInfo);

  $: {
    $tokens;
    getStreamInfo();
  }

  $: loading = !(stream && estimate);
</script>

<HeadMeta title={stream?.name ?? 'Stream'} />

<div class="wrapper">
  {#if error === 'invalid-id'}
    <LargeEmptyState
      emoji="💀"
      headline="Invalid stream ID"
      description="Please make sure you're supplying a valid stream ID in the URL."
    />
  {:else if error === 'unknown-token'}
    <LargeEmptyState
      emoji="💀"
      headline="Unknown token"
      description="This stream is streaming an ERC-20 token which is not supported by default. You can manually add it to your custom tokens list."
      button={{
        handler: () => modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress)),
        label: 'Add custom token',
      }}
    />
  {:else if error === 'not-found'}
    <LargeEmptyState
      emoji="🧐"
      headline="Stream not found"
      description="We weren't able to find a stream with this ID."
    />
  {:else if loading || !walletInitialized}
    <div class="loading-state" out:fly={{ duration: 300, y: -16 }}>
      <Spinner />
    </div>
  {:else if streamId && stream}
    <div class="stream-page" in:fly={{ duration: 300, y: 16 }}>
      <div class="hero">
        <div class="title-and-state">
          <h1>{streamName}</h1>
          <StreamStateBadge
            {streamId}
            paused={stream.paused}
            senderId={stream.sender.accountId}
            durationSeconds={stream.streamConfig.durationSeconds}
            startDate={stream.streamConfig.startDate}
            {tokenAddress}
          />
        </div>
        {#if checkIsUser(stream.sender.accountId) && stream.managed}
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
        from={stream.sender}
        to={stream.receiver}
        amountPerSecond={stream.streamConfig.amountPerSecond.amount}
        tokenInfo={{
          symbol: token?.info.symbol ?? unreachable(),
          decimals: token?.info.decimals ?? unreachable(),
        }}
        halted={estimate?.currentAmountPerSecond === 0n}
      />
      <div class="details">
        <div class="key-value">
          <h5 class="key">Total Streamed</h5>
          <span class="value typo-text tabular-nums highlight" data-testid="total-streamed">
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
            <span class="value typo-text"
              >{formatDate(streamStartDate ?? unreachable(), 'verbose')}</span
            >
          </div>
          <div class="key-value align-right">
            <h5 class="key">Scheduled end</h5>
            {#if streamEndDate}<span class="value typo-text"
                >{formatDate(streamEndDate, 'verbose')}</span
              >{:else}
              <span class="value typo-text greyed-out">∞</span>{/if}
          </div>
        </div>
        <div class="key-value-row">
          <div class="key-value">
            <div class="with-info-icon">
              <h5 class="key">Remaining balance for token</h5>
              <Tooltip>
                <InfoCircleIcon style="height: 1.25rem" />
                <svelte:fragment slot="tooltip-content">
                  The stream sender's currently remaining {token?.info.symbol} balance. When this cannot
                  cover all the sender's streams for this token anymore, all their streams for this token
                  will cease.
                </svelte:fragment>
              </Tooltip>
            </div>
            <span class="value typo-text tabular-nums">
              <FormattedAmount
                decimals={token?.info.decimals ?? unreachable()}
                amount={$balances.accounts[dripsAccountId ?? unreachable()].tokens[
                  tokenAddress.toLowerCase()
                ].total.totals.remainingBalance}
              />
              {token?.info.symbol}
            </span>
          </div>
          <div class="key-value align-right">
            <div class="with-info-icon">
              <h5 class="key">
                Token {streamState === 'out-of-funds' ? 'ran' : 'runs'} out of funds
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
            {#if outOfFundsDate}
              <span class="value typo-text"
                >{formatDate(outOfFundsDate ?? unreachable(), 'verbose')}</span
              >
            {:else}
              <span class="value typo-text greyed-out">∞</span>
            {/if}
          </div>
        </div>
        <div class="key-value-row">
          <div class="key-value">
            <h5 class="key">Created at</h5>
            <span class="value typo-text"
              >{formatDate(streamCreated ?? unreachable(), 'verbose')}</span
            >
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
    gap: 1.5rem;
  }

  .key-value-row {
    display: flex;
    justify-content: space-between;
  }

  .key-value {
    display: flex;
    gap: 0.5rem;
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
      gap: 1.5rem;
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

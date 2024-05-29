<script lang="ts" context="module">
  export const STREAM_PAGE_STREAM_FRAGMENT = gql`
    ${DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT}
    ${DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    fragment StreamPageStream on Stream {
      timeline {
        ...CurrentAmountsTimelineItem
      }
      sender {
        account {
          ...DripVisualAddressDriverAccount
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
      config {
        durationSeconds
        startDate
        amountPerSecond {
          tokenAddress
        }
      }
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
    streamCurrentAmountsStore,
  } from '$lib/flows/create-stream-flow/methods/current-amounts';
  import FormattedAmount from '$lib/components/formatted-amount/formatted-amount.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';

  export let data: PageData;
  const stream: StreamPageStreamFragment = data.stream;

  const currentStreamAmounts = streamCurrentAmountsStore(stream.timeline);

  $: token = $tokensStore && tokensStore.getByAddress(stream.config.amountPerSecond.tokenAddress);
</script>

<HeadMeta title={stream.name ?? 'Stream'} />

<div class="wrapper">
  <div class="headline">
    <h1>{stream.name ?? 'Unnamed stream'}</h1>
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
              <FormattedAmount
                amount={$currentStreamAmounts.currentAmount.amount}
                decimals={token.info.decimals}
              />
                {#if stream.config.durationSeconds !== undefined}
                  {token?.info.symbol}
                {/if}
              {/if}
            </span>
          </div>
          <!-- {#if hasDuration}
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
          {/if} -->
        </div>
      </div>
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
              {#if streamStartDate && streamEndDate}
                Stream created
              {:else}
                {new Date().getTime() > ((streamStartDate || streamCreated)?.getTime() ?? 0)
                  ? 'Started'
                  : 'Starts'}
              {/if}
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
    .hero {
      align-items: center;
    }

    .align-right {
      text-align: left;
    }

    .actions {
      display: flex;
      justify-content: space-around;
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

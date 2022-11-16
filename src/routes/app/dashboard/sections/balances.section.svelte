<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import CollectIcon from 'radicle-design-system/icons/ArrowUp.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import balances from '$lib/stores/balances/balances.store';
  import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import streams from '$lib/stores/streams';
  import { get } from 'svelte/store';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { makeStep } from '$lib/components/stepper/types';
  import topUpFlowState from './top-up-flow/top-up-flow-state';
  import SelectCollectTokenStep from './collect-flow/select-token.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import { ethers } from 'ethers';
  import tokens from '$lib/stores/tokens';
  import assert from '$lib/utils/assert';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { onMount } from 'svelte';
  import CollectAmountsStep from './collect-flow/collect-amounts.svelte';
  import collectFlowState from './collect-flow/collect-flow-state';
  import FetchDripsCycleStep from './collect-flow/fetch-drips-cycle.svelte';
  import CollectSuccess from './collect-flow/success.svelte';
  import ManageTokenBalance from './manage-token-balance-flow/manage-token-balance.svelte';
  import manageTokenBalanceFlowState from './manage-token-balance-flow/manage-token-balance-flow-state';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';

  interface TokenTableRow {
    token: TokenCellData;
    earnings: AmountCellData;
    streaming: AmountCellData;
    netRate: AmountCellData;
  }

  let currentUserId: string;
  $: accountEstimate = currentUserId ? $balances.accounts[currentUserId] : undefined;

  onMount(async () => {
    currentUserId = (await (await getAddressDriverClient()).getUserId()).toString();
  });

  let tableData: TokenTableRow[] = [];

  function getIncomingTotalsForToken(address: string): {
    totalEarned: bigint;
    amountPerSecond: bigint;
  } {
    const streamsState = get(streams);

    if (!streamsState.ownStreams) return { totalEarned: 0n, amountPerSecond: 0n };

    const incomingStreamsForToken = streamsState.ownStreams.incoming.filter(
      (stream) => stream.dripsConfig.amountPerSecond.tokenAddress === address,
    );

    return incomingStreamsForToken.reduce<{ totalEarned: bigint; amountPerSecond: bigint }>(
      (acc, stream) => {
        const estimate = balances.getEstimateByStreamId(stream.id);

        if (!estimate) throw new Error(`Unknown estimate for stream ${stream.id}`);

        return {
          totalEarned: acc.totalEarned + estimate.totalStreamed,
          amountPerSecond: acc.amountPerSecond + estimate.currentAmountPerSecond,
        };
      },
      { totalEarned: 0n, amountPerSecond: 0n },
    );
  }

  function updateTable() {
    if (!$balances || !accountEstimate) {
      tableData = [];
      return;
    }

    let tokensToShow: string[] = [];

    tokensToShow.push(...Object.keys(accountEstimate));
    tokensToShow.push(
      ...($streams.ownStreams?.incoming.map(
        (stream) => stream.dripsConfig.amountPerSecond.tokenAddress,
      ) ?? []),
    );
    tokensToShow = [...new Set(tokensToShow)];

    tableData = tokensToShow.map((tokenAddress) => {
      const outgoingEstimate = accountEstimate?.[tokenAddress];
      const incomingTotals = getIncomingTotalsForToken(tokenAddress);

      return {
        token: {
          address: tokenAddress,
        },
        earnings: {
          amount: {
            amount: incomingTotals.totalEarned,
            tokenAddress,
          },
          amountPerSecond: {
            amount: incomingTotals.amountPerSecond,
            tokenAddress,
          },
          showSymbol: false,
        },
        streaming: {
          amount: {
            tokenAddress,
            amount: outgoingEstimate?.totals.remainingBalance ?? 0n,
          },
          amountPerSecond: {
            tokenAddress,
            amount: -(outgoingEstimate?.totals.totalAmountPerSecond ?? 0n),
          },
          showSymbol: false,
        },
        netRate: {
          amountPerSecond: {
            amount:
              incomingTotals.amountPerSecond -
              (outgoingEstimate?.totals.totalAmountPerSecond ?? 0n),
            tokenAddress,
          },
          showSymbol: false,
        },
      };
    });
  }

  $: {
    $balances;
    updateTable();
  }

  const tableColumns: ColumnDef<TokenTableRow>[] = [
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'earnings',
      header: 'Earnings',
      cell: () => Amount,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'streaming',
      header: 'Streaming',
      cell: () => Amount,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'netRate',
      header: 'Net rate',
      cell: () => Amount,
      enableSorting: false,
      size: (100 / 24) * 2,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: TableOptions<any>;
  $: options = {
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  function getTopUpSuccessMessage() {
    const { tokenAddress, amountToTopUp } = $topUpFlowState;
    assert(tokenAddress && amountToTopUp, 'Missing context to construct getTopUpSuccessMessage');

    const tokenInfo = tokens.getByAddress(tokenAddress)?.info;

    const formattedAmount =
      tokenInfo && ethers.utils.formatUnits(amountToTopUp, tokenInfo.decimals);

    return `
      You've successfully topped up ${formattedAmount} ${tokenInfo?.name}.
      It may take some time for your balance to update on your dashboard.
    `;
  }
</script>

<div class="section">
  <SectionHeader
    icon={TokensIcon}
    label="Balances"
    actionsDisabled={!accountEstimate}
    actions={[
      {
        label: 'Collect earnings',
        icon: CollectIcon,
        handler: () => {
          modal.show(Stepper, undefined, {
            initialContext: collectFlowState,
            initialSteps: [
              makeStep({
                component: SelectCollectTokenStep,
                props: undefined,
              }),
              makeStep({
                component: FetchDripsCycleStep,
                props: undefined,
              }),
              makeStep({
                component: CollectAmountsStep,
                props: undefined,
              }),
              makeStep({
                component: CollectSuccess,
                props: undefined,
              }),
            ],
          });
        },
      },
      {
        label: 'Manage token balances',
        icon: WalletIcon,
        handler: () => {
          modal.show(Stepper, undefined, {
            initialContext: manageTokenBalanceFlowState,
            initialSteps: [
              makeStep({
                component: ManageTokenBalance,
                props: {
                  userId: currentUserId,
                },
              }),
              makeStep({
                component: SuccessStep,
                props: {
                  message: () => getTopUpSuccessMessage(),
                },
              }),
            ],
          });
        },
      },
    ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateHeadline="No tokens"
      emptyStateEmoji="🫗"
      emptyStateText="This is where any tokens balances you stream or earned show up."
      loaded={Boolean(accountEstimate)}
      empty={tableData.length === 0}
    >
      <Table {options} />
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .content {
    margin: 0 -1rem 0 -1rem;
    overflow-y: scroll;
  }

  @media (max-width: 1024px) {
    .content {
      padding: 0 1rem 0 1rem;
    }
  }
</style>

<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import TopUpIcon from 'radicle-design-system/icons/Topup.svelte';
  import CollectIcon from 'radicle-design-system/icons/ArrowUp.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import balances from '$lib/stores/balances/balances.store';
  import Amount, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import streams from '$lib/stores/streams';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { makeStep } from '$lib/components/stepper/types';
  import SelectTokenStep from './top-up-flow/select-token.svelte';
  import topUpFlowState from './top-up-flow/top-up-flow-state';
  import EnterAmountStep from './top-up-flow/enter-amount.svelte';
  import ApproveStep from './top-up-flow/approve.svelte';
  import SelectCollectTokenStep from './collect-flow/select-token.svelte';
  import TriggerTopUpTransaction from './top-up-flow/trigger-top-up-transaction.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import { ethers } from 'ethers';
  import tokens from '$lib/stores/tokens';
  import assert from '$lib/utils/assert';
  import CollectAmountsStep from './collect-flow/collect-amounts.svelte';
  import collectFlowState from './collect-flow/collect-flow-state';
  import FetchDripsCycleStep from './collect-flow/fetch-drips-cycle.svelte';
  import Success from './collect-flow/success.svelte';
  import wallet from '$lib/stores/wallet';
  import { goto } from '$app/navigation';

  interface TokenTableRow {
    token: TokenCellData;
    earnings: AmountCellData;
    streaming: AmountCellData;
    netRate: AmountCellData;
  }

  export let userId: string | undefined;
  export let disableActions = true;

  $: accountEstimate = userId ? $balances.accounts[userId] : undefined;

  let tableData: TokenTableRow[] = [];

  function updateTable() {
    if (!$balances || !accountEstimate || !userId) {
      tableData = [];
      return;
    }

    const ownStreams = streams.getStreamsForUser(userId);

    let tokensToShow: string[] = [];

    tokensToShow.push(...Object.keys(accountEstimate));
    tokensToShow.push(
      ...(ownStreams.incoming.map((stream) => stream.dripsConfig.amountPerSecond.tokenAddress) ??
        []),
    );
    tokensToShow = [...new Set(tokensToShow)];

    tableData = tokensToShow.map((tokenAddress) => {
      assert(userId);

      const estimate = accountEstimate?.[tokenAddress];
      const incomingTotals = streams.getIncomingTokenAmountsByUser(userId, tokenAddress);

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
            amount: estimate?.totals.remainingBalance ?? 0n,
          },
          amountPerSecond: {
            tokenAddress,
            amount: -(estimate?.totals.totalAmountPerSecond ?? 0n),
          },
          showSymbol: false,
        },
        netRate: {
          amountPerSecond: {
            amount: incomingTotals.amountPerSecond - (estimate?.totals.totalAmountPerSecond ?? 0n),
            tokenAddress,
          },
          showSymbol: false,
        },
      };
    });
  }

  $: {
    $balances;
    if (userId) updateTable();
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

  const { fetchStatuses } = streams;
  $: loaded = Boolean(userId && ['error', 'fetched'].includes($fetchStatuses[userId]));
  $: error = Boolean(userId && $fetchStatuses[userId] === 'error');

  function onRowClick(event: CustomEvent) {
    // go to token page by address
    const tokenAddress = tableData[event.detail].token.address;
    goto(`/app/tokens/${$wallet.network.name}/${tokenAddress}`);
  }
</script>

<div class="section">
  <SectionHeader
    icon={TokensIcon}
    label="Balances"
    actionsDisabled={!accountEstimate}
    actions={disableActions
      ? []
      : [
          {
            handler: () => {
              modal.show(Stepper, undefined, {
                context: topUpFlowState,
                steps: [
                  makeStep({
                    component: SelectTokenStep,
                    props: undefined,
                  }),
                  makeStep({
                    component: EnterAmountStep,
                    props: undefined,
                  }),
                  makeStep({
                    component: ApproveStep,
                    props: undefined,
                  }),
                  makeStep({
                    component: TriggerTopUpTransaction,
                    props: undefined,
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
            icon: TopUpIcon,
            label: 'Top up',
          },
          {
            handler: () => {
              modal.show(Stepper, undefined, {
                context: collectFlowState,
                steps: [
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
                    component: Success,
                    props: undefined,
                  }),
                ],
              });
            },
            icon: CollectIcon,
            label: 'Collect',
          },
        ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateHeadline="No tokens"
      emptyStateEmoji="🫗"
      emptyStateText="This is where any tokens balances you stream or earned show up."
      {loaded}
      {error}
      empty={tableData.length === 0}
    >
      <Table {options} isRowClickable={true} on:rowclick={onRowClick} />
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

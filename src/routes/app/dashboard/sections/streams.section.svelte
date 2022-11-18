<script lang="ts">
  import TokenStreamIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import AmountCell, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import LinkCell, { type LinkCellData } from '$lib/components/table/cells/link.cell.svelte';
  import streams from '$lib/stores/streams/streams.store';
  import IdentityBadgeCell from '$lib/components/table/cells/identity-badge.cell.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { makeStep } from '$lib/components/stepper/types';
  import InputDetails from './create-stream-flow/input-details.svelte';
  import balances from '$lib/stores/balances';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { onMount } from 'svelte';

  export let userId: string | undefined;
  export let disableActions = true;

  interface OutgoingStreamTableRow {
    name: LinkCellData;
    toAddress: string;
    amount: AmountCellData;
    token: TokenCellData;
  }

  interface IncomingStreamTableRow {
    name: LinkCellData;
    fromAddress: string;
    amount: AmountCellData;
    token: TokenCellData;
  }

  let outgoingTableData: OutgoingStreamTableRow[] = [];
  let incomingTableData: IncomingStreamTableRow[] = [];

  let ownStreams: ReturnType<typeof streams.getStreamsForUser> = { outgoing: [], incoming: [] };

  function updateTable() {
    ownStreams = userId ? streams.getStreamsForUser(userId) : { outgoing: [], incoming: [] };

    outgoingTableData = mapFilterUndefined(ownStreams.outgoing, (stream) => {
      const estimate = balances.getEstimateByStreamId(stream.id);
      if (!estimate) return undefined;

      const { tokenAddress } = stream.dripsConfig.amountPerSecond;

      return {
        name: {
          label: stream.name ?? 'Unnamed stream',
          href: `/app/${userId}/tokens/${tokenAddress}/streams/${stream.dripsConfig.dripId}`,
        },
        toAddress: stream.receiver.address,
        amount: {
          amount: {
            amount: estimate.totalStreamed,
            tokenAddress,
          },
          amountPerSecond: {
            amount: estimate.currentAmountPerSecond,
            tokenAddress,
          },
          showSymbol: false,
        },
        token: {
          address: tokenAddress,
          size: 'small',
          show: 'symbol',
        },
      };
    });

    incomingTableData = mapFilterUndefined(ownStreams.incoming ?? [], (stream) => {
      const estimate = balances.getEstimateByStreamId(stream.id);
      if (!estimate) return undefined;

      const { tokenAddress } = stream.dripsConfig.amountPerSecond;

      return {
        name: {
          label: stream.name ?? 'Unnamed stream',
          href: `/app/${stream.sender.userId}/tokens/${tokenAddress}/streams/${stream.dripsConfig.dripId}`,
        },
        fromAddress: stream.sender.address,
        amount: {
          amountPerSecond: {
            amount: estimate.currentAmountPerSecond,
            tokenAddress,
          },
          amount: {
            amount: estimate.totalStreamed,
            tokenAddress,
          },
          showSymbol: false,
        },
        token: {
          address: tokenAddress,
          size: 'small',
          show: 'symbol',
        },
      };
    });
  }

  const { fetchStatuses } = streams;

  $: {
    userId;
    $balances;
    updateTable();
  }

  onMount(updateTable);

  const outgoingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: () => LinkCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'toAddress',
      header: 'To',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'amount',
      header: 'Total streamed',
      cell: () => AmountCell,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
      size: (100 / 24) * 3,
    },
  ];

  const incomingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: () => LinkCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'fromAddress',
      header: 'From',
      cell: () => IdentityBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'amount',
      header: 'Amount earned',
      cell: () => AmountCell,
      enableSorting: false,
      size: (100 / 24) * 6,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
      size: (100 / 24) * 3,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let optionsOutgoing: TableOptions<any>;
  $: optionsOutgoing = {
    data: outgoingTableData,
    columns: outgoingTableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let optionsIncoming: TableOptions<any>;
  $: optionsIncoming = {
    data: incomingTableData,
    columns: incomingTableColumns,
    getCoreRowModel: getCoreRowModel(),
  };

  $: loaded = Boolean(userId && ['error', 'fetched'].includes($fetchStatuses[userId]));
  $: error = Boolean(userId && $fetchStatuses[userId] === 'error');
  $: empty = ownStreams.incoming.length === 0 && ownStreams.outgoing.length === 0;
</script>

<div class="section">
  <SectionHeader
    icon={TokenStreamIcon}
    label="Streams"
    actionsDisabled={!loaded}
    actions={disableActions
      ? []
      : [
          {
            handler: () => {
              modal.show(Stepper, undefined, {
                steps: [
                  makeStep({
                    component: InputDetails,
                    props: undefined,
                  }),
                  makeStep({
                    component: SuccessStep,
                    props: {
                      message:
                        'Your stream has been successfully created. ' +
                        'Please note that it may take a while for your dashboard to update.',
                    },
                  }),
                ],
              });
            },
            icon: PlusIcon,
            label: 'Create stream',
          },
        ]}
  />
  <div class="content">
    <SectionSkeleton
      emptyStateEmoji="🫙"
      emptyStateHeadline="No streams"
      emptyStateText="This is where incoming and outgoing streams for your account will appear."
      {loaded}
      {error}
      {empty}
    >
      {#if optionsOutgoing.data.length > 0}
        <div class="table-container">
          <h4 class="table-group-header">↑ Outgoing</h4>
          <Table options={optionsOutgoing} />
        </div>
      {/if}
      {#if optionsIncoming.data.length > 0}
        <div class="table-container">
          <h4 class="table-group-header">↓ Incoming</h4>
          <Table options={optionsIncoming} />
        </div>
      {/if}
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

  .table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .table-container:first-child:not(:last-child) {
    margin-bottom: 2rem;
  }

  .table-group-header {
    color: var(--color-foreground-level-6);
    margin-left: calc(0.75rem + 2px);
  }

  @media (max-width: 1024px) {
    .content {
      padding: 0 1rem 0 1rem;
    }

    .table-group-header {
      margin-left: none;
    }
  }
</style>

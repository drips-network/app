<script lang="ts">
  import TokenStreamIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import AmountCell, { type AmountCellData } from '$lib/components/table/cells/amount.cell.svelte';
  import streams from '$lib/stores/streams/streams.store';
  import UserBadgeCell from '$lib/components/table/cells/user-badge.cell.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import balances from '$lib/stores/balances';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import TokenCell, { type TokenCellData } from '$lib/components/table/cells/token.cell.svelte';
  import { onMount } from 'svelte';
  import type { AddressDriverAccount, NFTDriverAccount, Stream } from '$lib/stores/streams/types';
  import NameAndBadgeCell, {
    type NameAndBadgeCellProps,
  } from '$lib/components/table/cells/name-and-badge-cell.svelte';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
  import onClickGoto from '$lib/utils/on-click-goto';
  import accountFetchStatussesStore from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';
  import createStreamFlowSteps from '$lib/flows/create-stream-flow/create-stream-flow-steps';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Section from '$lib/components/section/section.svelte';

  export let accountId: string | undefined;
  export let disableActions = true;
  export let tokenAddress: string | undefined = undefined;
  export let onlyDripListStreams = false;

  export let infoTooltip: string | undefined = undefined;

  export let collapsed = false;
  export let collapsable = false;

  export let emptyStateHeadline = 'No streams';

  $: isSelf = accountId === $walletStore.dripsAccountId;

  export let emptyStateText = isSelf
    ? 'Create a stream to send any ERC-20 to any Ethereum address.'
    : "This user isn't yet streaming any funds.";

  interface OutgoingStreamTableRow {
    streamId: string;
    name: NameAndBadgeCellProps;
    to: NFTDriverAccount | AddressDriverAccount;
    amount: AmountCellData;
    token: TokenCellData;
  }

  interface IncomingStreamTableRow {
    streamId: string;
    name: NameAndBadgeCellProps;
    from: AddressDriverAccount;
    amount: AmountCellData;
    token: TokenCellData;
  }

  let outgoingTableData: OutgoingStreamTableRow[] = [];
  let incomingTableData: IncomingStreamTableRow[] = [];

  let ownStreams: ReturnType<typeof streams.getStreamsForUser> = { outgoing: [], incoming: [] };

  function updateTable() {
    ownStreams = accountId ? streams.getStreamsForUser(accountId) : { outgoing: [], incoming: [] };

    // filter by tokenAddress ?
    if (tokenAddress) {
      const byToken = (stream: Stream) =>
        stream.streamConfig.amountPerSecond.tokenAddress.toLowerCase() ===
        tokenAddress?.toLowerCase();
      ownStreams = {
        outgoing: ownStreams.outgoing.filter(byToken),
        incoming: ownStreams.incoming.filter(byToken),
      };
    }

    // if onlyDripListStreams, filter all streams not going to an nft receiver
    if (onlyDripListStreams) {
      const isNFTReceiver = (stream: Stream) => stream.receiver.driver === 'nft';
      ownStreams.outgoing = ownStreams.outgoing.filter(isNFTReceiver);
    }

    outgoingTableData = mapFilterUndefined(ownStreams.outgoing, (stream) => {
      const estimate = balances.getEstimateByStreamId(stream.id);
      if (!estimate) return undefined;

      const { tokenAddress } = stream.streamConfig.amountPerSecond;

      // TODO: Don't presume that any stream to an NFT subaccount is going to a Drip List.
      const streamName =
        stream.receiver.driver === 'nft'
          ? 'Drip List Support Stream'
          : stream.name ?? 'Unnamed stream';

      return {
        streamId: stream.id,
        name: {
          name: streamName,
          streamId: stream.id,
          paused: stream.paused,
          durationSeconds: stream.streamConfig.durationSeconds,
          startDate: stream.streamConfig.startDate,
          senderId: stream.sender.accountId,
          tokenAddress: tokenAddress,
        },
        to: stream.receiver,
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

      const { tokenAddress } = stream.streamConfig.amountPerSecond;

      return {
        streamId: stream.id,
        name: {
          name: stream.name ?? 'Unnamed stream',
          streamId: stream.id,
          paused: stream.paused,
          durationSeconds: stream.streamConfig.durationSeconds,
          startDate: stream.streamConfig.startDate,
          senderId: stream.sender.accountId,
          tokenAddress: tokenAddress,
        },
        from: stream.sender,
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

  $: {
    accountId;
    $balances;
    updateTable();
  }

  onMount(updateTable);

  const outgoingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: () => NameAndBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'to',
      header: 'To',
      cell: () => UserBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'amount',
      header: 'Total streamed',
      cell: () => AmountCell,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
      size: (100 / 24) * 2,
    },
    {
      accessorKey: 'chevron',
      header: '',
      cell: () => ChevronRightCell,
      enableSorting: false,
      size: (100 / 24) * 2,
    },
  ];

  const incomingTableColumns: ColumnDef<OutgoingStreamTableRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: () => NameAndBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 8,
    },
    {
      accessorKey: 'from',
      header: 'From',
      cell: () => UserBadgeCell,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'amount',
      header: 'Received',
      cell: () => AmountCell,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => TokenCell,
      enableSorting: false,
      size: (100 / 24) * 2,
    },
    {
      accessorKey: 'chevron',
      header: '',
      cell: () => ChevronRightCell,
      enableSorting: false,
      size: (100 / 24) * 2,
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

  // As soon as the given account has been fetched at least once, display content.
  let loaded = false;
  $: if (
    accountId &&
    ['error', 'fetched'].includes($accountFetchStatussesStore[accountId]?.all ?? '')
  ) {
    loaded = true;
  }

  $: error = Boolean(accountId && $accountFetchStatussesStore[accountId]?.all === 'error');
  $: empty =
    (onlyDripListStreams || ownStreams.incoming.length === 0) && ownStreams.outgoing.length === 0;

  function onRowClick(
    tableData: OutgoingStreamTableRow[] | IncomingStreamTableRow[],
    event: CustomEvent<RowClickEventPayload>,
  ) {
    // go to token page by address
    const streamId = tableData[event.detail.rowIndex].streamId;
    const parsedId = decodeStreamId(streamId);

    onClickGoto(
      `/app/${parsedId.senderAccountId}/tokens/${parsedId.tokenAddress}/streams/${parsedId.dripId}`,
      event.detail.event,
    );
  }
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    infoTooltip,
    icon: TokenStreamIcon,
    label: onlyDripListStreams ? 'Streams to your Drip List' : 'Streams',
    actionsDisabled: !loaded,
    actions: disableActions
      ? []
      : [
          {
            handler: () => modal.show(Stepper, undefined, createStreamFlowSteps(tokenAddress)),
            icon: PlusIcon,
            label: 'Create stream',
          },
        ],
  }}
  skeleton={{
    horizontalScroll: true,
    emptyStateEmoji: '🫙',
    emptyStateHeadline,
    emptyStateText,
    loaded,
    error,
    empty,
  }}
>
  {#if optionsIncoming.data.length > 0 && !onlyDripListStreams}
    <div class="table-container">
      {#if optionsOutgoing.data.length > 0}
        <h4 class="table-group-header">↓ Incoming</h4>
      {/if}
      <Table
        rowHeight={76}
        options={optionsIncoming}
        isRowClickable
        on:rowClick={(e) => onRowClick(incomingTableData, e)}
      />
    </div>
  {/if}
  {#if optionsOutgoing.data.length > 0}
    <div class="table-container">
      {#if !onlyDripListStreams && optionsIncoming.data.length > 0}
        <h4 class="table-group-header">↑ Outgoing</h4>
      {/if}
      <Table
        rowHeight={76}
        options={optionsOutgoing}
        isRowClickable
        on:rowClick={(e) => onRowClick(outgoingTableData, e)}
      />
    </div>
  {/if}
</Section>

<style>
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
    .table-group-header {
      margin-left: none;
    }
  }
</style>

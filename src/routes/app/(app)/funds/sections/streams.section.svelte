<script lang="ts" context="module">
  import { NAME_AND_BADGE_CELL_STREAM_FRAGMENT } from '$lib/components/table/cells/name-and-badge-cell.svelte';
  import { gql } from 'graphql-request';

  export const STREAMS_SECTION_STREAM_FRAGMENT = gql`
    ${NAME_AND_BADGE_CELL_STREAM_FRAGMENT}
    ${USER_BADGE_CELL_USER_FRAGMENT}
    ${USER_BADGE_CELL_DRIP_LIST_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    fragment StreamsSectionStream on Stream {
      ...NameAndBadgeCellStream
      receiver {
        ... on User {
          ...UserBadgeCellUser
        }
        ... on DripList {
          ...UserBadgeCellDripList
        }
      }
      sender {
        ...UserBadgeCellUser
      }
      config {
        amountPerSecond {
          tokenAddress
        }
      }
      timeline {
        ...CurrentAmountsTimelineItem
      }
    }
  `;

  export const STREAMS_SECTION_STREAMS_FRAGMENT = gql`
    ${STREAMS_SECTION_STREAM_FRAGMENT}
    fragment StreamsSectionStreams on UserStreams {
      incoming {
        ...StreamsSectionStream
      }
      outgoing {
        ...StreamsSectionStream
      }
    }
  `;
</script>

<script lang="ts">
  import TokenStreamIcon from '$lib/components/icons/TokenStreams.svelte';
  import Table, { type RowClickEventPayload } from '$lib/components/table/table.svelte';
  import { getCoreRowModel, type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
  import UserBadgeCell, {
    USER_BADGE_CELL_DRIP_LIST_FRAGMENT,
    USER_BADGE_CELL_USER_FRAGMENT,
  } from '$lib/components/table/cells/user-badge.cell.svelte';
  import type { ComponentProps } from 'svelte';
  import NameAndBadgeCell from '$lib/components/table/cells/name-and-badge-cell.svelte';
  import ChevronRightCell from '$lib/components/table/cells/chevron-right-cell.svelte';
  import onClickGoto from '$lib/utils/on-click-goto';
  import createStreamFlowSteps from '$lib/flows/create-stream-flow/create-stream-flow-steps';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Section from '$lib/components/section/section.svelte';
  import tokens from '$lib/stores/tokens';
  import type { StreamsSectionStreamsFragment } from './__generated__/gql.generated';
  import { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
  import Token from '$lib/components/token/token.svelte';
  import RealtimeAmount from '$lib/components/amount/realtime-amount.svelte';
  import { CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT } from '$lib/flows/create-stream-flow/methods/current-amounts';
  import modal from '$lib/stores/modal';
  import PlusIcon from '$lib/components/icons/Plus.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';

  export let accountId: string | undefined;
  export let disableActions = true;
  export let tokenAddress: string | undefined = undefined;
  export let onlyDripListStreams = false;

  export let infoTooltip: string | undefined = undefined;

  export let collapsed = false;
  export let collapsable = false;

  export let hideIncoming = false;

  export let emptyStateHeadline = 'No streams';

  export let userStreams: StreamsSectionStreamsFragment;
  $: incoming = userStreams.incoming.filter((s) =>
    tokenAddress ? s.config.amountPerSecond.tokenAddress === tokenAddress : true,
  );
  $: outgoing = userStreams.outgoing.filter((s) =>
    tokenAddress ? s.config.amountPerSecond.tokenAddress === tokenAddress : true,
  );

  $: isSelf = accountId === $walletStore.dripsAccountId;

  $: token = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  $: emptyStateText = `${isSelf ? "You aren't" : "This user isn't"} streaming ${
    token?.info.name ? `any ${token.info.name}` : tokenAddress ? 'this token' : 'any tokens'
  }.`;

  interface OutgoingStreamTableRow {
    streamId: string;
    name: ComponentProps<NameAndBadgeCell>;
    to: ComponentProps<UserBadgeCell>;
    amount: ComponentProps<RealtimeAmount>;
    token: ComponentProps<Token>;
  }

  interface IncomingStreamTableRow {
    streamId: string;
    name: ComponentProps<NameAndBadgeCell>;
    from: ComponentProps<UserBadgeCell>;
    amount: ComponentProps<RealtimeAmount>;
    token: ComponentProps<Token>;
  }

  let outgoingTableData: OutgoingStreamTableRow[];
  $: outgoingTableData = outgoing.map((s) => ({
    name: {
      stream: s,
    },
    to: {
      userOrDripList: s.receiver,
    },
    token: {
      address: s.config.amountPerSecond.tokenAddress,
    },
    amount: {
      timeline: s.timeline,
      tokenAddress: s.config.amountPerSecond.tokenAddress,
    },
    streamId: s.id,
  }));

  let incomingTableData: IncomingStreamTableRow[];
  $: incomingTableData = incoming.map((s) => ({
    name: {
      stream: s,
    },
    from: {
      userOrDripList: s.sender,
    },
    token: {
      address: s.config.amountPerSecond.tokenAddress,
    },
    amount: {
      timeline: s.timeline,
      tokenAddress: s.config.amountPerSecond.tokenAddress,
    },
    streamId: s.id,
  }));

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
      cell: () => RealtimeAmount,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => Token,
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
      header: 'Total streamed',
      cell: () => RealtimeAmount,
      enableSorting: false,
      size: (100 / 24) * 5,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: () => Token,
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
    loaded: true,
    empty: incoming.length === 0 && outgoing.length === 0,
  }}
>
  {#if !hideIncoming && optionsIncoming.data.length > 0 && !onlyDripListStreams}
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
  }

  @media (max-width: 1024px) {
    .table-group-header {
      margin-left: none;
    }
  }
</style>

<script context="module" lang="ts">
  import type { StreamId } from '$lib/stores/streams/types';
  import type { CellContext } from '@tanstack/svelte-table';
  import { z } from 'zod';

  export interface NameAndBadgeCellProps {
    name: string;
    streamId: StreamId;
    paused: boolean;
    senderId: string;
    tokenAddress: string;
    startDate?: Date;
    durationSeconds?: number;
  }
</script>

<script lang="ts">
  import StreamStateBadge from '$lib/components/stream-state-badge/stream-state-badge.svelte';

  export let context: CellContext<unknown, unknown>;

  let props: NameAndBadgeCellProps;

  $: {
    const propsSchema = z.object({
      name: z.string(),
      streamId: z.string(),
      paused: z.boolean(),
      senderId: z.string(),
      tokenAddress: z.string(),
      startDate: z.date().optional(),
      durationSeconds: z.number().optional(),
    });

    props = propsSchema.parse(context.getValue());
  }
</script>

<div class="name-and-badge">
  <span class="typo-text-bold">
    {props.name}
  </span>
  <StreamStateBadge {...props} hideActive size="small" />
</div>

<style>
  .name-and-badge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    max-width: 24rem;
  }

  .name-and-badge span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

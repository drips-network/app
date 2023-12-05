<script context="module" lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import { z } from 'zod';

  export interface NameAndBadgeCellProps {
    name: string;
    streamId: string;
    streamPaused: boolean;
    streamSenderAccountId: string;
    streamTokenAddress: string;
    streamScheduledStart?: Date | undefined;
    streamDurationSeconds?: number | undefined;
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
      streamPaused: z.boolean(),
      streamSenderAccountId: z.string(),
      streamTokenAddress: z.string(),
      streamScheduledStart: z.date().optional(),
      streamDurationSeconds: z.number().optional(),
    });

    props = propsSchema.parse(context.getValue());
  }
</script>

<div class="name-and-badge">
  <span class="typo-text">
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

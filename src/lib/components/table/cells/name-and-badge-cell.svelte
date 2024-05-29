<script context="module" lang="ts">
  import { STREAM_STATE_BADGE_STREAM_FRAGMENT } from "$lib/components/stream-state-badge/stream-state-badge.svelte";
  import { gql } from "graphql-request";

  export const NAME_AND_BADGE_CELL_STREAM_FRAGMENT = gql`
    ${STREAM_STATE_BADGE_STREAM_FRAGMENT}
    fragment NameAndBadgeCellStream on Stream {
      id
      name
      ...StreamStateBadgeStream
      receiver {
        ... on User {
          __typename
        }
        ... on DripList {
          __typename
        }
      }
    }
  `;
</script>

<script lang="ts">
  import StreamStateBadge from '$lib/components/stream-state-badge/stream-state-badge.svelte';
  import type { NameAndBadgeCellStreamFragment } from "./__generated__/gql.generated";

  export let stream: NameAndBadgeCellStreamFragment;
</script>

<div class="name-and-badge">
  <span class="typo-text">
    {#if stream.name}
      {stream.name}
    {:else if stream.receiver.__typename === 'DripList'}
      Continuous support
    {:else}
      Unnamed stream
    {/if}
  </span>
  <StreamStateBadge {stream} hideActive size="small" />
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

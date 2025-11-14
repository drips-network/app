<script lang="ts">
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Section from '../section/section.svelte';

  interface Props {
    collapsed?: boolean;
    collapsable?: boolean;
    children?: import('svelte').Snippet;
  }

  let { collapsed = $bindable(false), collapsable = $bindable(false), children }: Props = $props();

  let error = false;
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Trophy,
    label: 'Stats',
  }}
  skeleton={{
    loaded: true,
    empty: false,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No Stats',
    emptyStateText: 'We couldn’t find any stats for you.',
  }}
>
  <div class="stats">
    {@render children?.()}
  </div>
</Section>

<style>
  .stats {
    overflow: scroll;
    gap: 1.5rem;
    display: flex;
  }

  @media (max-width: 767px) {
    .stats {
      flex-direction: column;
    }
  }
</style>

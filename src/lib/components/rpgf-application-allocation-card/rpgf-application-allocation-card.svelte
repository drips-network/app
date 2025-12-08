<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import TitleAndValue from '../title-and-value/title-and-value.svelte';

  interface Props {
    allocation: number | null;
    resultsPublished: boolean;
  }

  let { allocation, resultsPublished }: Props = $props();

  // Up to two decimal places
  const normalizedAllocation = $derived(Math.round((allocation ?? 0) * 100) / 100);
</script>

{#if allocation !== null}
  <RpgfApplicationDetailsCard title="Result" key="result">
    <div class="content">
      {#if !resultsPublished}
        <AnnotationBox type="info">Results are not yet public.</AnnotationBox>
      {/if}

      <TitleAndValue title="Vote result">
        <h3 class="typo-header-3" style:font-weight="bold">{normalizedAllocation}</h3>
      </TitleAndValue>
    </div>
  </RpgfApplicationDetailsCard>
{/if}

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>

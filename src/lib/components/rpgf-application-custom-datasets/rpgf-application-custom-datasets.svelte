<script lang="ts">
  import type { Application } from '$lib/utils/rpgf/types/application';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import TitleAndValue from '../title-and-value/title-and-value.svelte';

  export let application: Application;
</script>

{#each application.customDatasetValues as dataset}
  <RpgfApplicationDetailsCard title={dataset.datasetName} key="custom-dataset-{dataset.datasetId}">
    <div class="fields" style:display="flex" style="flex-direction: column" style:gap="1rem">
      {#each Object.entries(dataset.values) as [fieldName, value]}
        <TitleAndValue title={fieldName}>
          {value ?? '—'}
        </TitleAndValue>
      {/each}
    </div>
  </RpgfApplicationDetailsCard>
{/each}

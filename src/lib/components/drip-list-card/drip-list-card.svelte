<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits, { type Splits as RepresentationalSplits } from '../splits/splits.svelte';

  export let dripList: DripList;
  export let representationalSplits: RepresentationalSplits;

  // TODO: Truncate the representational splits into a splits group after 4 items.
  // TODO: Display the support stream (if any) below the list after we add support for NFT accounts to the streams store.
  // TODO: Display the monthly stream amount on top of the list after we add support for NFT accounts to the streams store.
</script>

<div class="card">
  <div class="header">
    <h1>{dripList.name}</h1>
    <div class="actions">
      <Button icon={Pen}>Edit list</Button>
    </div>
  </div>
  <div class="list">
    <div class="drip-icon">
      <Drip />
    </div>
    <div class="splits-component"><Splits list={representationalSplits} /></div>
  </div>
</div>

<style>
  .card {
    border: 1px solid var(--color-foreground);
    padding: 1.5rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
  }

  .drip-icon {
    width: 1.5rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .splits-component {
    margin-left: 10px;
  }
</style>

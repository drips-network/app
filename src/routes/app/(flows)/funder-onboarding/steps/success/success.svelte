<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';

  let loading = false;

  async function viewDripList() {
    loading = true;

    await goto(`/app/drip-lists`).then(() => {
      loading = false;
    });
  }
</script>

<div class="center-div">
  {#if loading}
    <Spinner />
  {:else}
    <h4>Congratulations!</h4>
    <p>You've successfully created your Drip List.</p>
    <Button variant="primary" icon={ArrowBoxUpRight} on:click={viewDripList}
      >View your Drip List</Button
    >
  {/if}
</div>

<style>
  .center-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    min-height: 16rem;
  }
</style>

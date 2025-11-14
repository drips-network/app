<script>
  import Flyout from '../flyout.svelte';
</script>

<Flyout>
  {#snippet trigger()}
    <div >Trigger</div>
  {/snippet}
  {#snippet content()}
    <div >Content</div>
  {/snippet}
</Flyout>

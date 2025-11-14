<script lang="ts">
  import ApplicationsPane from '../shared/applications-pane.svelte';
  import ThreePaneLayout from '../shared/three-pane-layout.svelte';

  let { data, children } = $props();
</script>

<ThreePaneLayout {...data}>
  {#snippet apps()}
  
      <ApplicationsPane {...data} ballotStore={data.ballot} loggedIn={data.rpgfUserData !== null} />
    
  {/snippet}

  {@render children?.()}
</ThreePaneLayout>

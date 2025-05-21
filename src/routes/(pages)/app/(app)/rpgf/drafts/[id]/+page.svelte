<script lang="ts">
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';

  export let data;

  console.log(data.draft)
</script>

<RpgfHeaderCard 
  roundOrDraft={data.draft}
/>

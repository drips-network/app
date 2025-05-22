<script lang="ts">
  import { page } from '$app/stores';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';

  export let data;
</script>

<div class="page">
  <RpgfHeaderCard roundSlugOrDraftId={$page.params.id} isDraft roundOrDraft={data.draft} />

  {#if data.draft.description}
    <ExpandableText>
      <Markdown content={data.draft.description} />
    </ExpandableText>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

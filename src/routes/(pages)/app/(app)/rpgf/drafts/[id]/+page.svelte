<script lang="ts">
  import { page } from '$app/stores';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import RpgfDraftTodoCard from '$lib/components/rpgf-draft-todo-card/rpgf-draft-todo-card.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import RpgfBaseLayout from '../../components/rpgf-base-layout.svelte';

  export let data;
</script>

<div class="page">
  <RpgfBaseLayout>
    <svelte:fragment slot="sidebar">
      <RpgfDraftTodoCard draft={data.draft} draftId={$page.params.id} />
    </svelte:fragment>

    <svelte:fragment slot="header">
      <RpgfHeaderCard roundSlugOrDraftId={$page.params.id} isDraft roundOrDraft={data.draft} />
    </svelte:fragment>

    {#if data.draft.description}
      <ExpandableText>
        <Markdown content={data.draft.description} />
      </ExpandableText>
    {/if}
  </RpgfBaseLayout>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

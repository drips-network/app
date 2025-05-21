<script lang="ts">
  import { page } from "$app/stores";
  import RpgfDraftTodoCard from "$lib/components/rpgf-draft-todo-card/rpgf-draft-todo-card.svelte";
  import RpgfBaseLayout from "../../components/rpgf-base-layout.svelte";

  export let data;
</script>

<RpgfBaseLayout>
  <svelte:fragment slot="sidebar">
    <RpgfDraftTodoCard
      draft={data.draft}
      draftId={$page.params.id}
    />
  </svelte:fragment>
  <slot />
</RpgfBaseLayout>

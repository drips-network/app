<script lang="ts">
  export let data;
</script>

<h2>drafts</h2>
{#each data.drafts ?? [] as wrappedDraft}
  <a href="/app/rpgf/drafts/{wrappedDraft.id}" class="draft">
    <h3>{wrappedDraft.draft.name ?? 'Unnamed draft'}</h3>
  </a>
{/each}

<h2>rounds</h2>
{#each data.rounds ?? [] as wrappedRound}
  <a href="/app/rpgf/rounds/{wrappedRound.round.urlSlug}" class="draft">
    <h3>{wrappedRound.round.name ?? 'Unnamed round'}</h3>
  </a>
{/each}
